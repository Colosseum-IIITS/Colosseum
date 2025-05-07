// authUtils.js - Cross-domain authentication utilities

/**
 * Get the base API URL from environment variables or use the default
 * @returns {string} - API base URL
 */
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

/**
 * Get the JWT token from localStorage
 * @returns {string|null} - JWT token or null if not found
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Get the user role from localStorage
 * @returns {string|null} - User role or null if not found
 */
export const getUserRole = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userRole');
  }
  return null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('token') && !!localStorage.getItem('isAuthenticated');
  }
  return false;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response promise
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  // Ensure we have headers object
  if (!options.headers) {
    options.headers = {};
  }
  
  // Set content type if not specified
  if (!options.headers['Content-Type'] && !options.formData) {
    options.headers['Content-Type'] = 'application/json';
  }
  
  // Add authorization header if token exists
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${getApiUrl()}${endpoint}`;
  console.log(`Making API request to: ${url}`);
  
  try {
    const response = await fetch(url, options);
    
    // Handle token expiration (401 errors)
    if (response.status === 401) {
      console.log('Token expired or unauthorized');
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      
      // Redirect to login page if in browser context
      if (typeof window !== 'undefined') {
        window.location.href = '/auth?role=' + (getUserRole() || 'player');
      }
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Log out the user 
 * @param {Function} [callback] - Optional callback function after logout
 */
export const logout = async (callback) => {
  try {
    // Call logout endpoint if needed
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Clear localStorage data regardless of API call success
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    
    // Execute callback if provided
    if (callback && typeof callback === 'function') {
      callback();
    } else if (typeof window !== 'undefined') {
      // Default redirect to home
      window.location.href = '/';
    }
  }
};