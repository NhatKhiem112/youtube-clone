import axios from 'axios'

const API_KEY = 'AIzaSyBXoEAacf5by-sCmAodjwWFqOcUv247Ies';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Simple in-memory cache implementation
const cache = {
  data: {},
  
  // Set cache with expiration time (default 30 minutes = 1800000 ms)
  set(key, value, ttl = 1800000) {
    const now = Date.now();
    this.data[key] = {
      value,
      expiry: now + ttl
    };
    // Store in localStorage for persistence across sessions
    try {
      localStorage.setItem('youtube_api_cache', JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save cache to localStorage:', e);
    }
  },
  
  // Get cached value if it exists and is not expired
  get(key) {
    const now = Date.now();
    if (this.data[key] && this.data[key].expiry > now) {
      return this.data[key].value;
    }
    return null;
  },
  
  // Check if cache has valid entry for key
  has(key) {
    return !!this.get(key);
  },
  
  // Initialize cache from localStorage if available
  init() {
    try {
      const storedCache = localStorage.getItem('youtube_api_cache');
      if (storedCache) {
        this.data = JSON.parse(storedCache);
        
        // Clean up expired items on init
        const now = Date.now();
        for (const key in this.data) {
          if (this.data[key].expiry <= now) {
            delete this.data[key];
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load cache from localStorage:', e);
      this.data = {};
    }
  }
};

// Initialize cache from localStorage
cache.init();

export const request = async (endpoint, options = {}) => {
  const params = {
    key: API_KEY,
    ...options.params,
  };
  
  // Create a cache key based on endpoint and params
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
  
  // Check if we have a valid cached response
  if (cache.has(cacheKey)) {
    console.log(`Using cached data for ${endpoint}`);
    return { data: cache.get(cacheKey), fromCache: true };
  }
  
  // If not in cache, make the API request
  try {
    console.log(`Sending YouTube API request to ${endpoint} with params:`, params);
    
    // Add timeout to request to prevent hanging forever
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      ...options,
      params,
      signal: controller.signal
    });
    
    // Clear timeout since request completed
    clearTimeout(timeoutId);
    
    // Cache the successful response
    // Different TTL based on content type
    const ttl = endpoint.includes('/search') ? 
      3600000 : // 1 hour for search results
      86400000; // 24 hours for other data (videos, channels, etc.)
    
    cache.set(cacheKey, response.data, ttl);
    
    // Add debugging info
    console.log(`YouTube API request to ${endpoint} successful`);
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    // Detailed error logging
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.error('Request timed out. The YouTube API is taking too long to respond.');
    }
    
    // Kiểm tra lỗi cụ thể từ YouTube API
    const errorDetails = error.response?.data?.error;
    if (errorDetails) {
      console.error('YouTube API error details:', errorDetails.message, errorDetails.status);
      
      // Nếu lỗi liên quan đến API key, thì ghi log chi tiết
      if (errorDetails.message.includes('API key') || errorDetails.status === 'INVALID_ARGUMENT') {
        console.error('Invalid API key. Please check your configuration.');
      }
      
      // Nếu vượt quá quota
      if (errorDetails.status === 'RESOURCE_EXHAUSTED') {
        console.error('YouTube API quota exceeded. Please try again later.');
      }
    }
    
    // Try to return data from the cache even if it's expired as a fallback
    const allCacheData = cache.data;
    for (const key in allCacheData) {
      if (key.startsWith(endpoint)) {
        console.log('Returning expired cache data as fallback');
        return { 
          data: allCacheData[key].value, 
          fromCache: true, 
          isExpiredCache: true 
        };
      }
    }
    
    throw error;
  }
};

// Utility function to clear the cache if needed
export const clearCache = () => {
  cache.data = {};
  localStorage.removeItem('youtube_api_cache');
  console.log('API cache cleared');
};

// Hàm kiểm tra API key có hoạt động không
export const validateApiKey = async () => {
  try {
    console.log('Validating YouTube API key:', API_KEY);
    
    // Thực hiện request đơn giản để kiểm tra API key
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const testResponse = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        maxResults: 1,
        key: API_KEY
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('API key validation successful:', testResponse.status);
    return {
      valid: true,
      message: 'API key is valid'
    };
  } catch (error) {
    console.error('API key validation failed:', error);
    
    let message = 'Unknown error validating API key';
    let details = '';
    
    if (error.response) {
      // Server responded with non-2xx status
      if (error.response.data && error.response.data.error) {
        const errorInfo = error.response.data.error;
        message = errorInfo.message || 'API key error';
        details = `Status: ${errorInfo.status || error.response.status}, Code: ${errorInfo.code || 'unknown'}`;
      } else {
        message = `HTTP Error: ${error.response.status}`;
      }
    } else if (error.request) {
      // No response received
      message = 'No response from YouTube API server';
      details = 'Check your internet connection';
    } else {
      // Request setup error
      message = error.message;
    }
    
    return {
      valid: false,
      message,
      details,
      error
    };
  }
};