import React, { useState, useEffect, useRef } from 'react';
import '../Login.css';
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
    const card = document.querySelector('.swipe-card-visual');
    card?.classList.add(action === 'like' ? 'swipe-right' : action === 'maybe' ? 'swipe-maybe' : 'swipe-left');
    
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
      card?.classList.remove('swipe-right', 'swipe-left', 'swipe-maybe');
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
      <div className="swipe-bg-visual">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 100 100">
                <polygon points="30,25 75,50 30,75" fill="#fff" />
              </svg>
            </div>
            <span className="app-name">MoviePicker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
            <button 
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: '#6C6CE8',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="#6C6CE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          </div>
        </header>
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
      <div className="swipe-bg-visual">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 100 100">
                <polygon points="30,25 75,50 30,75" fill="#fff" />
              </svg>
            </div>
            <span className="app-name">MoviePicker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
            <button 
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: '#6C6CE8',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="#6C6CE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          </div>
        </header>
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
      <div className="swipe-bg-visual">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 100 100">
                <polygon points="30,25 75,50 30,75" fill="#fff" />
              </svg>
            </div>
            <span className="app-name">MoviePicker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
            <button 
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: '#6C6CE8',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="#6C6CE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          </div>
        </header>
        <div className="no-more-movies">
          <h2>No more movies to show!</h2>
          <p>You've gone through all available movies for this session.</p>
          <button className="back-button" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // If we don't have a current movie but should have one, something went wrong
  if (!currentMovie) {
    return (
      <div className="swipe-bg-visual">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 100 100">
                <polygon points="30,25 75,50 30,75" fill="#fff" />
              </svg>
            </div>
            <span className="app-name">MoviePicker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
            <button 
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: '#6C6CE8',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 19l-7-7 7-7" stroke="#6C6CE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          </div>
        </header>
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
    <div className="swipe-bg-visual">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 100 100">
              <polygon points="30,25 75,50 30,75" fill="#fff" />
            </svg>
          </div>
          <span className="app-name">MoviePicker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#23263B', fontWeight: 500, fontSize: '1rem', marginRight: '24px' }}>{progress}</span>
          <button 
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#6C6CE8',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="#6C6CE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>
      </header>
      <div className="swipe-main-row-visual">
        <div className="swipe-card-visual">
          <div className="swipe-poster-container-visual">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={currentMovie.title}
                className="swipe-poster-img-visual"
              />
            ) : (
              <div className="swipe-poster-gradient-visual" />
            )}
            <div className="swipe-genre-tags-visual">
              {currentMovie.genres && currentMovie.genres.slice(0, 2).map(genre => (
                <span key={genre.id || genre} className="swipe-genre-tag-visual">{genre.name || genre}</span>
              ))}
            </div>
          </div>
          <div className="swipe-movie-info-visual">
            <div className="swipe-title-row-visual">
              <span className="swipe-movie-title-visual">{currentMovie.title}</span>
              <span className="swipe-movie-year-visual">{currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : ''}</span>
            </div>
            <p className="swipe-movie-description-visual">{currentMovie.overview}</p>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentMovie.title + ' trailer')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="swipe-watch-trailer-visual"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" stroke="#6C6CE8" strokeWidth="2" fill="none" />
                <polygon points="10,8 16,12 10,16" fill="#6C6CE8" />
              </svg>
              <span>Watch Trailer</span>
            </a>
          </div>
        </div>
        <div className="swipe-action-col-visual">
          <button
            className="swipe-action-btn-vert-visual swipe-skip-vert-visual"
            onClick={() => handleAction('skip')}
            disabled={isTransitioning}
            aria-label="Skip"
          >
            <span className="swipe-action-icon-vert-visual">✕</span>
          </button>
          <div style={{ position: 'relative' }}>
            <button
              ref={infoBtnRef}
              className="swipe-action-btn-vert-visual swipe-maybe-vert-visual"
              onClick={() => setShowInfo((v) => !v)}
              disabled={isTransitioning}
              aria-label="Info"
            >
              <span className="swipe-action-icon-vert-visual">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" stroke="#BFC6D1" strokeWidth="2" fill="none" />
                  <path d="M12 16V12M12 8H12.01" stroke="#BFC6D1" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {showInfo && (
              <div ref={infoPopupRef} className="swipe-info-popup-visual">
                <div className="swipe-info-title">{currentMovie.title}</div>
                <div className="swipe-info-desc">{currentMovie.overview}</div>
              </div>
            )}
          </div>
          <button
            className="swipe-action-btn-vert-visual swipe-like-vert-visual"
            onClick={handleLikeClick}
            disabled={isTransitioning}
            aria-label="Like"
          >
            <span className="swipe-action-icon-vert-visual">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="#059669" strokeWidth="2" fill="#D1FAE5" />
                <path d="M4.45067 13.9082L11.4033 20.4395C11.6428 20.6644 11.7625 20.7769 11.9037 20.8046C11.9673 20.8171 12.0327 20.8171 12.0963 20.8046C12.2375 20.7769 12.3572 20.6644 12.5967 20.4395L19.5493 13.9082C21.5055 12.0706 21.743 9.0466 20.0978 6.92607L19.7885 6.52734C17.8203 3.99058 13.8696 4.41601 12.4867 7.31365C12.2913 7.72296 11.7087 7.72296 11.5133 7.31365C10.1304 4.41601 6.17972 3.99058 4.21154 6.52735L3.90219 6.92607C2.25695 9.0466 2.4945 12.0706 4.45067 13.9082Z" stroke="#059669" strokeWidth="2" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      
      {/* Enhanced loading indicator when loading more movies in background */}
      {loadingMore && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(108, 108, 232, 0.95)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '24px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 8px 32px rgba(108, 108, 232, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            width: '18px',
            height: '18px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
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