import React from 'react';
import '../styles/pin-generated.css';

function PinGenerated({ pin, onShare, onStartSwiping, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="success-text">Success!</div>
        <h1 className="group-created-title">Group Created</h1>
        <p className="share-text">Share this PIN with your friends to join</p>
        
        <div className="pin-box">
          <div className="pin-number">{pin}</div>
          <div className="expiry-text">Expires in 24 hours</div>
        </div>

        <div className="modal-buttons">
          <button className="share-button" onClick={() => onShare(pin)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12L8 16M16 8L16 16M12 4L12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Share PIN
          </button>
          <button className="start-swiping-button" onClick={onStartSwiping}>
            Start Swiping
          </button>
        </div>
      </div>
    </div>
  );
}

export default PinGenerated; 