from moviepicker.models.tmdb_api.api_enums import Genre, Provider, WatchRegion, Language
import requests

class TMDBClient():
    API_KEY = "f8103f29010c0d442dc5a33956b50c91"
    BASE_URL = "https://api.themoviedb.org/3/discover/movie"
    RETRIEVE_BASE_URL = "https://api.themoviedb.org/3/movie/"

    """
    Get all data for a cache of 20 movies
    """
    def get_movies(self, page = 1, genres = [], providers = [], watch_region = WatchRegion.AUSTRALIA, 
                   sort_by = 'popularity.desc', language = Language.ENGLISH):
        for genre in genres:
            if not isinstance(genre, Genre):
                raise ValueError(f"Invalid Genre: {genre}")
        genre_ids = ",".join(str(g.value) for g in genres)

        for provider in providers:
            if not isinstance(provider, Provider):
                raise ValueError(f"Invalid Provider: {provider}")
        provider_ids = "|".join(str(p.value) for p in providers)
            
        if not isinstance(watch_region, WatchRegion):
            watch_region = WatchRegion.AUSTRALIA
        
        if not isinstance(language, Language):
            language = Language.ENGLISH
        
        params = {
            "api_key": self.API_KEY,
            "watch_region": watch_region.value, 
            "sort_by": sort_by,
            "page": page, # one page is 20 results
            "language": language.value
        }
        if genre_ids:
            params["with_genres"] = genre_ids
        if provider_ids:
            params["with_watch_providers"] = provider_ids

        response = requests.get(self.BASE_URL, params=params)
        return response.json()
    
    """
    Get movie ids of the 20 searched movies
    """
    def get_movie_ids(self, page = 1, genres = [], providers = [], watch_region = WatchRegion.AUSTRALIA, 
                   sort_by = 'popularity.desc', language = Language.ENGLISH):
        movies = self.get_movies(page, genres, providers, watch_region, sort_by, language)
        return [movie["id"] for movie in movies["results"]]
    
    
    """
    Retrieve date of specific movie
    Data Fields
        id
        title
        overview
        tagline
        release_date
        poster_path (image poster location with poster_image.jpg https://image.tmdb.org/t/p/w500)
        genres (list of genre objects)
        runtime
        popularity
        vote_average
    """
    def get_id_data(self, id, language = Language.ENGLISH):
        detail_url = self.RETRIEVE_BASE_URL + str(id)
        detail_params = {
            "api_key": self.API_KEY,
            "language": language
        }

        detail_response = requests.get(detail_url, params = detail_params)
        return detail_response.json()