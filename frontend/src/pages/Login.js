import React, { useState } from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';
import '../Login.css';

function Login({ onSignupClick, onBack, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate form login 
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 1000);
  };

  const handleGoogleSuccess = (userData) => {
    console.log('Google login successful:', userData);
    onLoginSuccess();
  };

  const handleGoogleError = (error) => {
    console.error('Google login failed:', error);
    setError('Google sign-in failed. Please try again.');
  };

  return (
    <div className="split-container">
      <div className="left-panel">
        <div className="logo-circle">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" fill="#fff" />
            <polygon points="30,25 75,50 30,75" fill="#6C6CE8" />
          </svg>
        </div>
        <h1 className="app-title">MoviePicker</h1>
        <p className="tagline">Find your next group movie night hit</p>
        <div className="signup-features">
          <div className="feature"><span className="checkmark">✓</span> Swipe through personalized recommendations</div>
          <div className="feature"><span className="checkmark">✓</span> Create group sessions with friends</div>
          <div className="feature"><span className="checkmark">✓</span> Find movies everyone will love</div>
        </div>
      </div>
      <div className="right-panel">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="#6C6CE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="login-box">
          <h2>Welcome back</h2>
          <p className="desc">Sign in to continue your movie discovery journey</p>
          {error && <div className="error-message">{error}</div>}
          <div style={{ marginBottom: '24px' }}>
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              options={{
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                width: '100%'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            color: '#6B7280',
            fontSize: '14px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
            <span style={{ padding: '0 16px' }}>or continue with email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          </div>
          <form onSubmit={handleSubmit}>
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6B7280',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="forgot-row">
              <button type="button" className="forgot-link">Forgot your password?</button>
            </div>
            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="switch-auth">
            Don't have an account? <button className="link" onClick={onSignupClick}>Sign up</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 