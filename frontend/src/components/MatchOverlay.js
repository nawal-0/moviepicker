import React from 'react';
import '../styles/match-overlay.css';

function MatchOverlay({
  open,
  onClose,
  image,
  title,
  genres = [],
  description,
  matchPercent = 100,
  onViewDetails,
  onAddToMatches
}) {
  if (!open) return null;

  const handleAddToMatches = () => {
    onAddToMatches && onAddToMatches();
    onClose(); // Close the modal after adding to matches
  };

  return (
    <div className="match-overlay-backdrop">
      <div className="match-overlay-modal">
        <div className="match-overlay-header">It's a Match!</div>
        <div className="match-overlay-title">You like this movie</div>
        <div className="match-overlay-content-row">
          <div className="match-overlay-image-box">
            {image ? (
              <img src={image} alt={title} className="match-overlay-image" />
            ) : (
              <div className="match-overlay-gradient" />
            )}
          </div>
          <div className="match-overlay-info">
            <div className="match-overlay-movie-title">{title}</div>
            <div className="match-overlay-genres">
              {genres.map((g, i) => (
                <span key={i} className="match-overlay-genre-chip">{g}</span>
              ))}
            </div>
            <div className="match-overlay-desc">{description}</div>
            <div className="match-overlay-match-row">
              <span className="match-overlay-match-chip">{matchPercent}% Match</span>
            </div>
          </div>
        </div>
        <div className="match-overlay-actions">
          <button className="match-overlay-btn match-overlay-btn-primary" onClick={handleAddToMatches}>Add to Matches</button>
        </div>
        <button className="match-overlay-close" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  );
}

export default MatchOverlay;
