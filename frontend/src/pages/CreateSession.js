import React, { useState } from 'react';
import PinGenerated from '../components/PinGenerated';
import '../styles/create-session.css';


const API_URL = process.env.REACT_APP_API_URL;
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL;

// Maps for converting UI names to API IDs (keeping these for future backend integration)
const GENRE_ID_MAP = {
  'Action': 28,
  'Adventure': 12,
  'Animation': 16,
  'Comedy': 35,
  'Crime': 80,
  'Documentary': 99,
  'Drama': 18,
  'Family': 10751,
  'Fantasy': 14,
  'History': 36,
  'Horror': 27,
  'Music': 10402,
  'Mystery': 9648,
  'Romance': 10749,
  'Sci-Fi': 878,
  'TV Movie': 10770,
  'Thriller': 53,
  'War': 10752,
  'Western': 37
};

const PROVIDER_ID_MAP = {
  'Netflix': 8,
  'Stan': 21,
  'Disney+': 337,
  'Prime Video': 119,
  'Binge': 385,
  'Paramount+': 531,
  'Apple TV+': 2,
  'Foxtel Now': 134,
  'SBS On Demand': 132,
  'ABC iView': 135
};

function CreateSession({ onStartSwiping, onBackToHome, onConnect }) {
  const [selectedGenres, setSelectedGenres] = useState(['Action', 'Comedy', 'Drama']);
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Netflix', 'Binge']);
  const [includeSeen, setIncludeSeen] = useState(true);
  const [matchThreshold, setMatchThreshold] = useState(50);
  const [showPinModal, setShowPinModal] = useState(false);
  const [generatedPin, setGeneratedPin] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // New state variables for handling the API response
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Complete list of genres
  const allGenres = [
    'Action', 'Comedy', 'Drama', 'Adventure', 'Animation',
    'Crime', 'Documentary', 'Family', 'Fantasy', 'Horror',
    'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
    'War', 'Western'
  ];

  // List of streaming platforms
  const allPlatforms = [
    'Netflix', 'Binge', 'Disney+', 'Prime Video',
    'Stan', 'Paramount+', 'Apple TV+'
  ];

  const visibleGenres = showMoreGenres ? allGenres : allGenres.slice(0, 5);

  const handleGenreClick = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handlePlatformClick = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleCreateSession = async () => {
    setIsLoading(true);
    setError(null);
    
    // Convert selected genres to their respective IDs
    const genreIds = selectedGenres
      .map(genre => GENRE_ID_MAP[genre])
      .filter(id => id !== undefined);
    
    // Convert selected platforms to their respective IDs
    const providerIds = selectedPlatforms
      .map(platform => PROVIDER_ID_MAP[platform])
      .filter(id => id !== undefined);
    
    // Prepare request body
    const requestBody = {
      genres: genreIds,
      providers: providerIds,
      match_threshold: matchThreshold / 100, // Convert to percentage
    };
    
    try {
      // Make API call to create session
      const response = await fetch(`${API_URL}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // Parse response
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }
      
      // Store session info and show success dialog
      setSessionInfo(data);
      setGeneratedPin(data.display_id);
      setSessionId(data.session_id);
      setShowPinModal(true);
      console.log('Session created successfully:', data);
      
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Error creating session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (pin) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join MoviePicker Group',
          text: `Join my MoviePicker group with PIN: ${pin}`
        });
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleStartSwiping = () => {
    setShowPinModal(false);
    const ws = new WebSocket(`${WEBSOCKET_URL}?sessionId=${sessionId}`);
    onConnect(ws);
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    onStartSwiping(sessionId);

  };

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
          <button onClick={onBackToHome} className="btn-back">
          ← Back to Home
        </button>
      </nav>

      <main className="main-content">
      <div className="page-header">
          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Create Group Session
          </h1>
          <p className="tagline">Set up your movie night preferences!</p>
      </div>

      {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="preferences-section">
          {/* Genres Section */}
          <div className="preference-card">
            <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              Choose Genres
            </h2>
            <div className="options-grid">
              {visibleGenres.map(genre => (
                <button
                  key={genre}
                  className={`option-chip ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                  onClick={() => handleGenreClick(genre)}
                >
                  {genre}
                </button>
              ))}
              {!showMoreGenres && (
                <button
                  className="option-chip more-chip"
                  onClick={() => setShowMoreGenres(true)}
                >
                  +{allGenres.length - 5} more
                </button>
              )}
            </div>
          </div>

            {/* Streaming Platforms Section */}
          <div className="preference-card">
            <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              Streaming Platforms
            </h2>
            <div className="options-grid">
              {allPlatforms.map(platform => (
                <button
                  key={platform}
                  className={`option-chip platform-chip ${selectedPlatforms.includes(platform) ? 'selected' : ''}`}
                  onClick={() => handlePlatformClick(platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-card">
          <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              Match Threshold
            </h2>
              <div className="slider-container">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={matchThreshold}
                  onChange={(e) => setMatchThreshold(parseInt(e.target.value))}
                  className="threshold-slider"
                />
                <div className="slider-labels">
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
              <p className="threshold-description">
                Movies need {matchThreshold}% of group members to like them to be considered a match
              </p>
            </div>
        </div>

        {/* Create Session Button */}
        <div className="session-actions">
          <button 
            className="btn btn-primary create-session-btn"
            onClick={handleCreateSession}
            disabled={isLoading || selectedGenres.length === 0 || selectedPlatforms.length === 0}
          >
            {isLoading ? 'Creating Session...' : 'Generate Group PIN'}
          </button>
        </div>
      </main>

      {showPinModal && (
        <PinGenerated
          pin={generatedPin}
          onShare={handleShare}
          onClose={() => setShowPinModal(false)}
          onStartSwiping={handleStartSwiping}
        />
      )}

    </div>
  );
}

export default CreateSession; 