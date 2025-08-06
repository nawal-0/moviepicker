import React, { useState } from 'react';
import '../styles/join-group.css';

const API_URL = process.env.REACT_APP_API_URL;
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL;

function JoinGroup({ onCreateGroup, onJoinSuccess, onBackToHome, onConnect }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = Array(4).fill().map(() => React.createRef());

  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(''); // Clear error when user types

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleJoinGroup = async () => {
    const enteredPin = pin.join('').toUpperCase();
    if (enteredPin.length === 4) {
      setIsLoading(true);
      setError('');
      
      try {

        // Make API call to join session
        const response = await fetch(`${API_URL}/session/${enteredPin}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to join session');
        }

        // Store session ID and show swiping screen
        setSessionId(data.session_id);
        const ws = new WebSocket(`${WEBSOCKET_URL}?sessionId=${data.session_id}`);
        onConnect(ws);
        ws.onopen = () => {
          console.log('WebSocket connection established');
        };

        setError('');
        // Call the success callback with session ID
        onJoinSuccess(data.session_id);
        

      } catch (err) {
        setError('Invalid PIN or session not found');
        // Clear the PIN inputs
        setPin(['', '', '', '']);
        // Focus the first input
        inputRefs[0].current?.focus();
      } finally {
        setIsLoading(false);
      }
    }
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
          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Join Session</h1>
          <p className="tagline">Enter the 4-character PIN</p>
        </div>
        <div className="pin-input-container">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              className="pin-input"
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              pattern="[0-9A-Za-z]*"
              inputMode="text"
            />
          ))}
        </div>

        {error && (<div className="error-message">
            {error}
          </div>
        )}

        <button 
          className="btn btn-primary create-session-btn"
          onClick={handleJoinGroup}
          disabled={pin.some(digit => !digit) || isLoading}
        >
          {isLoading ? 'Joining...' : 'Join Group'}
        </button>

        <p className="create-group-prompt">
          Want to start your own?{' '}
          <button className="create-group-link" onClick={onCreateGroup}>
            Create group
          </button>
        </p>
    </main>
    </div>
  );
}

export default JoinGroup; 