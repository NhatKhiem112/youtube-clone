import axios from 'axios';
import authHeader from './auth-header';

// Debug logging
const DEBUG = true;
const logSubscription = (...args) => DEBUG && console.log('%c[SUBSCRIPTION]', 'background: #8bc34a; color: #000', ...args);

const API_URL = 'http://localhost:8080/api/youtube-subscriptions/';

// Lấy API key từ biến môi trường
const YOUTUBE_API_KEY =  'AIzaSyBXoEAacf5by-sCmAodjwWFqOcUv247Ies';
// process.env.REACT_APP_YOUTUBE_API_KEY ||
// Log API key status
logSubscription(`YouTube API Key ${YOUTUBE_API_KEY ? 'đã được cấu hình' : 'CHƯA ĐƯỢC CẤU HÌNH'}`);
if (!YOUTUBE_API_KEY) {
  console.error('❌ YOUTUBE_API_KEY chưa được cấu hình trong .env! API calls sẽ thất bại.');
}

// Helper function to get subscriptions from localStorage
const getLocalSubscriptions = () => {
  const subscriptions = localStorage.getItem('subscriptions');
  return subscriptions ? JSON.parse(subscriptions) : [];
};

// Helper function to save subscriptions to localStorage
const saveLocalSubscriptions = (subscriptions) => {
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
};

// Get channel data from localStorage or create if it doesn't exist
const getChannelData = (channelId, channelName) => {
  const channels = JSON.parse(localStorage.getItem('channels') || '{}');
  
  if (!channels[channelId]) {
    channels[channelId] = {
      id: channelId,
      name: channelName || `Channel ${channelId}`,
      subscriberCount: 0 // Initialize with 0, will be updated with real data
    };
    localStorage.setItem('channels', JSON.stringify(channels));
  }
  
  return channels[channelId];
};

// Fetch accurate subscriber count from YouTube API
const fetchYouTubeChannelInfo = async (channelId) => {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
    logSubscription(`❌ Bỏ qua API call cho channel ID ${channelId} do thiếu API key hợp lệ`);
    return null;
  }

  logSubscription(`Đang lấy thông tin kênh YouTube: ${channelId}`);
  
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: YOUTUBE_API_KEY
      }
    });
    
    if (response.data && response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      const channelData = {
        id: channelId,
        name: channel.snippet.title,
        subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
        thumbnailUrl: channel.snippet.thumbnails.default.url
      };
      
      logSubscription(`✅ Nhận được dữ liệu kênh: ${channelData.name}, ${channelData.subscriberCount} subscribers`);
      
      // Update cached data
      const channels = JSON.parse(localStorage.getItem('channels') || '{}');
      channels[channelId] = channelData;
      localStorage.setItem('channels', JSON.stringify(channels));
      
      return channelData;
    }
    
    logSubscription(`⚠️ Không tìm thấy thông tin cho kênh: ${channelId}`);
    return null;
  } catch (error) {
    logSubscription(`❌ Lỗi khi lấy thông tin YouTube: ${error.message}`, error.response?.data);
    return null;
  }
};

// Update channel subscriber count
const updateChannelSubscriberCount = (channelId, increment) => {
  const channels = JSON.parse(localStorage.getItem('channels') || '{}');
  
  if (channels[channelId]) {
    channels[channelId].subscriberCount += increment ? 1 : -1;
    localStorage.setItem('channels', JSON.stringify(channels));
    return channels[channelId];
  }
  
  return null;
};

