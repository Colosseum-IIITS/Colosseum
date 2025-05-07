"use client";

import { createContext, useContext, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

// Create context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const auth = useAuth();

  // Check for auth_failed cookie which indicates the middleware rejected the token
  useEffect(() => {
    // Function to check for auth_failed cookie
    const checkAuthFailedCookie = () => {
      // Look for auth_failed cookie
      const authFailedCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_failed='));

      if (authFailedCookie) {
        console.log('Auth failed cookie detected, clearing auth state');
        // Clear the cookie
        document.cookie = 'auth_failed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        // Clear auth state
        auth.logout();
      }
    };

    // Check immediately and then set interval
    checkAuthFailedCookie();
    
    // Check periodically (every 5 seconds)
    const intervalId = setInterval(checkAuthFailedCookie, 5000);
    
    return () => clearInterval(intervalId);
  }, [auth]);

  // On mounted client, synchronize localStorage token with a readable cookie
  // that the middleware can access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // Set a non-HTTP-only cookie that the middleware can read
        document.cookie = `token=${token}; path=/; max-age=86400; samesite=lax`;
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}