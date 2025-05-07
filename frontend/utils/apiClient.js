/**
 * API client for making authenticated requests to the backend
 */

// Get API URL from environment or use default
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

// Get authentication token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  // Ensure headers object exists
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Prepare request options
  const requestOptions = {
    ...options,
    headers
  };
  
  // If body is an object, stringify it (unless it's FormData)
  if (requestOptions.body && typeof requestOptions.body === 'object' && !(requestOptions.body instanceof FormData)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }
  
  const url = `${getApiUrl()}${endpoint}`;
  console.log(`Making API request to: ${url}`);
  
  try {
    const response = await fetch(url, requestOptions);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // Handle non-JSON responses
    if (!isJson) {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return { success: true, status: response.status };
    }
    
    // Parse JSON response
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      // Handle unauthorized errors by clearing auth state
      if (response.status === 401) {
        console.error('Authentication error. Token expired or invalid.');
        
        // Clear localStorage auth data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
          
          // Redirect to home page
          window.location.href = '/';
        }
      }
      
      throw new Error(data.errorMessage || data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Make a GET request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, { 
    method: 'GET', 
    ...options 
  });
};

/**
 * Make a POST request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const post = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, { 
    method: 'POST',
    body,
    ...options
  });
};

/**
 * Make a PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const put = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, { 
    method: 'PUT',
    body,
    ...options
  });
};

/**
 * Make a PATCH request
 * @param {string} endpoint - API endpoint
 * @param {Object} body - Request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const patch = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, { 
    method: 'PATCH',
    body,
    ...options
  });
};

/**
 * Make a DELETE request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, { 
    method: 'DELETE',
    ...options
  });
};