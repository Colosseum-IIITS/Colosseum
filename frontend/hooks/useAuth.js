"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Custom authentication hook that provides authentication utilities
 * and ensures localStorage values are properly synced
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get auth data from localStorage
        const token = localStorage.getItem("token");
        const storedUserRole = localStorage.getItem("userRole");
        const storedAuthStatus = localStorage.getItem("isAuthenticated");
        const storedUserData = localStorage.getItem("userData");

        if (token && storedAuthStatus === "true") {
          setIsAuthenticated(true);
          setUserRole(storedUserRole);
          
          if (storedUserData) {
            try {
              setUser(JSON.parse(storedUserData));
            } catch (e) {
              console.error("Failed to parse user data:", e);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Check for authentication changes
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "isAuthenticated" || e.key === "userRole") {
        checkAuth();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    
    // Update state
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    
    // Call the logout API endpoint
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.error("Error during logout:", err);
    }).finally(() => {
      // Redirect to home
      router.push("/");
    });
  };

  return { 
    isAuthenticated, 
    userRole, 
    user, 
    loading, 
    logout 
  };
}

export default useAuth;