import React, { useState } from 'react';
import '../Login.css';
import PinGenerated from '../components/PinGenerated';

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

function CreateSession({ onLogout, onStartSwiping, onBackToHome, onConnect }) {
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

  const visibleGenres = showMoreGenres ? allGenres : allGenres.slice(0, 3);

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
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 100 100">
              <polygon points="30,25 75,50 30,75" fill="#fff" />
            </svg>
          </div>
          <span className="app-name">MoviePicker</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={onBackToHome}
            style={{
              background: 'none',
              border: '1px solid #6C6CE8',
              color: '#6C6CE8',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
            }}
          >
            ← Back
          </button>
          <button 
            onClick={onLogout}
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
            Log out
          </button>
        </div>
      </header>

      <main className="main-content">
        <h1 className="page-title">Create Group Session</h1>
        <p className="page-subtitle">Set up your movie night preferences</p>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        <div className="preferences-container">
          <div className="left-column">
            <h2 className="section-title">Genres</h2>
            <div className="genre-buttons">
              {visibleGenres.map(genre => (
                <button
                  key={genre}
                  className={`genre-button ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                  onClick={() => handleGenreClick(genre)}
                >
                  {genre}
                </button>
              ))}
              {!showMoreGenres && (
                <button
                  className="genre-button more-button"
                  onClick={() => setShowMoreGenres(true)}
                >
                  +{allGenres.length - 3} more
                </button>
              )}
            </div>

            <h2 className="section-title streaming-title">Streaming Platforms</h2>
            <div className="platform-buttons">
              {allPlatforms.map(platform => (
                <button
                  key={platform}
                  className={`platform-button ${selectedPlatforms.includes(platform) ? 'selected' : ''}`}
                  onClick={() => handlePlatformClick(platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div className="right-column">
            <div className="option-row">
              <span className="option-label">Include movies you've seen</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={includeSeen}
                  onChange={(e) => setIncludeSeen(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div>
              <h2 className="section-title threshold-title">Match Threshold</h2>
              <div className="slider-container">
                <div className="threshold-value">{matchThreshold}%</div>
                <input
                  type="range"
                  min="50"
                  max="100"
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
            </div>
          </div>
        </div>

        <div className="session-actions">
          <button 
            className="generate-pin-button" 
            onClick={handleCreateSession}
            disabled={isLoading}
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