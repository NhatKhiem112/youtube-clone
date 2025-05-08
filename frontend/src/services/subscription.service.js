import axios from 'axios';
import authHeader from './auth-header';

// Debug logging
const DEBUG = true;
const logSubscription = (...args) => DEBUG && console.log('%c[SUBSCRIPTION]', 'background: #8bc34a; color: #000', ...args);

const API_URL = 'http://localhost:8080/api';
const SUBSCRIPTIONS_URL = `${API_URL}/youtube-subscriptions`;

// Lấy API key từ biến môi trường
const YOUTUBE_API_KEY = 'AIzaSyBXoEAacf5by-sCmAodjwWFqOcUv247Ies';
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
  // Get all subscriptions for current user
  async getSubscriptions() {
    try {
      const response = await axios.get(`${SUBSCRIPTIONS_URL}/my-youtube-subscriptions`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  }
  
  // Get my subscriptions - needed by SubscriptionsPage
  async getMySubscriptions() {
    try {
      logSubscription('Fetching my YouTube subscriptions');
      const response = await axios.get(`${SUBSCRIPTIONS_URL}/my-youtube-subscriptions`, { headers: authHeader() });
      
      // Kiểm tra và log dữ liệu đã nhận
      logSubscription(`Received ${response.data.length} subscriptions from server`);
      
      // Danh sách kênh cần cập nhật từ YouTube API
      const channelsNeedingUpdate = response.data.filter(
        sub => !sub.profileImageUrl || !sub.subscriberCount || sub.subscriberCount === 0
      );
      
      logSubscription(`Found ${channelsNeedingUpdate.length} channels needing data update`);
      
      // Lưu trữ các promise để đợi tất cả các yêu cầu hoàn thành
      const channelUpdatePromises = [];
      
      // Tăng cường dữ liệu kênh bằng cách truy vấn API YouTube
      for (const channel of channelsNeedingUpdate) {
        // Chỉ thực hiện API call khi có channelId hợp lệ
        if (channel.id) {
          const updatePromise = this._enhanceChannelWithYouTubeData(channel);
          channelUpdatePromises.push(updatePromise);
        }
      }
      
      // Đợi tất cả các yêu cầu hoàn thành
      await Promise.allSettled(channelUpdatePromises);
      
      // Đảm bảo mỗi kênh có đầy đủ thông tin
      const enhancedSubscriptions = response.data.map(subscription => {
        // Kiểm tra các trường quan trọng
        if (!subscription.profileImageUrl || !subscription.username) {
          logSubscription(`Missing data for channel ${subscription.id}`);
        }
        
        // Đảm bảo có tên hiển thị
        if (!subscription.username && subscription.channelName) {
          subscription.username = subscription.channelName;
        }
        
        // Đảm bảo có URL hình ảnh
        if (!subscription.profileImageUrl && subscription.channelThumbnailUrl) {
          subscription.profileImageUrl = subscription.channelThumbnailUrl;
        }
        
        // Đảm bảo có số người đăng ký
        if (subscription.subscriberCount === undefined || subscription.subscriberCount === null) {
          subscription.subscriberCount = 0;
        }
        
        return subscription;
      });
      
      logSubscription('Enhanced subscription data is ready');
      return { data: enhancedSubscriptions };
    } catch (error) {
      console.error('Error fetching my subscriptions:', error);
      return { data: [] };
    }
  }
  
  // Helper method to enhance channel data with YouTube API
  async _enhanceChannelWithYouTubeData(channel) {
    try {
      logSubscription(`Enhancing channel data for: ${channel.id}`);
      
      if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        logSubscription(`Cannot enhance channel ${channel.id} - missing valid API key`);
        return channel;
      }
      
      // Lấy thông tin kênh từ API YouTube
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
        params: {
          part: 'snippet,statistics',
          id: channel.id,
          key: YOUTUBE_API_KEY
        }
      });
      
      // Kiểm tra dữ liệu trả về
      if (response.data && response.data.items && response.data.items.length > 0) {
        const youtubeData = response.data.items[0];
        
        // Cập nhật thông tin kênh
        if (youtubeData.snippet) {
          channel.username = youtubeData.snippet.title;
          channel.profileImageUrl = youtubeData.snippet.thumbnails.default.url;
        }
        
        // Cập nhật số người đăng ký
        if (youtubeData.statistics) {
          channel.subscriberCount = parseInt(youtubeData.statistics.subscriberCount);
        }
        
        logSubscription(`Successfully enhanced channel: ${channel.username} with ${channel.subscriberCount} subscribers`);
        
        // Cập nhật thông tin kênh vào backend
        this._updateChannelInfoOnBackend(channel);
      } else {
        logSubscription(`No data found for channel: ${channel.id}`);
      }
      
      return channel;
    } catch (error) {
      console.error(`Error enhancing channel ${channel.id}:`, error);
      return channel;
    }
  }
  
  // Helper method to update channel info on backend
  async _updateChannelInfoOnBackend(channel) {
    try {
      logSubscription(`Updating channel data on backend for: ${channel.id}`);
      
      // Gửi thông tin cập nhật lên backend
      await axios.put(`${SUBSCRIPTIONS_URL}/update-channel-info/${channel.id}`, {
        channelName: channel.username,
        channelThumbnailUrl: channel.profileImageUrl,
        subscriberCount: channel.subscriberCount
      }, { headers: authHeader() });
      
      logSubscription(`Successfully updated channel info on backend: ${channel.id}`);
    } catch (error) {
      console.error(`Error updating channel info on backend for ${channel.id}:`, error);
    }
  }

  // Subscribe to a channel
  async subscribe(channelData) {
    try {
      const response = await axios.post(`${SUBSCRIPTIONS_URL}/subscribe/${channelData.channelId}`, {
        channelName: channelData.channelTitle,
        channelThumbnailUrl: channelData.thumbnailUrl || '',
        subscriberCount: channelData.subscriberCount || 0
      }, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      throw error;
    }
  }
  
  // New method for subscribing to channel with additional data
  async subscribeToChannel(channelId, channelUsername, channelData) {
    logSubscription(`Subscribing to channel: ${channelId}, ${channelUsername}`);
    try {
      const response = await axios.post(`${SUBSCRIPTIONS_URL}/subscribe/${channelId}`, {
        channelName: channelUsername,
        channelThumbnailUrl: channelData.channelThumbnailUrl || '',
        subscriberCount: channelData.subscriberCount || 0
      }, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      throw error;
    }
  }

  // Unsubscribe from a channel
  async unsubscribe(channelId) {
    try {
      logSubscription(`Sending unsubscribe request for channel: ${channelId}`);
      
      // Use RESTful POST endpoint instead of DELETE to avoid transaction issues
      const response = await axios.post(`${SUBSCRIPTIONS_URL}/unsubscribe-alt/${channelId}`, {}, {
        headers: authHeader()
      });
      
      logSubscription(`Unsubscribe successful for channel: ${channelId}`);
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      
      // Handle error by providing a local fallback
      logSubscription('Using local fallback for unsubscribe');
      this._handleLocalUnsubscribe(channelId);
      
      // Rethrow the error for the caller to handle UI updates
      throw error;
    }
  }
  
  // Handle local unsubscribe as fallback when API fails
  _handleLocalUnsubscribe(channelId) {
    try {
      // Get current subscriptions from localStorage
          const subscriptions = getLocalSubscriptions();
          
      // Filter out the channel to unsubscribe
      const updatedSubscriptions = subscriptions.filter(sub => sub.channelId !== channelId);
      
      // Save updated subscriptions
      saveLocalSubscriptions(updatedSubscriptions);
      
      // Update channel data subscriber count
      updateChannelSubscriberCount(channelId, false);
      
      logSubscription(`Local unsubscribe successful for channel: ${channelId}`);
    } catch (localError) {
      console.error('Error handling local unsubscribe:', localError);
    }
  }

  // Method for the unsubscribe action from the subscribe button
  async unsubscribeFromChannel(channelId) {
    logSubscription(`Unsubscribing from channel: ${channelId}`);
    return this.unsubscribe(channelId);
  }

  // Toggle notifications for a subscribed channel
  async toggleNotifications(channelId) {
    try {
      const response = await axios.put(`${SUBSCRIPTIONS_URL}/notification/${channelId}`, {}, {
        headers: authHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      throw error;
    }
  }
  
  // Additional method for toggle notification from SubscribeButton
  async toggleNotification(channelId) {
    logSubscription(`Toggling notification for channel: ${channelId}`);
    return this.toggleNotifications(channelId);
  }

  // Check if subscribed to a channel
  async isSubscribed(channelId) {
    try {
      const response = await axios.get(`${SUBSCRIPTIONS_URL}/status/${channelId}`, {
        headers: authHeader()
      });
      return response.data.subscribed;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Check if notifications are enabled for a channel
  async hasNotificationsEnabled(channelId) {
    try {
      const response = await axios.get(`${SUBSCRIPTIONS_URL}/notification/${channelId}`, {
        headers: authHeader()
      });
      return response.data.notificationEnabled;
    } catch (error) {
      console.error('Error checking notification status:', error);
      return false;
    }
  }

  // Get subscriber count for a channel
  async getSubscriberCount(channelId) {
    try {
      const response = await axios.get(`${SUBSCRIPTIONS_URL}/count/${channelId}`);
      return response.data.subscriberCount;
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
      return 0;
    }
  }

  // Get subscription status with additional data
  async getSubscriptionStatus(channelId) {
    try {
      const response = await axios.get(`${SUBSCRIPTIONS_URL}/status/${channelId}`, {
        headers: authHeader()
      });
      return response;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return { data: { subscribed: false, subscriberCount: 0 } };
    }
  }

  // Mock implementation for testing when backend is not available
  mockFunctions() {
    // Check if we already connected to the real backend
    if (this._checkedBackend) {
      return false;
    }
    
    // Try to connect to the backend
    axios.get(`${API_URL}/health-check`)
      .then(() => {
        console.log('Backend is available, using real subscription service');
        this._checkedBackend = true;
        this._useMock = false;
      })
      .catch(() => {
        console.log('Backend not available, using mock subscription service');
        this._checkedBackend = true;
        this._useMock = true;
        
        // Mock the subscriptions
        this._mockSubscriptions = JSON.parse(localStorage.getItem('mockSubscriptions')) || [];
      });
    
    return true;
  }
}

export default new SubscriptionService(); 