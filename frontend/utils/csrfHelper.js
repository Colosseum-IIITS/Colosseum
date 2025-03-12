// csrfHelper.js - Utility functions for CSRF token management

/**
 * Fetch a CSRF token from the server
 * @returns {Promise<string>} - The CSRF token
 */
export const fetchCsrfToken = async () => {
  try {
    console.log('Fetching CSRF token from server...');
    const response = await fetch('http://localhost:5000/auth/csrfToken', {
      credentials: 'include',
    });
    
    console.log('CSRF response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('CSRF token response data:', data);
    
    if (!data.csrfToken) {
      throw new Error('No CSRF token in response');
    }
    
    const token = data.csrfToken;
    // Store in localStorage as a fallback (not ideal for production)
    localStorage.setItem('csrfToken', token);
    
    return token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    // Return any cached token as a fallback
    return localStorage.getItem('csrfToken');
  } 
};

/**
 * Prepare fetch options with CSRF token
 * @param {Object} options - Fetch options
 * @param {string} token - CSRF token
 * @returns {Object} - Updated fetch options
 */
export const prepareCsrfRequest = (options = {}, token) => {
  if (!token) {
    token = localStorage.getItem('csrfToken');
    console.log('Using cached CSRF token:', token);
  }
  
  // Ensure we have headers object
  if (!options.headers) {
    options.headers = {};
  }
  
  // Ensure credentials are included
  options.credentials = 'include';
  
  // Add token to headers and body
  options.headers['CSRF-Token'] = token;
  
  // If we have a body, add the token
  if (options.body) {
    try {
      const bodyObj = JSON.parse(options.body);
      bodyObj._csrf = token;
      options.body = JSON.stringify(bodyObj);
    } catch (e) {
      // If body isn't JSON, create a new body object
      console.warn('Body is not JSON, creating new body with CSRF token');
      const formData = new FormData();
      formData.append('_csrf', token);
      options.body = formData;
    }
  } else {
    // If no body, create one with the token
    options.body = JSON.stringify({ _csrf: token });
    options.headers['Content-Type'] = 'application/json';
  }
  
  return options;
};
