import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import CreateSession from './pages/CreateSession';
import JoinGroup from './pages/JoinGroup';
import SwipingScreen from './pages/SwipingScreen';
import Matches from './pages/Matches';
import './Login.css';

function Landing({ onLogin, onSignup }) {
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
      </div>
      <div className="right-panel">
        <div className="welcome-box">
          <h2 className="welcome-title">Welcome to<br/>MoviePicker</h2>
          <p className="welcome-desc">The easiest way to decide what to watch with friends. Create a group, swipe on movies, and find your perfect match.</p>
          <button className="login-btn" onClick={onLogin}>Log In</button>
          <button className="create-btn" onClick={onSignup}>Create Account</button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [screen, setScreen] = useState('landing');
  const [sessionId, setSessionId] = useState(null);
  const [ws, setWs] = useState(null);
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #E5E7EB',
          borderTop: '4px solid #6C6CE8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6B7280', fontSize: '16px' }}>Loading MoviePicker...</p>
      </div>
    );
  }

  // Auto-navigate authenticated users to home
  if (isAuthenticated && (screen === 'landing' || screen === 'login' || screen === 'signup')) {
    setScreen('home');
  }

  const handleLoginSuccess = (userData) => {
    login(userData);
    setScreen('home');
  };

  const handleSignupSuccess = (userData) => {
    login(userData);
    setScreen('home');
  };

  const handleLogout = () => {
    logout();
    setSessionId(null);
    setScreen('landing');
  };

  if (screen === 'login') {
    return <Login 
      onSignupClick={() => setScreen('signup')} 
      onBack={() => setScreen('landing')} 
      onLoginSuccess={handleLoginSuccess}
    />;
  }
  
  if (screen === 'signup') {
    return <Signup 
      onLoginClick={() => setScreen('login')} 
      onBack={() => setScreen('landing')} 
      onSignupSuccess={handleSignupSuccess}
    />;
  }

  if (screen === 'home') {
    return <Home 
      onCreateGroup={() => setScreen('createSession')}
      onJoinGroup={() => setScreen('joinGroup')}
      onLogout={handleLogout}
      user={user}
    />;
  }
  
  if (screen === 'createSession') {
    return <CreateSession 
      onLogout={handleLogout}
      onStartSwiping={(sessionId) => {
        setSessionId(sessionId);
        setScreen('swiping');
      }}
      onBackToHome={() => setScreen('home')}
      user={user}
      onConnect={(ws) => setWs(ws)}
    />;
  }

  if (screen === 'joinGroup') {
    return <JoinGroup 
      onCreateGroup={() => setScreen('createSession')}
      onJoinSuccess={(sessionId) => {
        setSessionId(sessionId);
        setScreen('swiping');
      }}
      onBackToHome={() => setScreen('home')}
      user={user}
      onConnect={(ws) => setWs(ws)}
    />;
  }

  if (screen === 'swiping') {
    return <SwipingScreen 
      sessionId={sessionId}
      onBack={() => setScreen('home')}
      onGoToMatches={() => setScreen('matches')}
      user={user}
      ws={ws}
    />;
  }

  if (screen === 'matches') {
    return <Matches 
      sessionId={sessionId}
      onBack={() => setScreen('swiping')}
      onStartNewSession={() => setScreen('createSession')}
      user={user}
    />;
  }
  
  return <Landing onLogin={() => setScreen('login')} onSignup={() => setScreen('signup')} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
