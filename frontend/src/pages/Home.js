import React from 'react';

function Home({ onCreateGroup, onJoinGroup, onLogout }) {
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
      </header>

      <main className="main-content" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '70vh',
        textAlign: 'center'
      }}>
        <h1 className="page-title" style={{ marginBottom: '16px' }}>
          Welcome to MoviePicker
        </h1>
        <p className="page-subtitle" style={{ 
          marginBottom: '48px', 
          maxWidth: '600px',
          color: '#666',
          fontSize: '18px',
          lineHeight: '1.5'
        }}>
          Ready to find the perfect movie for your group? Create a new session to set your preferences and generate a PIN, or join an existing group with their PIN.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px'
        }}>
          <button 
            className="generate-pin-button"
            onClick={onCreateGroup}
            style={{
              width: '100%',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              backgroundColor: '#6C6CE8',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(108, 108, 232, 0.2)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#5A5AD6';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(108, 108, 232, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#6C6CE8';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(108, 108, 232, 0.2)';
            }}
          >
            🎬 Create Group Session
          </button>

          <button 
            className="join-group-button"
            onClick={onJoinGroup}
            style={{
              width: '100%',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              backgroundColor: 'transparent',
              color: '#6C6CE8',
              border: '2px solid #6C6CE8',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#6C6CE8';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(108, 108, 232, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6C6CE8';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🔗 Join Group Session
          </button>
        </div>

        <div style={{ 
          marginTop: '48px', 
          padding: '24px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          maxWidth: '500px'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: '#333',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            How it works:
          </h3>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <li>Create a session and set your movie preferences</li>
            <li>Share the generated PIN with your friends</li>
            <li>Everyone swipes on movies they like</li>
            <li>Get notified when you find a match!</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default Home; 