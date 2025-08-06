import React, { useState, useEffect, useRef } from 'react';
import '../styles/colours.css';
import '../styles/home.css';
import '../styles/create-session.css';
import '../styles/swiping.css';
import MatchOverlay from '../components/MatchOverlay';
import PostMatchOptions from '../components/PostMatchOptions';

const API_URL = process.env.REACT_APP_API_URL;

function SwipingScreen({ sessionId, onBack, onGoToMatches, ws }) {
  const [movies, setMovies] = useState([]);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showPostMatchOptions, setShowPostMatchOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [totalMoviesLoaded, setTotalMoviesLoaded] = useState(0);
  const [sessionPreferences, setSessionPreferences] = useState(null);
  const infoBtnRef = useRef(null);
  const infoPopupRef = useRef(null);
  const [matchedMovie, setMatchedMovie] = useState(null);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
 
  const groupCode = sessionId ? sessionId.slice(0, 4).toUpperCase() : '----';
  const progress = `${currentIndex + 1}/${totalMoviesLoaded > 0 ? totalMoviesLoaded : movies.length}${hasMoreMovies ? '+' : ''}`;

  // Fetch session details to get user preferences
  const fetchSessionPreferences = async () => {
    try {
      const response = await fetch(`${API_URL}/session/${sessionId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch session details');
      }
      
      setSessionPreferences(data);
      return data;
    } catch (err) {
      console.error('Error fetching session preferences:', err);
      return null;
    }
  };

  // Function to fetch a batch of movies
  const fetchMovieBatch = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Get session preferences 
      let preferences = sessionPreferences;
      if (!preferences) {
        preferences = await fetchSessionPreferences();
        if (!preferences) {
          throw new Error('Failed to get session preferences');
        }
      }

      // Build query parameters with session preferences
      const params = new URLSearchParams({
        session_id: sessionId,
        page: page.toString()
      });

      // Add genres from session preferences
      if (preferences.genres && preferences.genres.length > 0) {
        preferences.genres.forEach(genre => {
          params.append('genres', genre.toString());
        });
      }

      // Add providers from session preferences
      if (preferences.providers && preferences.providers.length > 0) {
        preferences.providers.forEach(provider => {
          params.append('providers', provider.toString());
        });
      }

      // Make API request with pagination and preferences
      const idsRes = await fetch(`${API_URL}/movie_ids?${params.toString()}`);
      const idsData = await idsRes.json();
      
      if (!idsRes.ok) {
        throw new Error(idsData.error || 'Failed to fetch movie IDs');
      }
      
      const movieIds = idsData.movie_ids || [];
      const hasMore = idsData.has_more || false;
      
      if (movieIds.length === 0) {
        setHasMoreMovies(false);
        return;
      }

      // Fetch detailed movie data for each ID
      const movieDetails = await Promise.all(
        movieIds.map(async (id) => {
          const res = await fetch(`${API_URL}/movies/${id}`);
          const data = await res.json();
          return data;
        })
      );

      if (append) {
        setMovies(prev => [...prev, ...movieDetails]);
        setTotalMoviesLoaded(prev => prev + movieDetails.length);
      } else {
        setMovies(movieDetails);
        setCurrentMovie(movieDetails[0] || null);
        setTotalMoviesLoaded(movieDetails.length);
      }
      
      setHasMoreMovies(hasMore);
      
    } catch (err) {
      console.error('Error fetching movies:', err);
      if (!append) {
        setMovies([]);
        setCurrentMovie(null);
      }
      setHasMoreMovies(false);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchMovieBatch(1, false);
  }, [sessionId]);

  // Load more movies when approaching the end
  useEffect(() => {
    const shouldLoadMore = 
      hasMoreMovies && 
      !loadingMore && 
      currentIndex >= movies.length - 5 && // Load when 5 movies remaining
      movies.length > 0;

    if (shouldLoadMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchMovieBatch(nextPage, true);
    }
  }, [currentIndex, movies.length, hasMoreMovies, loadingMore, currentPage]);

  const handleAction = async (action) => {
    if (isTransitioning) return;
    
    // Check if we've reached the end of loaded movies
    if (currentIndex >= movies.length - 1) {
      if (!hasMoreMovies) {
        return; // No more movies available
      }
      // If we have more movies but they're still loading, wait
      if (loadingMore) {
        return;
      }
    }
    
    setIsTransitioning(true);
    if (action === 'like') {
      setLikeAnimation(true);
    } else if (action === 'skip') {
      setSkipAnimation(true);
    }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      if (nextIndex < movies.length) {
        setCurrentMovie(movies[nextIndex]);
      } else if (hasMoreMovies && loadingMore) {
        // Show loading state while waiting for more movies
        setCurrentMovie(null);
      }
      
      setIsTransitioning(false);
      setLikeAnimation(false);
      setSkipAnimation(false);
    }, 300);
  };

  // Close info popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        infoPopupRef.current &&
        !infoPopupRef.current.contains(event.target) &&
        infoBtnRef.current &&
        !infoBtnRef.current.contains(event.target)
      ) {
        setShowInfo(false);
      }
    }
    if (showInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfo]);

  // WebSocket message handler - listens for matches
  // and updates matched movie state
  useEffect(() => {
    if (!ws) return;
  
    const handleMessage = (event) => {
      try {
        console.log('WebSocket message received:', event.data);
        
        const data = JSON.parse(event.data);
        setMatchedMovie(data);
        setShowMatch(true);
      
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
  
    ws.onmessage = handleMessage;
  
    return () => {
      ws.onmessage = null; // Clean up on unmount
    };
  }, [ws]);
  

  // Like button handler: // Send like action to server
  const handleLikeClick = async () => {
    const response = await fetch(`${API_URL}/movies/like/${currentMovie.id}?session_id=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to join session');
    }
    handleAction('like');

  };

  // When overlay closes, show post-match options instead of swiping immediately
  const handleMatchOverlayClose = () => {
    setShowMatch(false);
    setShowPostMatchOptions(true);
  };

  // Handle post-match decision
  const handleKeepSwiping = () => {
    setShowPostMatchOptions(false);
    // Now swipe to next movie
    handleAction('like');
  };

  const handleGoToMatches = () => {
    setShowPostMatchOptions(false);
    // Navigate to matches screen
    onGoToMatches && onGoToMatches();
  };

  if (loading) {
    return (
      <div className="app">
      {/* Background elements */}
      <div className="bg-elements">
        <div className="movie-icon movie-icon-1">🎭</div>
        <div className="movie-icon movie-icon-2">🍿</div>
        <div className="movie-icon movie-icon-3">🎬</div>
        <div className="movie-icon movie-icon-4">📺</div>
        <div className="movie-icon movie-icon-5">🎪</div>
      </div>

      <nav className="navbar">
        <a href="#" className="logo">MoviePicker</a>
        <div className="navbar-right">
          <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
          <button onClick={onBack} className="btn-back">
            ← Back to Home
          </button>
        </div>
      </nav>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          textAlign: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #6C6CE8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#23263B',
              marginBottom: '8px'
            }}>
              🎬 Curating Your Movie Selection
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              maxWidth: '400px',
              lineHeight: '1.5'
            }}>
              We're finding the perfect movies based on your preferences. Get ready to discover your next favorite film!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle case when waiting for more movies to load
  if (!currentMovie && loadingMore) {
    return (
      <div className="app">
      {/* Background elements */}
      <div className="bg-elements">
        <div className="movie-icon movie-icon-1">🎭</div>
        <div className="movie-icon movie-icon-2">🍿</div>
        <div className="movie-icon movie-icon-3">🎬</div>
        <div className="movie-icon movie-icon-4">📺</div>
        <div className="movie-icon movie-icon-5">🎪</div>
      </div>

      <nav className="navbar">
        <a href="#" className="logo">MoviePicker</a>
        <div className="navbar-right">
          <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
          <button onClick={onBack} className="btn-back">
            ← Back to Home
          </button>
        </div>
      </nav>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          textAlign: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #6C6CE8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#23263B',
              marginBottom: '8px'
            }}>
              🍿 Fetching More Great Movies
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              maxWidth: '400px',
              lineHeight: '1.5'
            }}>
              Loading fresh recommendations just for you. Almost ready!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show no more movies only when we've truly exhausted all available movies
  if (!currentMovie && !hasMoreMovies && currentIndex >= movies.length) {
    return (
      <div className="app">
      {/* Background elements */}
      <div className="bg-elements">
        <div className="movie-icon movie-icon-1">🎭</div>
        <div className="movie-icon movie-icon-2">🍿</div>
        <div className="movie-icon movie-icon-3">🎬</div>
        <div className="movie-icon movie-icon-4">📺</div>
        <div className="movie-icon movie-icon-5">🎪</div>
      </div>

      <nav className="navbar">
        <a href="#" className="logo">MoviePicker</a>
        <div className="navbar-right">
          <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
          <button onClick={onBack} className="btn-back">
            ← Back to Home
          </button>
        </div>
      </nav>
        
          <h2>No more movies to show!</h2>
          <p>You've gone through all available movies for this session.</p>
        
      </div>
    );
  }

  // If we don't have a current movie but should have one, something went wrong
  if (!currentMovie) {
    return (
      <div className="app">
      {/* Background elements */}
      <div className="bg-elements">
        <div className="movie-icon movie-icon-1">🎭</div>
        <div className="movie-icon movie-icon-2">🍿</div>
        <div className="movie-icon movie-icon-3">🎬</div>
        <div className="movie-icon movie-icon-4">📺</div>
        <div className="movie-icon movie-icon-5">🎪</div>
      </div>

      <nav className="navbar">
        <a href="#" className="logo">MoviePicker</a>
        <div className="navbar-right">
          <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
          <button onClick={onBack} className="btn-back">
            ← Back to Home
          </button>
        </div>
      </nav>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          textAlign: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #6C6CE8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#23263B',
              marginBottom: '8px'
            }}>
              🎭 Preparing Your Next Pick
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              maxWidth: '400px',
              lineHeight: '1.5'
            }}>
              Setting up your next movie recommendation. This won't take long!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback gradient if no poster
  const posterUrl = currentMovie.poster_path
    ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`
    : undefined;

  return (
    <div className="app">
      {/* Background elements */}
      <div className="bg-elements">
        <div className="movie-icon movie-icon-1">🎭</div>
        <div className="movie-icon movie-icon-2">🍿</div>
        <div className="movie-icon movie-icon-3">🎬</div>
        <div className="movie-icon movie-icon-4">📺</div>
        <div className="movie-icon movie-icon-5">🎪</div>
      </div>

      <nav className="navbar">
        <a href="#" className="logo">MoviePicker</a>
        <div className="navbar-right">
          <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
          <button onClick={onBack} className="btn-back">
            ← Back to Home
          </button>
        </div>
      </nav>

      
            
      <main className="main-content swipe-container">
        <div className="movie-card-container">
          <div className={`movie-card ${likeAnimation ? 'like-animation' : ''} ${skipAnimation ? 'skip-animation' : ''}`}>
            {/* Movie Poster Section */}
            <div className="movie-poster-section">
              <div className="poster-container">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={currentMovie.title}
                    className="poster-image"
                  />
                ) : (
                  <div className="poster-placeholder">
                    <span className="poster-icon">🎬</span>
                  </div>
                )}
                
                {/* Rating Badge */}
                {currentMovie.vote_average && (
                  <div className="rating-badge">
                    <span className="rating-star">⭐</span>
                    <span className="rating-value">{currentMovie.vote_average.toFixed(1)}</span>
                  </div>
                )}

                {/* Genre Tags */}
                <div className="genre-tags">
                  {currentMovie.genres && currentMovie.genres.slice(0, 3).map(genre => (
                    <span key={genre.id || genre} className="genre-tag">
                      {genre.name || genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

           {/* Movie Info Section */}
           <div className="movie-info-section">
              <div className="movie-header">
                <h2 className="movie-title">{currentMovie.title}</h2>
                {currentMovie.release_date && (
                  <span className="movie-year">
                    {new Date(currentMovie.release_date).getFullYear()}
                  </span>
                )}
              </div>

              <p className="movie-description">{currentMovie.overview}</p>

              {/* Watch Trailer Button */}
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentMovie.title + ' trailer')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="trailer-button"
              >
                <div className="play-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.1" />
                    <polygon points="10,8 16,12 10,16" fill="currentColor" />
                  </svg>
                </div>
                <span>Watch Trailer</span>
              </a>
            </div>
          </div>

        {/* Action Buttons */}
        <div className="action-buttons">
            <button
              className="action-btn skip-btn"
              onClick={() => handleAction('skip')}
              disabled={isTransitioning}
              aria-label="Skip"
            >
              <span className="action-icon">✕</span>
              <span className="action-label">Skip</span>
            </button>

            <div className="info-container">
              <button
                ref={infoBtnRef}
                className="action-btn info-btn"
                onClick={() => setShowInfo(!showInfo)}
                disabled={isTransitioning}
                aria-label="More info"
              >
                <span className="action-icon">ℹ️</span>
                <span className="action-label">Info</span>
              </button>

              {showInfo && (
                <div ref={infoPopupRef} className="info-popup">
                  <div className="info-popup-header">
                    <h3>{currentMovie.title}</h3>
                    <button 
                      className="close-popup"
                      onClick={() => setShowInfo(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="info-popup-content">
                    <p>{currentMovie.overview}</p>
                    {currentMovie.vote_average && (
                      <div className="popup-rating">
                        <span>⭐ {currentMovie.vote_average.toFixed(1)}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              className="action-btn like-btn"
              onClick={handleLikeClick}
              disabled={isTransitioning}
              aria-label="Like"
            >
              <span className="action-icon">❤️</span>
              <span className="action-label">Like</span>
            </button>
          </div>
        </div>
      </main>

      
      {/* Enhanced loading indicator when loading more movies in background */}
      {loadingMore && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>🎬 Discovering more movies for you...</span>
        </div>
      )}
      
      {showMatch && <MatchOverlay
        open={showMatch}
        onClose={handleMatchOverlayClose}
        image={matchedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${matchedMovie.poster_path}` : undefined}
        title={matchedMovie.title}
        genres={matchedMovie.genres ? matchedMovie.genres.map(g => g.name || g) : []}
        description={matchedMovie.overview}
        matchPercent={100}
        peopleLiked={'1/4'}
        onAddToMatches={() => {/* your logic */}}
      />
      }


      <PostMatchOptions
        open={showPostMatchOptions}
        onKeepSwiping={handleKeepSwiping}
        onGoToMatches={handleGoToMatches}
      />
    </div>
  );
}

export default SwipingScreen; 