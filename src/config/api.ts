// API configuration for different environments
export const API_CONFIG = {
    // Use environment variable or fallback to localhost for development
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
    
    // Default headers for all requests
    defaultHeaders: {
      'Content-Type': 'application/json',
      // Only add Authorization header if API token is provided
      ...(import.meta.env.VITE_API_TOKEN && {
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
      }),
    },
    
    // Request configuration
    timeout: 10000, // 10 seconds
    withCredentials: true, // Include cookies if your backend uses sessions
  };
  
  // Helper function to build full API URLs
  export const buildApiUrl = (endpoint: string): string => {
    const baseUrl = API_CONFIG.baseURL.replace(/\/$/, ''); // Remove trailing slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  };
  
  // Helper function for making API requests with consistent configuration
  export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = buildApiUrl(endpoint);
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...API_CONFIG.defaultHeaders,
        ...options.headers,
      },
      credentials: API_CONFIG.withCredentials ? 'include' : 'same-origin',
    };
  
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  };
  
  // Alternative: If your backend uses different auth methods
  export const apiRequestWithUserAuth = async (endpoint: string, userToken: string, options: RequestInit = {}) => {
    return apiRequest(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${userToken}`,
      },
    });
  };