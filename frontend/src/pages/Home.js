import React from 'react';

const MoviePickerHomepage = () => {
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
          <button className="btn btn-primary">Create Session</button>
          <button className="btn btn-secondary">Join Session</button>
        </div>

        {/* How to Start Section */}
        <section className="how-to-start">
          <h2 className="section-title">How to Start</h2>
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

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
          min-height: 100vh;
          color: #1e293b;
          overflow-x: hidden;
          position: relative;
        }

        /* Animated background elements */
        .bg-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .movie-icon {
          position: absolute;
          opacity: 0.15;
          animation: float 6s ease-in-out infinite;
          font-size: 2rem;
          color: #64748b;
        }

        .movie-icon-1 { top: 10%; left: 10%; animation-delay: 0s; }
        .movie-icon-2 { top: 20%; right: 15%; animation-delay: 1s; }
        .movie-icon-3 { top: 50%; left: 5%; animation-delay: 2s; }
        .movie-icon-4 { bottom: 30%; right: 10%; animation-delay: 3s; }
        .movie-icon-5 { bottom: 10%; left: 20%; animation-delay: 4s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        /* Navbar */
        .navbar {
          position: relative;
          z-index: 100;
          padding: 1.5rem 2rem;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.8);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
        }

        /* Main content */
        .main-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 900;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4);
          background-size: 300% 300%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease-in-out infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .tagline {
          font-size: 1.2rem;
          color: #64748b;
          margin-bottom: 3rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          margin-bottom: 6rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-block;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: linear-gradient(45deg, #ff6b6b, #ffd93d);
          color: #000;
          box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        }

        .btn-secondary {
          background: rgba(0, 0, 0, 0.05);
          color: #374151;
          border: 2px solid rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 107, 107, 0.4);
        }

        .btn-secondary:hover {
          background: rgba(0, 0, 0, 0.1);
          border-color: rgba(0, 0, 0, 0.25);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        }

        /* How to start section */
        .how-to-start {
          margin-top: 4rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 3rem;
          color: #1e293b;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .step-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .step-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
          transition: left 0.5s ease;
        }

        .step-card:hover::before {
          left: 100%;
        }

        .step-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          border-color: rgba(255, 107, 107, 0.3);
        }

        .step-number {
          display: inline-block;
          width: 60px;
          height: 60px;
          background: linear-gradient(45deg, #ff6b6b, #ffd93d);
          color: #000;
          border-radius: 50%;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 60px;
          margin-bottom: 1.5rem;
        }

        .step-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1e293b;
        }

        .step-description {
          color: #64748b;
          line-height: 1.6;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
          }
          
          .main-content {
            padding: 2rem 1rem;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          
          .btn {
            padding: 1rem 2rem;
            width: 250px;
          }
          
          .steps-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .step-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MoviePickerHomepage;