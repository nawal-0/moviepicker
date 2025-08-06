import React from 'react';

function PostMatchOptions({ open, onKeepSwiping, onGoToMatches }) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#23263B',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          What's next?
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          You found a match! Would you like to keep discovering movies or check out your matches?
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={onKeepSwiping}
            className='btn btn-primary'
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4.45067 13.9082L11.4033 20.4395C11.6428 20.6644 11.7625 20.7769 11.9037 20.8046C11.9673 20.8171 12.0327 20.8171 12.0963 20.8046C12.2375 20.7769 12.3572 20.6644 12.5967 20.4395L19.5493 13.9082C21.5055 12.0706 21.743 9.0466 20.0978 6.92607L19.7885 6.52734C17.8203 3.99058 13.8696 4.41601 12.4867 7.31365C12.2913 7.72296 11.7087 7.72296 11.5133 7.31365C10.1304 4.41601 6.17972 3.99058 4.21154 6.52735L3.90219 6.92607C2.25695 9.0466 2.4945 12.0706 4.45067 13.9082Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
            </svg>
            Keep Swiping
          </button>

          <button
            onClick={onGoToMatches}
            className='btn btn-secondary'
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            View Matches
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostMatchOptions; 