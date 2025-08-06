import React, { useState } from 'react';
// import '../Login.css';
import PinGenerated from '../components/PinGenerated';
import '../styles/home.css';
import '../styles/colours.css';


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
                  +{allGenres.length - 6} more
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

<style jsx>{`
        /* Back button styles */
        .btn-back {
          background: none;
          border: 2px solid var(--btn-secondary-border);
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          transition: all 0.3s ease;
          backdrop-filter: var(--blur-light);
          background: var(--btn-secondary-bg);
        }

        .btn-back:hover {
          background: var(--btn-secondary-bg-hover);
          border-color: var(--btn-secondary-border-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px var(--btn-secondary-shadow-hover);
        }

        /* Page header */
        .page-header {
          margin-bottom: 3rem;
        }

        /* Error message */
        .error-message {
          background: linear-gradient(135deg, #ffebee, #ffcdd2);
          color: #c62828;
          padding: 1rem 1.5rem;
          border-radius: 15px;
          margin-bottom: 2rem;
          border: 1px solid #ffcdd2;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          backdrop-filter: var(--blur-light);
          font-weight: 500;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        /* Preferences section */
        .preferences-section {
          display: grid;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .preference-card {
          background: var(--card-bg);
          backdrop-filter: var(--blur-heavy);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 4px 20px var(--card-shadow);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .preference-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, var(--card-shimmer), transparent);
          transition: left 0.5s ease;
          opacity: 0;
        }

        .preference-card:hover::before {
          left: 100%;
          opacity: 1;
        }

        .preference-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px var(--card-shadow-hover);
          border-color: var(--card-border-hover);
        }

        /* Options grid */
        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .option-chip {
          padding: 1rem 1.5rem;
          border: 2px solid var(--btn-secondary-border);
          background: var(--btn-secondary-bg);
          color: var(--text-primary);
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: var(--blur-light);
          position: relative;
          overflow: hidden;
        }

        .option-chip::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: linear-gradient(45deg, var(--brand-red), var(--brand-yellow));
          border-radius: 50%;
          transition: all 0.4s ease;
          transform: translate(-50%, -50%);
          z-index: -1;
        }

        .option-chip:hover::before {
          width: 300px;
          height: 300px;
        }

        .option-chip:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px var(--card-shadow-hover);
          color: #fff;
          border-color: transparent;
        }

        .option-chip.selected {
          background: linear-gradient(45deg, var(--brand-red), var(--brand-yellow));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 8px 20px var(--btn-primary-shadow);
        }

        .more-chip {
          background: var(--card-bg);
          border: 2px dashed var(--btn-secondary-border);
          color: var(--text-secondary);
        }

        .more-chip:hover {
          border-style: solid;
          color: var(--text-primary);
        }

        .platform-chip.selected {
          background: linear-gradient(45deg, var(--brand-green), var(--brand-cyan));
          box-shadow: 0 8px 20px rgba(76, 207, 130, 0.3);
        }

        /* Slider section */
        .slider-section {
          text-align: center;
        }

        .threshold-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .threshold-value {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(45deg, var(--brand-red), var(--brand-yellow));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        .threshold-label {
          color: var(--text-secondary);
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .slider-container {
          max-width: 400px;
          margin: 0 auto 1.5rem;
        }

        .threshold-slider {
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: var(--card-border);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          margin-bottom: 1rem;
        }

        .threshold-slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, var(--brand-red), var(--brand-yellow));
          cursor: pointer;
          box-shadow: 0 4px 15px var(--btn-primary-shadow);
          transition: all 0.3s ease;
        }

        .threshold-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 20px var(--btn-primary-shadow-hover);
        }

        .threshold-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, var(--brand-red), var(--brand-yellow));
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 15px var(--btn-primary-shadow);
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .threshold-description {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 500px;
          margin: 0 auto;
        }

        /* Session actions */
        .session-actions {
          text-align: center;
          margin-top: 3rem;
        }

        .create-session-btn {
          font-size: 1.2rem;
          padding: 1.25rem 3rem;
          margin-bottom: 1rem;
          position: relative;
          overflow: hidden;
        }

        .create-session-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          border-top-color: #000;
          animation: spin 1s linear infinite;
          margin-right: 0.75rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .create-session-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-top: 1rem;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .preferences-section {
            gap: 1.5rem;
          }

          .preference-card {
            padding: 2rem 1.5rem;
          }

          .options-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.75rem;
          }

          .option-chip {
            padding: 0.75rem 1rem;
            font-size: 0.85rem;
          }

          .threshold-value {
            font-size: 2.5rem;
          }

          .create-session-btn {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>

    </div>
  );
}

export default CreateSession; 