class SubscriptionService {
  // Subscribe to a channel
  async subscribeToChannel(channelId, channelName, channelData = null) {
    try {
      // Try to get accurate data from YouTube API
      let updatedChannelData = await fetchYouTubeChannelInfo(channelId);
      
      // Create default channel data if YouTube API failed
      const channelDataToSend = updatedChannelData || channelData || {
        channelName: channelName || `Channel ${channelId}`,
        channelThumbnailUrl: 'https://via.placeholder.com/150',
        subscriberCount: 0
      };
      
      // First try to call the backend API
      return axios.post(API_URL + `subscribe/${channelId}`, channelDataToSend, { headers: authHeader() })
        .catch(error => {
          console.warn('Backend API unavailable, using localStorage instead:', error.message);
          
          // If backend API fails, use localStorage as fallback
          const currentUser = JSON.parse(localStorage.getItem('user'));
          
          if (!currentUser) {
            throw new Error('User not logged in');
          }
          
          const subscriptions = getLocalSubscriptions();
          
          // Check if already subscribed
          const alreadySubscribed = subscriptions.some(
            sub => sub.channelId === channelId && sub.userId === currentUser.id
          );
          
          if (alreadySubscribed) {
            throw new Error('Already subscribed to this channel');
          }
          
          // Add subscription
          const newSubscription = {
            id: Date.now(), // Generate a unique ID
            userId: currentUser.id,
            channelId: channelId,
            channelName: channelDataToSend.channelName || channelName,
            subscribedAt: new Date().toISOString(),
            notificationEnabled: true
          };
          
          subscriptions.push(newSubscription);
          saveLocalSubscriptions(subscriptions);
          
          // Update channel subscriber count
          updateChannelSubscriberCount(channelId, true);
          
          return Promise.resolve({ data: { message: 'Subscribed successfully' } });
        });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Unsubscribe from a channel
  unsubscribeFromChannel(channelId) {
    try {
      // First try to call the backend API
      return axios.delete(API_URL + `unsubscribe/${channelId}`, { headers: authHeader() })
        .catch(error => {
          console.warn('Backend API unavailable, using localStorage instead:', error.message);
          
          // If backend API fails, use localStorage as fallback
          const currentUser = JSON.parse(localStorage.getItem('user'));
          
          if (!currentUser) {
            throw new Error('User not logged in');
          }
          
          const subscriptions = getLocalSubscriptions();
          
          // Find and remove the subscription
          const filteredSubscriptions = subscriptions.filter(
            sub => !(sub.channelId === channelId && sub.userId === currentUser.id)
          );
          
          if (filteredSubscriptions.length === subscriptions.length) {
            throw new Error('Not subscribed to this channel');
          }
          
          saveLocalSubscriptions(filteredSubscriptions);
          
          // Update channel subscriber count
          updateChannelSubscriberCount(channelId, false);
          
          return Promise.resolve({ data: { message: 'Unsubscribed successfully' } });
        });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Get subscription status for a channel
  async getSubscriptionStatus(channelId) {
    try {
      // Try to get accurate data from YouTube API first
      const youtubeData = await fetchYouTubeChannelInfo(channelId);
      
      // First try to call the backend API
      return axios.get(API_URL + `status/${channelId}`, { headers: authHeader() })
        .then(response => {
          // If we have API data, update the response with accurate subscriber count
          if (youtubeData && youtubeData.subscriberCount !== undefined) {
            return {
              ...response,
              data: {
                ...response.data,
                subscriberCount: youtubeData.subscriberCount
              }
            };
          }
          return response;
        })
        .catch(error => {
          console.warn('Backend API unavailable, using localStorage instead:', error.message);
          
          // If backend API fails, use localStorage as fallback
          const currentUser = JSON.parse(localStorage.getItem('user'));
          
          if (!currentUser) {
            return Promise.resolve({
              data: {
                subscribed: false,
                subscriberCount: youtubeData ? youtubeData.subscriberCount : getChannelData(channelId).subscriberCount
              }
            });
          }
          
          const subscriptions = getLocalSubscriptions();
          
          // Check if subscribed
          const isSubscribed = subscriptions.some(
            sub => sub.channelId === channelId && sub.userId === currentUser.id
          );
          
          // Get channel data
          const localChannelData = getChannelData(channelId);
          
          return Promise.resolve({
            data: {
              subscribed: isSubscribed,
              subscriberCount: youtubeData ? youtubeData.subscriberCount : localChannelData.subscriberCount
            }
          });
        });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Get all subscribed channels
  async getMySubscriptions() {
    try {
      // First try to call the backend API
      return axios.get(API_URL + 'my-youtube-subscriptions', { headers: authHeader() })
        .then(async response => {
          if (response && response.data) {
            // Update each channel with accurate YouTube API data
            const updatedSubscriptions = await Promise.all(
              response.data.map(async subscription => {
                const channelId = subscription.id;
                const youtubeData = await fetchYouTubeChannelInfo(channelId);
                
                if (youtubeData) {
                  return {
                    ...subscription,
                    username: youtubeData.name,
                    profileImageUrl: youtubeData.thumbnailUrl || subscription.profileImageUrl,
                    subscriberCount: youtubeData.subscriberCount
                  };
                }
                return subscription;
              })
            );
            
            return { ...response, data: updatedSubscriptions };
          }
          return response;
        })
        .catch(async error => {
          console.warn('Backend API unavailable, using localStorage instead:', error.message);
          
          // If backend API fails, use localStorage as fallback
          const currentUser = JSON.parse(localStorage.getItem('user'));
          
          if (!currentUser) {
            throw new Error('User not logged in');
          }
          
          const subscriptions = getLocalSubscriptions();
          
          // Filter subscriptions by current user
          const userSubscriptions = subscriptions.filter(sub => 
            sub.userId === currentUser.id
          );
          
          // Update each subscription with accurate YouTube data
          const enhancedSubscriptions = await Promise.all(
            userSubscriptions.map(async sub => {
              const youtubeData = await fetchYouTubeChannelInfo(sub.channelId);
              const localData = getChannelData(sub.channelId, sub.channelName);
              
              return {
                id: sub.channelId,
                username: youtubeData ? youtubeData.name : localData.name || sub.channelName,
                profileImageUrl: youtubeData ? youtubeData.thumbnailUrl : 'https://via.placeholder.com/150',
                subscriberCount: youtubeData ? youtubeData.subscriberCount : localData.subscriberCount,
                notificationEnabled: sub.notificationEnabled,
                subscribedAt: sub.subscribedAt
              };
            })
          );
          
          return Promise.resolve({ data: enhancedSubscriptions });
        });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Toggle notifications for a channel
  toggleNotification(channelId) {
    try {
      // First try to call the backend API
      return axios.put(API_URL + `notification/${channelId}`, {}, { headers: authHeader() })
        .catch(error => {
          console.warn('Backend API unavailable, using localStorage instead:', error.message);
          // Fallback implementation using localStorage
          const user = JSON.parse(localStorage.getItem('user'));
          if (!user) {
            throw new Error('User not authenticated');
          }

          // Get current subscriptions
          const subscriptions = getLocalSubscriptions();
          
          // Find this subscription
          const index = subscriptions.findIndex(
            sub => sub.channelId === channelId && sub.userId === user.id
          );
          
          if (index === -1) {
            throw new Error('Not subscribed to this channel');
          }
          
          // Toggle notification setting
          subscriptions[index].notificationEnabled = !subscriptions[index].notificationEnabled;
          
          // Save updated subscriptions
          localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
          
          return Promise.resolve({
            data: {
              notificationEnabled: subscriptions[index].notificationEnabled
            }
          });
        });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Get subscriptions for a specific user - for admin use
  getUserSubscriptions(userId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const headers = user && user.token ? { Authorization: 'Bearer ' + user.token } : {};
    
    // Add admin-specific header if needed
    if (user && user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ADMIN'))) {
      headers['x-admin-access'] = 'true';
    }
    
    return axios
      .get(`${API_URL}user/${userId}/subscriptions`, { headers })
      .then(async response => {
        if (response && response.data && Array.isArray(response.data)) {
          // Enhance with YouTube data
          const enhancedData = await Promise.all(
            response.data.map(async sub => {
              const youtubeData = await fetchYouTubeChannelInfo(sub.channelId);
              if (youtubeData) {
                return {
                  ...sub, 
                  channelName: youtubeData.name || sub.channelName,
                  subscriberCount: youtubeData.subscriberCount,
                  channelThumbnailUrl: youtubeData.thumbnailUrl || sub.channelThumbnailUrl
                };
              }
              return sub;
            })
          );
          return { ...response, data: enhancedData };
        }
        return response;
      })
      .catch(error => {
        console.warn('Backend API unavailable for user subscriptions:', error.message);
        // Try the admin endpoint as a fallback
        return axios
          .get(`http://localhost:8080/api/admin/users/${userId}/subscriptions`, { headers })
          .then(async response => {
            if (response && response.data && Array.isArray(response.data)) {
              // Enhance with YouTube data
              const enhancedData = await Promise.all(
                response.data.map(async sub => {
                  const youtubeData = await fetchYouTubeChannelInfo(sub.channelId);
                  if (youtubeData) {
                    return {
                      ...sub, 
                      channelName: youtubeData.name || sub.channelName,
                      subscriberCount: youtubeData.subscriberCount,
                      channelThumbnailUrl: youtubeData.thumbnailUrl || sub.channelThumbnailUrl
                    };
                  }
                  return sub;
                })
              );
              return { ...response, data: enhancedData };
            }
            return response;
          })
          .catch(adminError => {
            console.warn('Admin API also unavailable:', adminError.message);
            return Promise.resolve({ data: [] });
          });
      });
  }
}

export default new SubscriptionService(); 