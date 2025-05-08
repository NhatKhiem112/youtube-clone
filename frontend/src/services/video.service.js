import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api';
const VIDEO_URL = `${API_URL}/videos`;
const LIKES_URL = `${VIDEO_URL}/likes`;
const DISLIKES_URL = `${VIDEO_URL}/dislikes`;
const HISTORY_URL = `${VIDEO_URL}/history`;
const REPORT_URL = `${API_URL}/reports`;
const WATCH_LATER_URL = `${VIDEO_URL}/watchlater`;

class VideoService {
    // Hàm tiện ích để log thông tin người dùng hiện tại
    _getCurrentUserInfo() {
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? { id: user.id, username: user.username, email: user.email } : null;
    }
    
    // Phương thức để đảm bảo header xác thực luôn mới nhất
    _getAuthHeader() {
        // Luôn gọi authHeader() để lấy token mới nhất từ localStorage
        const header = authHeader();
        const user = this._getCurrentUserInfo();
        
        if (!header.Authorization) {
            console.warn("No authentication token found for user");
            return null;
        }
        
        if (user) {
            console.log(`Using authentication for user: ${user.username || user.email}`);
        }
        
        return header;
    }

    async getLikedVideos() {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                return [];
            }

            const response = await axios.get(LIKES_URL, { headers: header });
            return response.data;
        } catch (error) {
            console.error("Error fetching liked videos:", error);
            return [];
        }
    }

    async likeVideo(videoData) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                throw new Error("Not logged in");
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Liking video by user: ${user?.username || user?.email}`);
            
            // Make sure videoId is a string, not an object
            const videoId = typeof videoData === 'object' ? videoData.videoId : videoData;
            
            if (!videoId) {
                throw new Error("Invalid video ID");
            }
            
            console.log(`Liking video with ID: ${videoId}`);
            
            // If full object is provided, use it with the LIKES_URL endpoint
            if (typeof videoData === 'object' && videoData.title) {
                // Truncate description if it's too long (limit to 1000 chars to be safe)
                const description = videoData.description ?
                    videoData.description.substring(0, 1000) : '';

                const requestData = {
                    videoId: videoId,
                    title: videoData.title,
                    description: description,
                    thumbnailUrl: videoData.thumbnailUrl || '',
                    channelTitle: videoData.channelTitle || ''
                };
                
                console.log(`Request payload: ${JSON.stringify(requestData)}`);

                const response = await axios.post(
                    LIKES_URL,
                    requestData,
                    {
                        headers: header
                    }
                );
                console.log(`Successfully liked video ${videoId}`);
                return response.data;
            } else {
                // If just the videoId is provided, use the simpler endpoint
                const response = await axios.post(
                    `${VIDEO_URL}/${videoId}/like`, 
                    {}, 
                    { headers: header }
                );
                console.log(`Successfully liked video ${videoId}`);
                return response.data;
            }
        } catch (error) {
            console.error(`Error liking video with ID ${typeof videoData === 'object' ? videoData.videoId : videoData}:`, error);
            
            // Ghi log thêm thông tin chi tiết về lỗi
            if (error.response) {
                console.error(`Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error(`No response received: ${error.request}`);
            } else {
                console.error(`Error in request setup: ${error.message}`);
            }
            
            throw error;
        }
    }

    async unlikeVideo(videoId) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                throw new Error("Not logged in");
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Unliking video by user: ${user?.username || user?.email}`);

            const response = await axios.delete(
                `${LIKES_URL}/${videoId}`,
                {
                    headers: header
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error unliking video:", error);
            throw error;
        }
    }

    async isVideoLiked(videoId) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                return false;
            }

            const response = await axios.get(
                `${LIKES_URL}/${videoId}/check`,
                {
                    headers: header
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error checking if video is liked:", error);
            return false;
        }
    }

    // Watch Later methods
    async getWatchLaterVideos() {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                console.log('User not logged in, cannot get Watch Later videos');
                return [];
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Getting Watch Later videos for user: ${user?.username || user?.email}`);
            console.log('Making request to: ' + WATCH_LATER_URL);

            const response = await axios.get(WATCH_LATER_URL, { headers: header });
            console.log(`Successfully fetched ${response.data.length} Watch Later videos`);
            return response.data;
        } catch (error) {
            console.error("Error fetching watch later videos:", error);
            console.error("API response:", error.response?.data);
            
            // Ghi log thêm thông tin chi tiết về lỗi
            if (error.response) {
                // Máy chủ trả về mã lỗi
                console.error(`Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // Không nhận được phản hồi
                console.error(`No response received: ${error.request}`);
            } else {
                // Có lỗi trong quá trình thiết lập yêu cầu
                console.error(`Error in request setup: ${error.message}`);
            }
            
            return [];
        }
    }

    async addToWatchLater(videoData) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                console.log('User not logged in, cannot add to Watch Later');
                throw new Error("Not logged in");
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Adding to Watch Later by user: ${user?.username || user?.email}`);
            console.log(`Video data: ${JSON.stringify({
                videoId: videoData.videoId,
                title: videoData.title,
                channelTitle: videoData.channelTitle
            })}`);
            console.log(`Making request to: ${WATCH_LATER_URL} with token: ${header.Authorization.substring(0, 20)}...`);

            // Truncate description if it's too long (limit to 1000 chars to be safe)
            const description = videoData.description ?
                videoData.description.substring(0, 1000) : '';

            const requestData = {
                videoId: videoData.videoId,
                title: videoData.title,
                description: description,
                thumbnailUrl: videoData.thumbnailUrl || '',
                channelTitle: videoData.channelTitle || ''
            };
            
            console.log(`Request payload: ${JSON.stringify(requestData)}`);

            const response = await axios.post(
                WATCH_LATER_URL,
                requestData,
                {
                    headers: header
                }
            );
            console.log(`Successfully added video ${videoData.videoId} to Watch Later`);
            console.log(`Response data: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            console.error("Error adding video to watch later:", error);
            // Ghi log thêm thông tin chi tiết về lỗi
            if (error.response) {
                console.error(`Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // Yêu cầu được gửi nhưng không nhận được phản hồi
                console.error(`No response received from server: ${error.request}`);
            } else {
                // Có lỗi xảy ra khi thiết lập yêu cầu
                console.error(`Error setting up request: ${error.message}`);
            }
            throw error;
        }
    }

    async removeFromWatchLater(videoId) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                throw new Error("Not logged in");
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Removing from Watch Later by user: ${user?.username || user?.email}`);

            const response = await axios.delete(
                `${WATCH_LATER_URL}/${videoId}`,
                {
                    headers: header
                }
            );
            console.log(`Successfully removed video ${videoId} from Watch Later`);
            return response.data;
        } catch (error) {
            console.error("Error removing video from watch later:", error);
            throw error;
        }
    }

    async isVideoInWatchLater(videoId) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                return false;
            }

            const response = await axios.get(
                `${WATCH_LATER_URL}/${videoId}/check`,
                {
                    headers: header
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error checking if video is in watch later:", error);
            return false;
        }
    }

    // Disliked Videos methods
    async getDislikedVideos() {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                return [];
            }

            const response = await axios.get(DISLIKES_URL, { headers: header });
            return response.data;
        } catch (error) {
            console.error("Error fetching disliked videos:", error);
            return [];
        }
    }

    async dislikeVideo(videoData) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                throw new Error("Not logged in");
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Disliking video by user: ${user?.username || user?.email}`);
            
            // Make sure videoId is a string, not an object
            const videoId = typeof videoData === 'object' ? videoData.videoId : videoData;
            
            if (!videoId) {
                throw new Error("Invalid video ID");
            }
            
            console.log(`Disliking video with ID: ${videoId}`);

            // If full object is provided, use it with the DISLIKES_URL endpoint
            if (typeof videoData === 'object' && videoData.title) {
                // Truncate description if it's too long (limit to 1000 chars to be safe)
                const description = videoData.description ?
                    videoData.description.substring(0, 1000) : '';

                const requestData = {
                    videoId: videoId,
                    title: videoData.title,
                    description: description,
                    thumbnailUrl: videoData.thumbnailUrl || '',
                    channelTitle: videoData.channelTitle || ''
                };
                
                console.log(`Request payload: ${JSON.stringify(requestData)}`);

                const response = await axios.post(
                    DISLIKES_URL,
                    requestData,
                    {
                        headers: header
                    }
                );
                console.log(`Successfully disliked video ${videoId}`);
                return response.data;
            } else {
                // If just the videoId is provided, use the simpler endpoint
                const response = await axios.post(
                    `${VIDEO_URL}/${videoId}/dislike`, 
                    {}, 
                    { headers: header }
                );
                console.log(`Successfully disliked video ${videoId}`);
                return response.data;
            }
        } catch (error) {
            console.error(`Error disliking video with ID ${typeof videoData === 'object' ? videoData.videoId : videoData}:`, error);
            
            // Ghi log thêm thông tin chi tiết về lỗi
            if (error.response) {
                console.error(`Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error(`No response received: ${error.request}`);
            } else {
                console.error(`Error in request setup: ${error.message}`);
            }
            
            throw error;
        }
    }

    async undislikeVideo(videoId) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                throw new Error("Not logged in");
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Undisliking video by user: ${user?.username || user?.email}`);

            const response = await axios.delete(
                `${DISLIKES_URL}/${videoId}`,
                {
                    headers: header
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error undisliking video:", error);
            throw error;
        }
    }

    async isVideoDisliked(videoId) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                return false;
            }

            const response = await axios.get(
                `${DISLIKES_URL}/${videoId}/check`,
                {
                    headers: header
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error checking if video is disliked:", error);
            return false;
        }
    }

    // Watch History methods
    async getWatchHistory() {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                console.log('User not logged in, cannot get Watch History');
                return [];
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Getting Watch History for user: ${user?.username || user?.email}`);
            console.log(`Making request to: ${HISTORY_URL} with token: ${header.Authorization.substring(0, 20)}...`);

            const response = await axios.get(HISTORY_URL, { headers: header });
            console.log(`API response status: ${response.status}`);
            console.log(`API response data: ${JSON.stringify(response.data)}`);
            console.log(`Successfully fetched ${response.data.length} Watch History videos`);
            return response.data;
        } catch (error) {
            console.error("Error fetching watch history:", error);
            
            // Ghi log thêm thông tin chi tiết về lỗi
            if (error.response) {
                console.error(`Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error(`No response received: ${error.request}`);
            } else {
                console.error(`Error in request setup: ${error.message}`);
            }
            
            return [];
        }
    }

    async addToWatchHistory(videoData) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                console.log('User not logged in, cannot add to Watch History');
                return null;
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Adding to Watch History for user: ${user?.username || user?.email}`);
            console.log(`Video data being sent: ${JSON.stringify({
                videoId: videoData.videoId,
                title: videoData.title,
                channelTitle: videoData.channelTitle
            })}`);
            console.log(`Making request to: ${HISTORY_URL}`);

            // Truncate description if it's too long (limit to 1000 chars to be safe)
            const description = videoData.description ?
                videoData.description.substring(0, 1000) : '';

            const requestData = {
                videoId: videoData.videoId,
                title: videoData.title,
                description: description,
                thumbnailUrl: videoData.thumbnailUrl || '',
                channelTitle: videoData.channelTitle || ''
            };

            console.log("Request data:", JSON.stringify(requestData));
            console.log("Headers:", JSON.stringify(header));

            const response = await axios.post(
                HISTORY_URL,
                requestData,
                {
                    headers: header
                }
            );
            console.log(`Successfully added video ${videoData.videoId} to Watch History`);
            console.log("Response data:", JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error("Error adding video to watch history:", error);
            if (error.response) {
                console.error(`Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error(`No response received from server: ${error.request}`);
            } else {
                console.error(`Error setting up request: ${error.message}`);
            }
            return null;
        }
    }

    async removeFromWatchHistory(videoId) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                console.log('User not logged in, cannot remove from Watch History');
                throw new Error("Not logged in");
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Removing from Watch History by user: ${user?.username || user?.email}`);

            const response = await axios.delete(
                `${HISTORY_URL}/${videoId}`,
                {
                    headers: header
                }
            );
            console.log(`Successfully removed video ${videoId} from Watch History`);
            return response.data;
        } catch (error) {
            console.error("Error removing video from watch history:", error);
            throw error;
        }
    }

    async clearWatchHistory() {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                console.log('User not logged in, cannot clear Watch History');
                throw new Error("Not logged in");
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Clearing Watch History for user: ${user?.username || user?.email}`);

            const response = await axios.delete(
                `${HISTORY_URL}/clear`,
                {
                    headers: header
                }
            );
            console.log(`Successfully cleared Watch History`);
            return response.data;
        } catch (error) {
            console.error("Error clearing watch history:", error);
            throw error;
        }
    }

    async isVideoInWatchHistory(videoId) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                return false;
            }

            const response = await axios.get(
                `${HISTORY_URL}/${videoId}/check`,
                {
                    headers: header
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error checking if video is in watch history:", error);
            return false;
        }
    }

    // Throttle mechanism to prevent too many API calls
    _lastApiCallTime = 0;
    _minTimeBetweenCalls = 2000; // 2 seconds minimum between calls
    _isRequestInProgress = false;
    
    // Report methods
    async getUserReports() {
        try {
            // Prevent concurrent requests
            if (this._isRequestInProgress) {
                console.log('Request already in progress, skipping duplicate call');
                return [];
            }
            
            // Check if enough time has passed since the last call
            const now = Date.now();
            if (now - this._lastApiCallTime < this._minTimeBetweenCalls) {
                console.log('API call throttled. Too many requests in short time.');
                return [];
            }
            
            // Update last call time
            this._lastApiCallTime = now;
            this._isRequestInProgress = true;
            
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                console.log('User not logged in, cannot get reports');
                this._isRequestInProgress = false;
                return [];
            }

            try {
                console.log('Making API call to get reports');
                const response = await axios.get(`${REPORT_URL}/my-reports`, { 
                    headers: header,
                    timeout: 5000 // 5-second timeout
                });
                console.log('Reports data received:', response.data);
                this._isRequestInProgress = false;
                return response.data;
            } catch (apiError) {
                console.error("API Error fetching user reports:", apiError);
                this._isRequestInProgress = false;
                
                // If backend unavailable, return mock data for testing
                if (apiError.response && apiError.response.status === 404) {
                    console.log('Returning mock report data for testing');
                    const mockReports = [
                        {
                            id: 1,
                            videoId: 'dQw4w9WgXcQ',
                            title: 'Rick Astley - Never Gonna Give You Up',
                            reason: 'inappropriate_content',
                            description: 'This video contains inappropriate content',
                            thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                            channelTitle: 'Rick Astley',
                            createdAt: new Date().toISOString(),
                            status: 'PENDING'
                        },
                        {
                            id: 2,
                            videoId: '9bZkp7q19f0',
                            title: 'PSY - GANGNAM STYLE',
                            reason: 'spam_misleading',
                            description: 'This video contains misleading information',
                            thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
                            channelTitle: 'PSY',
                            createdAt: new Date().toISOString(),
                            status: 'REVIEWED'
                        }
                    ];
                    return mockReports;
                }
                
                // Rethrow for other errors
                throw apiError;
            }
        } catch (error) {
            console.error("Error fetching user reports:", error);
            this._isRequestInProgress = false;
            // Return empty array instead of rethrowing to prevent component crashes
            return [];
        }
    }

    async reportVideo(videoData, reportReason, additionalInfo = '') {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                throw new Error("Not logged in");
            }

            // Hiển thị thông tin người dùng đang thao tác
            const user = this._getCurrentUserInfo();
            console.log(`Reporting video by user: ${user?.username || user?.email}`);

            const response = await axios.post(
                REPORT_URL,
                {
                    videoId: videoData.videoId,
                    title: videoData.title || "Report",
                    reason: reportReason,
                    description: additionalInfo,
                    thumbnailUrl: videoData.thumbnailUrl || '',
                    channelTitle: videoData.channelTitle || ''
                },
                {
                    headers: header
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error reporting video:", error);
            throw error;
        }
    }

    async isVideoReported(videoId) {
        try {
            const header = this._getAuthHeader();
            if (!header) {
                // Không có token - người dùng chưa đăng nhập
                return false;
            }

            const response = await axios.get(
                `${REPORT_URL}/video/${videoId}/check`,
                {
                    headers: header
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error checking if video is reported:", error);
            return false;
        }
    }

    // Get current user's videos
    async getUserVideos() {
        try {
            const response = await axios.get(`${VIDEO_URL}/user`, { headers: authHeader() });
            // Process all video URLs
            const processedVideos = response.data.map(video => this._processVideoResponse(video));
            return processedVideos;
        } catch (error) {
            console.error('Error fetching user videos:', error);
            throw error;
        }
    }

    // Get all videos (for home page)
    async getAllVideos() {
        try {
            const response = await axios.get(VIDEO_URL);
            // Process all video URLs
            const processedVideos = response.data.map(video => this._processVideoResponse(video));
            return processedVideos;
        } catch (error) {
            console.error('Error fetching all videos:', error);
            throw error;
        }
    }

    // Get video by ID
    async getVideoById(id) {
        try {
            console.log(`Fetching video with ID ${id}`);
            
            // Try authenticated request first
            try {
                const header = this._getAuthHeader();
                if (header) {
                    const response = await axios.get(`${VIDEO_URL}/${id}`, { headers: header });
                    return this._processVideoResponse(response.data);
                }
            } catch (authError) {
                console.log(`Authenticated request failed: ${authError.message}`);
                // If 401 error, continue to non-authenticated request
                if (authError.response && authError.response.status !== 401) {
                    throw authError;
                }
            }
            
            // Fallback to non-authenticated request
            console.log(`Trying non-authenticated request for video ${id}`);
            const response = await axios.get(`${VIDEO_URL}/${id}`);
            return this._processVideoResponse(response.data);
        } catch (error) {
            console.error(`Error fetching video with ID ${id}:`, error);
            throw error;
        }
    }

    // Upload a video
    async uploadVideo(formData) {
        try {
            const response = await axios.post(`${VIDEO_URL}/upload`, formData, {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Process video URLs
            return this._processVideoResponse(response.data);
        } catch (error) {
            console.error('Error uploading video:', error);
            throw error;
        }
    }

    // Update video
    async updateVideo(id, videoData) {
        try {
            const response = await axios.put(`${VIDEO_URL}/${id}`, videoData, {
                headers: authHeader()
            });
            
            // Process video URLs
            return this._processVideoResponse(response.data);
        } catch (error) {
            console.error(`Error updating video with ID ${id}:`, error);
            throw error;
        }
    }

    // Delete video
    async deleteVideo(id) {
        try {
            const response = await axios.delete(`${VIDEO_URL}/${id}`, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting video with ID ${id}:`, error);
            throw error;
        }
    }

    // Get moderation status
    async getModerationStatus(id) {
        try {
            const response = await axios.get(`${VIDEO_URL}/${id}/moderation`, {
                headers: authHeader()
            });
            
            // Process video URLs
            return this._processVideoResponse(response.data);
        } catch (error) {
            console.error(`Error fetching moderation status for video ${id}:`, error);
            // Return default empty status
            return { 
                status: "UNKNOWN", 
                updatedAt: null,
                reviewedBy: null,
                comment: null
            };
        }
    }

    // Resubmit a rejected video for review
    async resubmitForReview(id) {
        try {
            const response = await axios.post(`${VIDEO_URL}/${id}/resubmit`, {}, {
                headers: authHeader()
            });
            return response.data;
        } catch (error) {
            console.error(`Error resubmitting video ${id} for review:`, error);
            throw error;
        }
    }

    // Hàm tiện ích để đảm bảo URL đúng cho các tài nguyên
    _getFullResourceUrl(url) {
        if (!url) return null;
        
        // Nếu đã là URL đầy đủ
        if (url.startsWith('http')) {
            return url;
        }
        
        // Thêm base URL
        return `http://localhost:8080${url}`;
    }

    // Hàm tiện ích để đảm bảo URL thumbnail đúng
    _getFullThumbnailUrl(thumbnailUrl) {
        if (!thumbnailUrl) return null;
        
        // If the URL already starts with http, return it as is
        if (thumbnailUrl.startsWith('http')) {
            return thumbnailUrl;
        }
        
        // Make sure URL starts with /
        const urlPath = thumbnailUrl.startsWith('/') ? thumbnailUrl : '/' + thumbnailUrl;
        
        // Use the correct backend path with /api prefix
        return `http://localhost:8080/api${urlPath}`;
    }

    // Hàm tiện ích để đảm bảo URL video đúng
    _getFullVideoUrl(videoUrl) {
        if (!videoUrl) {
            console.log('Empty video URL detected');
            return '';
        }
        
        // Log original URL for debugging
        console.log('Processing video URL:', videoUrl);
        
        // If URL already starts with http, return as is
        if (videoUrl.startsWith('http')) {
            console.log('URL is already absolute:', videoUrl);
            return videoUrl;
        }
        
        // Extract filename from the URL regardless of path format
        let filename = '';
        
        if (videoUrl.includes('/')) {
            // Extracting filename from a path
            const parts = videoUrl.split('/');
            filename = parts[parts.length - 1];
        } else {
            // Already just a filename
            filename = videoUrl;
        }
        
        console.log('Extracted filename:', filename);
        
        // If this is a YouTube video ID (typically 11 characters)
        if (/^[a-zA-Z0-9_-]{11}$/.test(filename)) {
            console.log('Detected YouTube video ID format:', filename);
            return `https://www.youtube.com/watch?v=${filename}`;
        }
        
        // Add more logging to understand the issue with filename
        console.log('Video ID/filename type:', typeof filename);
        console.log('Video ID/filename value:', filename);
        
        // For local videos, use the direct stream endpoint which should be more reliable
        const directUrl = `http://localhost:8080/api/videos/stream/${filename}`;
        console.log('Using direct video URL:', directUrl);
        
        // List alternative URLs for troubleshooting
        const alternativeUrls = [
            `http://localhost:8080/videos/${filename}`,
            `http://localhost:8080/api/videos/${filename}`,
            `http://localhost:8080/videos/stream/${filename}`,
            `http://localhost:8080/${filename}`
        ];
        
        console.log('Alternative URLs that could be tried:', alternativeUrls);
        
        return directUrl;
    }

    // Hàm để xử lý đầy đủ response video với các URL chính xác
    _processVideoResponse(video) {
        if (!video) return video;
        
        const processedVideo = { ...video };
        
        console.log('Processing video response. Original URLs:', {
            thumbnailUrl: processedVideo.thumbnailUrl,
            videoUrl: processedVideo.videoUrl,
            id: processedVideo.id
        });
        
        if (processedVideo.thumbnailUrl) {
            processedVideo.thumbnailUrl = this._getFullThumbnailUrl(processedVideo.thumbnailUrl);
        }
        
        if (processedVideo.videoUrl) {
            processedVideo.videoUrl = this._getFullVideoUrl(processedVideo.videoUrl);
        }
        
        console.log('Processed video response. Updated URLs:', {
            thumbnailUrl: processedVideo.thumbnailUrl,
            videoUrl: processedVideo.videoUrl,
            id: processedVideo.id
        });
        
        return processedVideo;
    }

    convertToVideoResponse(video) {
        return this._processVideoResponse(video);
    }
}

export default new VideoService(); 