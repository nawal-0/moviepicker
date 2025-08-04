import uuid, datetime, secrets, string
from random import randint
from flask import Blueprint, jsonify, request
from functools import wraps

from moviepicker.utils.emit_movie_match.invoke_lambda import invoke_match_broadcast_lambda
from moviepicker.models import db
from moviepicker.models.session import Session, SessionMovie, WebsocketSession
from moviepicker.models.tmdb_api.api_enums import Genre, Provider, WatchRegion, Language
from moviepicker.models.tmdb_api.tmdb_client import TMDBClient

tmdb_client = TMDBClient()

api = Blueprint('api', __name__, url_prefix='/api/v1')

@api.route('/health')
def health():
    """ Check the health of the API """
    return jsonify({'status': 'ok'})

# ----- Movie API Endpoints ----
@api.route('/movie_ids', methods=['GET'])
def get_movie_ids():
    """Retrieve only movie IDs (20 per page) and store them in SessionMovie for the given session."""
    try:
        # Check there are no extra query parameters
        if not set(request.args.keys()).issubset(set(('session_id', 'page', 'genres', 'providers', 'region', 'language'))):
            return jsonify({'error': 'Invalid query parameters entered.'}), 400        

        # Get query parameters
        session_id = request.args.get('session_id')
        session = Session.query.get(session_id)
        if not session:
            return jsonify({"error": f"Session ID {session_id} not found"}), 404

        page = int(request.args.get('page', 1)) # Default to page 1 = 20 movies
        genres = request.args.getlist('genres')
        providers = request.args.getlist('providers')
        region = request.args.get('region', 'AUSTRALIA')
        language = request.args.get('language', 'ENGLISH')

        # Convert to enum values
        genre_enums = []
        for g in genres:
            try:
                # Try to convert genre ID to Genre enum
                genre_id = int(g)
                for genre_enum in Genre:
                    if genre_enum.value == genre_id:
                        genre_enums.append(genre_enum)
                        break
            except (ValueError, TypeError):
                continue

        provider_enums = []
        for p in providers:
            try:
                # Try to convert provider ID to Provider enum
                provider_id = int(p)
                for provider_enum in Provider:
                    if provider_enum.value == provider_id:
                        provider_enums.append(provider_enum)
                        break
            except (ValueError, TypeError):
                continue

        region_enum = WatchRegion[region.upper()] if region.upper() in WatchRegion.__members__ else WatchRegion.AUSTRALIA
        language_enum = Language[language.upper()] if language.upper() in Language.__members__ else Language.ENGLISH

        # Get full movie data (including pagination metadata)
        movies_response = tmdb_client.get_movies(
            page=page,
            genres=genre_enums,
            providers=provider_enums,
            watch_region=region_enum,
            language=language_enum
        )

        # Extract movie IDs from the response
        movie_ids = [movie["id"] for movie in movies_response.get("results", [])]
        
        # Get pagination info
        current_page = movies_response.get("page", page)
        total_pages = movies_response.get("total_pages", 1)
        has_more = current_page < total_pages

        # Store only movie IDs in SessionMovie db
        for movie_id in movie_ids:
            exists = SessionMovie.query.filter_by(session_id=session_id, movie_id=str(movie_id)).first()
            if not exists:
                db.session.add(SessionMovie(session_id=session_id, movie_id=str(movie_id), match_count=0))

        db.session.commit()
        
        return jsonify({
            "movie_ids": movie_ids,
            "page": current_page,
            "total_pages": total_pages,
            "has_more": has_more,
            "total_results": movies_response.get("total_results", len(movie_ids))
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@api.route('/movies/<movie_id>', methods=['GET'])
def get_movie(movie_id):
    """ Retrieve a specific movie by ID from TMDB"""
    try:        
        movie = tmdb_client.get_id_data(movie_id)
        if not movie:
            return jsonify({"error": "Movie not found"}), 404

        return jsonify(movie), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# ----- Session API Endpoints ----
@api.route('/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """ Get session info """
    try:
        # Validate session ID
        session = Session.query.get(session_id)
        if not session:
            return jsonify({"error": f"Session ID {session_id} not found"}), 404

        # Get session details
        session_info = {
            'session_id': session.session_id,
            'display_id': session.display_id,
            'match_threshold': session.match_threshold,
            'total_user': session.total_user,
            'genres': session.genres,
            'providers': session.providers
        }

        return jsonify(session_info), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/session', methods=['POST'])
def create_session():
    """ Create a new session ID - pass in genres, providers and match threshold in the JSON body"""
    try:          
        session_id = str(uuid.uuid4())

        # Generate display ID as a random 4-digit integer
        display_id = None
        while True:

            id_length = 4
            rand_id = ''.join(secrets.choice(string.ascii_letters + string.digits) for i in range(4) )
            rand_id = rand_id.upper()

            rand_int = randint(1000, 9999)

            id_exists = Session.query.filter_by(display_id=rand_id).first()
            if not id_exists:
                display_id = rand_id
                break
        
        # Validate match threshold
        match_threshold = request.json.get('match_threshold', 1.0) # Default to 1 (i.e. 100% match)
        if match_threshold < 0 or match_threshold > 1:
            return jsonify({"error": "Match threshold must be between 0 and 1"}), 400

        total_user = 1 # Start with 1 user and this increment as users join

        genres = request.json.get('genres', [])
        providers = request.json.get('providers', [])

        # Validate genres and providers
        valid_genre_values = [e.value for e in Genre]
        valid_provider_values = [e.value for e in Provider]
        genres = [int(g) for g in genres if int(g) in valid_genre_values]
        providers = [int(p) for p in providers if int(p) in valid_provider_values]

        # Create expiry time of 5 minutes from session creation.
        expiry_time = datetime.datetime.now() + datetime.timedelta(minutes=5)

        new_session = Session(
            session_id=session_id,
            display_id=display_id,
            match_threshold=match_threshold,
            total_user=total_user,
            genres=genres,
            providers=providers,
            expiry_time=expiry_time
        )

        db.session.add(new_session)
        db.session.commit()

        return jsonify({
            'session_id': session_id,
            'display_id': display_id,
            'match_threshold': match_threshold,
            'total_user': total_user,
            'genres': genres,
            'providers': providers,
            'expiry_time': expiry_time
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@api.route('/session/<display_id>', methods=['POST'])
def join_session(display_id):
    """ Join an existing session """
    try:
        # Validate display ID
        session = Session.query.filter_by(display_id=display_id).first()
        if not session:
            return jsonify({"error": f"Display ID {display_id} not found"}), 404
        
        session_id = session.session_id

        current_time = datetime.datetime.now()
        expiry_time = session.expiry_time

        if current_time > expiry_time:
            return jsonify({'error': 'This session has expired.'}), 500

        # Increment total user count
        session.total_user += 1
        db.session.commit()

        return jsonify({'message': 'Successfully joined the session', 'session_id': session_id, 'total_user': session.total_user}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@api.route('/session/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """ Delete a session """
    try:
        # Validate session ID
        session = Session.query.get(session_id)
        if not session:
            return jsonify({"error": f"Session ID {session_id} not found"}), 404

        # Delete the session
        db.session.delete(session)
        db.session.commit()

        return jsonify({'message': 'Session deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@api.route('/session/leave/<session_id>', methods=['PUT'])
def leave_session(session_id):
    """ Leave a session """
    try:
        # Validate session ID
        session = Session.query.get(session_id)
        if not session:
            return jsonify({"error": f"Session ID {session_id} not found"}), 404

        # Decrement total user count
        if session.total_user > 0:
            session.total_user -= 1
            db.session.commit()
            return jsonify({'message': 'Successfully left the session', 'session_id': session_id, 'total_user': session.total_user}), 200
        
        else:
            return jsonify({'error': 'No users left in the session'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/movies/like/<movie_id>', methods=['POST'])
def like_movie(movie_id):
    """ Like a movie and incremenet the match count for that movie in the session """
    try:
        # Validate session ID
        session_id = request.args.get('session_id')
        session = Session.query.get(session_id)
        if not session:
            return jsonify({"error": f"Session ID {session_id} not found"}), 404
        
        # Validate movie ID
        movie = SessionMovie.query.filter_by(session_id=session_id, movie_id=movie_id).first()
        if not movie:
            return jsonify({"error": f"Movie ID {movie_id} not found in session {session_id}"}), 404
        
        # Increment match count for the movie
        movie.match_count += 1
        db.session.commit()

        # Check if the movie is a match
        if check_match(session_id, movie_id):
            invoke_match_broadcast_lambda(session_id, movie_id)

        return jsonify({'message': 'Movie liked successfully', 'movie_id': movie_id, 'session_id': session_id, 'match_count': movie.match_count}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Helper functions
def check_match(session_id, movie_id):
    """ Check if a movie is a match for the session """
    try:
        # Validate session ID
        session = Session.query.get(session_id)
        if not session:
            return False

        # Get the movie
        movie = SessionMovie.query.filter_by(session_id=session_id, movie_id=movie_id).first()
        if not movie:
            return False

        # Check if there is a match
        if movie.match_count >= (session.match_threshold * session.total_user):
            return True
        else:
            return False
        
    except Exception as e:
        return False

@api.route('/websocket/session/<session_id>', methods=['GET'])
def get_ws_connections(session_id):
    """ Get all WebSocket connections for a session """
    try:
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400

        connections = WebsocketSession.query.filter_by(session_id=session_id).all()
        if not connections:
            return jsonify({"message": "No WebSocket connections found for this session"}), 404

        connection_list = [conn.socket_id for conn in connections]
        return jsonify(connection_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api.route('/session/<session_id>/matches', methods=['GET'])
def get_session_matches(session_id):
    """ Get all matched movies for a session """
    try:
        # Validate session ID
        session = Session.query.get(session_id)
        if not session:
            return jsonify({"error": f"Session ID {session_id} not found"}), 404

        # Get all movies in this session that have reached match threshold
        session_movies = SessionMovie.query.filter_by(session_id=session_id).all()
        matches = []
        
        # Debug info
        print(f"Session {session_id} - Total users: {session.total_user}, Match threshold: {session.match_threshold}")
        print(f"Required matches for threshold: {session.match_threshold * session.total_user}")
        
        # For testing, let's temporarily lower the threshold to 1 user (instead of percentage)
        # This will help us see if movies are being liked at all
        required_matches = max(1, int(session.match_threshold * session.total_user))
        print(f"Adjusted required matches: {required_matches}")
        
        for session_movie in session_movies:
            print(f"Movie {session_movie.movie_id} has {session_movie.match_count} matches")
            
            # Check if this movie is a match (using adjusted threshold)
            if session_movie.match_count >= required_matches:
                # Get movie details from TMDB
                movie_details = tmdb_client.get_id_data(session_movie.movie_id)
                if movie_details:
                    # Calculate match percentage
                    match_percentage = int((session_movie.match_count / session.total_user) * 100)
                    
                    matches.append({
                        'id': session_movie.movie_id,
                        'title': movie_details.get('title', 'Unknown'),
                        'year': int(movie_details.get('release_date', '0000-01-01')[:4]) if movie_details.get('release_date') else None,
                        'genres': movie_details.get('genres', []),
                        'overview': movie_details.get('overview', ''),
                        'poster_path': movie_details.get('poster_path'),
                        'match_percentage': match_percentage,
                        'match_count': session_movie.match_count,
                        'total_users': session.total_user,
                        'voted_by': f"{session_movie.match_count}/{session.total_user}"
                    })

        print(f"Found {len(matches)} matches")
        
        return jsonify({
            'matches': matches,
            'session_id': session_id,
            'total_matches': len(matches)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/session/<session_id>/debug', methods=['GET'])
def debug_session(session_id):
    """ Debug endpoint to see all movies and their match counts in a session """
    try:
        # Validate session ID
        session = Session.query.get(session_id)
        if not session:
            return jsonify({"error": f"Session ID {session_id} not found"}), 404

        # Get all movies in this session
        session_movies = SessionMovie.query.filter_by(session_id=session_id).all()
        
        movies_debug = []
        for session_movie in session_movies:
            # Get basic movie info
            movie_details = tmdb_client.get_id_data(session_movie.movie_id)
            title = movie_details.get('title', 'Unknown') if movie_details else 'Unknown'
            
            movies_debug.append({
                'movie_id': session_movie.movie_id,
                'title': title,
                'match_count': session_movie.match_count,
                'is_match': session_movie.match_count >= (session.match_threshold * session.total_user)
            })

        return jsonify({
            'session_id': session_id,
            'total_users': session.total_user,
            'match_threshold': session.match_threshold,
            'required_matches': session.match_threshold * session.total_user,
            'movies': movies_debug,
            'total_movies': len(movies_debug)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
