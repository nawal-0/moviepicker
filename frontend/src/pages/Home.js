import React from 'react';
import '../styles/home.css';

function Home({ onCreateGroup, onJoinGroup }) {
  return (
    <div className="app">
      {/* Animated background elements */}
      <div className="bg-elements">
        <div className="movie-icon movie-icon-1">🎬</div>
        <div className="movie-icon movie-icon-2">🍿</div>
        <div className="movie-icon movie-icon-3">🎭</div>
        <div className="movie-icon movie-icon-4">📽️</div>
        <div className="movie-icon movie-icon-5">🎪</div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <a href="#" className="logo">MoviePicker</a>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="hero-title">MoviePicker</h1>
        <p className="tagline">Find your perfect movie match with friends. Swipe, match, and watch together!</p>
        
        <div className="cta-buttons">
          <button onClick={onCreateGroup} className="btn btn-primary">Create Session</button>
          <button onClick={onJoinGroup} className="btn btn-secondary">Join Session</button>
        </div>

        {/* How to Start Section */}
        <section className="how-to-start">
          <h2 className="section-title">How it Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Create a Session</h3>
              <p className="step-description">Start a new movie picking session and get your unique room code to share with friends.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Send Join Code to Friends</h3>
              <p className="step-description">Share your session code with friends so they can join your movie selection party.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Swipe on Movies</h3>
              <p className="step-description">Everyone swipes through movies. When you all match on one, that's your perfect movie night!</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;