import { useState, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleResponse = useCallback(async (response) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Send the Google token to our backend
      const backendResponse = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${response.credential}`,
          'Content-Type': 'application/json',
        },
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const userData = await backendResponse.json();
      
      // Store authentication data
      localStorage.setItem('google_token', response.credential);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      return { success: true, userData };
      
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeGoogleSignIn = useCallback((onSuccess, onError) => {
    // Debug logging
    console.log('🔍 Google Client ID:', GOOGLE_CLIENT_ID);
    console.log('🔍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID
    });

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('your-google-client-id-here')) {
      const errorMsg = `❌ Google Client ID not configured properly. Please follow the setup guide to get your real Google Client ID from Google Cloud Console.

Current value: ${GOOGLE_CLIENT_ID}

Steps to fix:
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Copy your real Client ID to frontend/.env file`;
      
      console.error(errorMsg);
      onError(errorMsg);
      return;
    }

    if (!window.google) {
      console.error('Google Sign-In library not loaded');
      onError('Google Sign-In library not loaded. Please check your internet connection.');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          const result = await handleGoogleResponse(response);
          if (result.success) {
            onSuccess(result.userData);
          } else {
            onError(result.error);
          }
        },
      });
    } catch (err) {
      console.error('Google Sign-In initialization error:', err);
      onError(`Google Sign-In initialization failed: ${err.message}`);
    }
  }, [handleGoogleResponse]);

  const renderGoogleButton = useCallback((elementId, options = {}) => {
    if (!window.google) {
      console.error('Google Sign-In library not loaded');
      return;
    }

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('your-google-client-id-here')) {
      // Don't render button if Client ID is not configured
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div style="
            border: 2px dashed #ccc; 
            padding: 16px; 
            border-radius: 8px; 
            text-align: center;
            color: #666;
            background: #f9f9f9;
          ">
            <strong>⚠️ Google Client ID Required</strong><br>
            <small>Please configure your Google Client ID in the .env file</small>
          </div>
        `;
      }
      return;
    }

    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: '100%',
      ...options
    };

    try {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        defaultOptions
      );
    } catch (err) {
      console.error('Google button render error:', err);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('google_token');
    localStorage.removeItem('user_data');
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem('google_token');
  }, []);

  const getStoredUserData = useCallback(() => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }, []);

  return {
    isLoading,
    error,
    initializeGoogleSignIn,
    renderGoogleButton,
    signOut,
    isAuthenticated,
    getStoredUserData,
  };
}; 