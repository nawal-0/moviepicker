import React, { useEffect, useRef } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const GoogleSignInButton = ({ onSuccess, onError, options = {} }) => {
  const buttonRef = useRef(null);
  const { initializeGoogleSignIn, renderGoogleButton, isLoading, error } = useGoogleAuth();

  useEffect(() => {
    // Wait for Google library to load
    const initializeWhenReady = () => {
      if (window.google) {
        initializeGoogleSignIn(onSuccess, onError);
        
        // Generate unique ID for the button
        const buttonId = `google-signin-button-${Date.now()}`;
        if (buttonRef.current) {
          buttonRef.current.id = buttonId;
          renderGoogleButton(buttonId, options);
        }
      } else {
        // Retry after a short delay
        setTimeout(initializeWhenReady, 100);
      }
    };

    initializeWhenReady();
  }, [initializeGoogleSignIn, renderGoogleButton, onSuccess, onError, options]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        border: '1px solid #dadce0',
        borderRadius: '4px',
        backgroundColor: '#f8f9fa',
        color: '#3c4043',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid #dadce0',
          borderTop: '2px solid #1976d2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '8px'
        }}></div>
        Signing in with Google...
      </div>
    );
  }

  return (
    <div>
      <div ref={buttonRef}></div>
      {error && (
        <div style={{
          color: '#d93025',
          fontSize: '14px',
          marginTop: '8px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton; 