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
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      ...options,
      params
    });
    
    // Cache the successful response
    // Different TTL based on content type
    const ttl = endpoint.includes('/search') ? 
      3600000 : // 1 hour for search results
      86400000; // 24 hours for other data (videos, channels, etc.)
    
    cache.set(cacheKey, response.data, ttl);
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Utility function to clear the cache if needed
export const clearCache = () => {
  cache.data = {};
  localStorage.removeItem('youtube_api_cache');
  console.log('API cache cleared');
};