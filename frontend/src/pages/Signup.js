import React, { useState } from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';
import '../Login.css';

function Signup({ onLoginClick, onBack, onSignupSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Simulate form signup 
    setTimeout(() => {
      setIsLoading(false);
      onSignupSuccess();
    }, 1000);
  };

  const handleGoogleSuccess = (userData) => {
    console.log('Google signup successful:', userData);
    onSignupSuccess();
  };

  const handleGoogleError = (error) => {
    console.error('Google signup failed:', error);
    setError('Google sign-up failed. Please try again.');
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
        <div className="signup-box">
          <h2>Create your account</h2>
          <p className="desc">Join thousands discovering their next favorite movie</p>
          {error && <div className="error-message">{error}</div>}
          <div style={{ marginBottom: '24px' }}>
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              options={{
                theme: 'outline',
                size: 'large',
                text: 'signup_with',
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
            <span style={{ padding: '0 16px' }}>or sign up with email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          </div>
          <form onSubmit={handleSubmit}>
            <label>Full name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
            <label>Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                minLength="6"
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
            <label>Confirm password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button 
              type="submit" 
              className="create-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div className="switch-auth">
            Already have an account? <button className="link" onClick={onLoginClick}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup; 