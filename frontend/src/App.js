import React, { useState } from 'react';
import Home from './pages/Home';
import CreateSession from './pages/CreateSession';
import JoinGroup from './pages/JoinGroup';
import SwipingScreen from './pages/SwipingScreen';
import Matches from './pages/Matches';
import './styles/styles.css';
import './styles/colours.css';


function AppContent() {
  const [screen, setScreen] = useState('home');
  const [sessionId, setSessionId] = useState(null);
  const [ws, setWs] = useState(null);
 

  if (screen === 'home') {
    return <Home 
      onCreateGroup={() => setScreen('createSession')}
      onJoinGroup={() => setScreen('joinGroup')}
    />;
  }
  
  if (screen === 'createSession') {
    return <CreateSession 
      onStartSwiping={(sessionId) => {
        setSessionId(sessionId);
        setScreen('swiping');
      }}
      onBackToHome={() => setScreen('home')}
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
      onConnect={(ws) => setWs(ws)}
    />;
  }

  if (screen === 'swiping') {
    return <SwipingScreen 
      sessionId={sessionId}
      onBack={() => setScreen('home')}
      onGoToMatches={() => setScreen('matches')}
      ws={ws}
    />;
  }

  if (screen === 'matches') {
    return <Matches 
      sessionId={sessionId}
      onBack={() => setScreen('home')}
      onKeepSwiping={() => setScreen('swiping')}
    />;
  }
  
}

function App() {
  return (
      <AppContent />
  );
}

export default App;
