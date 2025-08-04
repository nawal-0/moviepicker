import React, { useState } from 'react';
import '../Login.css';

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={onBackToHome}
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
            <span style={{ fontSize: '20px' }}>←</span> Back
          </button>
        </div>
      </header>

      <div className="join-group-content">
        <h1 className="join-group-title">Join Group Session</h1>
        <p className="join-group-subtitle">Enter the 4-character PIN</p>

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

        {error && (
          <div style={{
            color: '#FF3B30',
            marginTop: '12px',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <button 
          className="join-group-button"
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
      </div>
    </div>
  );
}

export default JoinGroup; 