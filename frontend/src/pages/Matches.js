import React, { useState, useEffect } from 'react';
import '../Login.css';

const API_URL = process.env.REACT_APP_API_URL;

function Matches({ sessionId, onBack, onStartNewSession }) {
  const [matches, setMatches] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, [sessionId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch session info and matches in parallel
      const [sessionResponse, matchesResponse] = await Promise.all([
        fetch(`${API_URL}/session/${sessionId}`),
        fetch(`${API_URL}/session/${sessionId}/matches`)
      ]);
      
      const sessionData = await sessionResponse.json();
      const matchesData = await matchesResponse.json();
      
      if (!sessionResponse.ok) {
        throw new Error(sessionData.error || 'Failed to fetch session info');
      }
      
      if (!matchesResponse.ok) {
        throw new Error(matchesData.error || 'Failed to fetch matches');
      }

      console.log('Session data:', sessionData);
      console.log('Matches data:', matchesData);

      setSessionInfo({
        displayId: sessionData.display_id,
        totalMembers: sessionData.total_user,
        totalMatches: matchesData.total_matches || 0
      });

      // Use actual match data from the API
      setMatches(matchesData.matches || []);
      
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    // Implement leave group functionality
    console.log('Leaving group...');
    onBack();
  };

  if (loading) {
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
        </header>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          textAlign: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #6C6CE8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#23263B',
              marginBottom: '8px'
            }}>
              🏆 Loading Your Matches
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              maxWidth: '400px',
              lineHeight: '1.5'
            }}>
              Gathering all the movies your group loved together. This is where the magic happens!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
        </header>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ color: '#EF4444' }}>Error: {error}</div>
          <button onClick={onBack} style={{ marginTop: '16px' }}>Go Back</button>
        </div>
      </div>
    );
  }

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
          <span style={{ 
            marginLeft: '24px', 
            color: '#6B7280', 
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Group: {sessionInfo?.displayId}
          </span>
        </div>
        <button
          onClick={handleLeaveGroup}
          style={{
            backgroundColor: 'transparent',
            color: '#6B7280',
            border: '2px solid #E5E7EB',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#EF4444';
            e.target.style.color = '#EF4444';
            e.target.style.backgroundColor = '#FEF2F2';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#E5E7EB';
            e.target.style.color = '#6B7280';
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Leave Group
        </button>
      </header>

      <main className="main-content">
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#23263B',
          marginBottom: '8px',
          lineHeight: '1.2'
        }}>
          Matches
        </h1>
        
        <p style={{
          color: '#6B7280',
          fontSize: '16px',
          marginBottom: '40px',
          fontWeight: '500'
        }}>
          Group: {sessionInfo?.displayId} • {sessionInfo?.totalMembers} members • {sessionInfo?.totalMatches} matches
        </p>

        {matches.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6B7280'
          }}>
            <h3 style={{ marginBottom: '8px' }}>No matches yet</h3>
            <p>Keep swiping to find movies everyone loves!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {matches.map((match) => (
              <div key={match.id} style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #6C6CE8 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '280px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '8px',
                    lineHeight: '1.3'
                  }}>
                    {match.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    opacity: '0.9',
                    marginBottom: '16px'
                  }}>
                    {match.year} • {match.genres ? match.genres.map(g => g.name || g).join(', ') : 'Unknown'}
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      backgroundColor: match.match_percentage === 100 ? 'rgba(34, 197, 94, 0.9)' : 'rgba(251, 146, 60, 0.9)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {match.match_percentage}% Match
                    </span>
                    
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {match.voted_by}
                    </span>
                  </div>
                </div>

                <button style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={() => console.log('View details for', match.title)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '48px'
        }}>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#6C6CE8',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5A5AD6';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(108, 108, 232, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#6C6CE8';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 7L12 12L2 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{matches.length === 0 ? 'Start Swiping' : 'Keep Swiping'}</span>
          </button>
        </div>

      </main>
    </div>
  );
}

export default Matches; 