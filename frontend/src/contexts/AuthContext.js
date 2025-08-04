import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, getStoredUserData, signOut } = useGoogleAuth();

  useEffect(() => {
    // Check if user is already authenticated on app start
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getStoredUserData();
        setUser(userData);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, getStoredUserData]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    signOut();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 