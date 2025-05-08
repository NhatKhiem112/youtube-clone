import React, { useState, useEffect, forwardRef, useRef } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import styled from 'styled-components/macro'
import { 
  Typography, 
  Avatar, 
  Divider, 
  CircularProgress, 
  Grid, 
  Snackbar,
  Paper,
  IconButton,
  Button,
  Box,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField
} from '@material-ui/core'
import ThumbUpAltOutlinedIcon from '@material-ui/icons/ThumbUpAltOutlined'
import ThumbDownAltOutlinedIcon from '@material-ui/icons/ThumbDownAltOutlined'
import ShareOutlinedIcon from '@material-ui/icons/ShareOutlined'
import PlaylistAddOutlinedIcon from '@material-ui/icons/PlaylistAddOutlined'
import WatchLaterIcon from '@material-ui/icons/WatchLater'
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import InfoIcon from '@material-ui/icons/Info'
import ErrorIcon from '@material-ui/icons/Error'
import CloseIcon from '@material-ui/icons/Close'
import DatabaseIcon from '@material-ui/icons/Storage'
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined'
import moment from 'moment'
import numeral from 'numeral'
import { request, validateApiKey } from '../utils/api'
import {
  TWO_COL_MIN_WIDTH,
  StyledAvatar,
  useIsMobileView,
  getFormattedDurationString,
} from '../utils/utils'
import he from 'he'
import { useAuth } from '../context/AuthContext'
import VideoService from '../services/video.service'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined'
import ThumbDownIcon from '@material-ui/icons/ThumbDown'
import ThumbDownOutlinedIcon from '@material-ui/icons/ThumbDownOutlined'
import VideoActionButtons from '../components/VideoActionButtons'
import NotificationContent from '../components/NotificationContent'
import NotificationIconWrapper from '../components/NotificationIconWrapper'
import DialogButton from '../components/DialogButton'
import DislikeButtonContainer from '../components/DislikeButtonContainer'
import DislikeText from '../components/DislikeText'
import SubscribeButton from '../components/SubscribeButton'

// Lấy API key từ utils/api.js để sử dụng trong component
const API_KEY = 'AIzaSyBXoEAacf5by-sCmAodjwWFqOcUv247Ies';

const AutoplayCountdown = ({ nextVideo, seconds, onCancel }) => {
  if (!nextVideo) return null;
  
  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: '4px',
        padding: '8px',
        zIndex: 10,
        maxWidth: '300px'
      }}
    >
      <div style={{ position: 'relative', marginRight: '10px', width: '100px', height: '56px' }}>
        {nextVideo.snippet.thumbnails.medium && (
          <img 
            src={nextVideo.snippet.thumbnails.medium.url} 
            alt={nextVideo.snippet.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }}
          />
        )}
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            bottom: 0, 
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '2px'
          }}
        >
          <div 
            style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {seconds}
          </div>
        </div>
      </div>
      <div>
        <div style={{ 
          fontSize: '12px', 
          color: 'white', 
          marginBottom: '4px',
          maxWidth: '160px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' 
        }}>
          Up next: {he.decode(nextVideo.snippet.title)}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#aaa'
        }}>
          Playing in {seconds} seconds
        </div>
        <button 
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '3px 8px',
            fontSize: '11px',
            marginTop: '4px',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const VideoPage = () => {
  const { videoId } = useParams();
  const history = useHistory();
  const location = history.location;
  
  // Debug videoId
  console.log("VideoID from useParams:", videoId);
  console.log("Current URL path:", location.pathname);
  
  // Kiểm tra và phân tích URL nếu videoId không tồn tại
  useEffect(() => {
    if (!videoId) {
      // Thử lấy ID từ URL nếu useParams không hoạt động
      const pathSegments = location.pathname.split('/');
      const possibleId = pathSegments[pathSegments.length - 1];
      console.log("Possible video ID from URL:", possibleId);
      
      // Nếu tìm thấy ID trong URL path
      if (possibleId && possibleId !== 'watch') {
        console.log("Redirecting to correct URL format with ID:", possibleId);
        history.replace(`/watch/${possibleId}`);
      }
    }
  }, [videoId, location.pathname, history]);
  
  // Các state và hooks khác
  const [video, setVideo] = useState(null);
  const [channelDetails, setChannelDetails] = useState(null)
  const [comments, setComments] = useState([])
  const [relatedVideos, setRelatedVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobileView = useIsMobileView()
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isInWatchLater, setIsInWatchLater] = useState(false)
  const [isInWatchHistory, setIsInWatchHistory] = useState(false)
  const { isLoggedIn, currentUser } = useAuth()
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info',
  })
  const [showAlternativeUrls, setShowAlternativeUrls] = useState(false)
  const [originalVideoContent, setOriginalVideoContent] = useState(null)
  const [showFeatureNotAvailable, setShowFeatureNotAvailable] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState('inappropriate_content')
  const [reportDescription, setReportDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoplayEnabled, setAutoplayEnabled] = useState(true)
  const [countdownActive, setCountdownActive] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(5)
  const [nextVideoToPlay, setNextVideoToPlay] = useState(null)
  const countdownRef = useRef(null)
  const [apiKeyValid, setApiKeyValid] = useState(null); // null = chưa kiểm tra, true/false = kết quả
  const [apiKeyError, setApiKeyError] = useState('');

  // Function to fetch video details
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        console.log("Loading video with ID:", videoId);
        
        try {
          const { data } = await request('/videos', {
            params: {
              part: 'snippet,contentDetails,statistics',
              id: videoId,
            },
          });

          console.log("YouTube API response received:", data);

          if (data && data.items && data.items.length > 0) {
            console.log("Setting video data:", data.items[0]);
            setVideo(data.items[0]);

            // Fetch channel details
            try {
              const channelResponse = await request('/channels', {
                params: {
                  part: 'snippet,statistics',
                  id: data.items[0].snippet.channelId,
                },
              });

              if (channelResponse.data && channelResponse.data.items && channelResponse.data.items.length > 0) {
                setChannelDetails(channelResponse.data.items[0]);
              }
            } catch (channelError) {
              console.error("Error fetching channel details:", channelError);
            }

            // Fetch comments (non-critical, so wrap in try-catch)
            try {
              const commentsResponse = await request('/commentThreads', {
                params: {
                  part: 'snippet',
                  videoId: videoId,
                  maxResults: 20,
                },
              });

              if (commentsResponse.data && commentsResponse.data.items) {
                setComments(commentsResponse.data.items);
              }
            } catch (commentsError) {
              console.error("Error fetching comments:", commentsError);
              // Non-critical, so continue
            }

            // Fetch related videos using the video title as search query
            fetchRelatedVideos(data.items[0].snippet.title);

            // Add to watch history if logged in
            if (isLoggedIn && currentUser) {
              try {
                const videoData = {
                  videoId: videoId,
                  title: data.items[0].snippet.title,
                  description: data.items[0].snippet.description,
                  thumbnailUrl: data.items[0].snippet.thumbnails.high?.url || data.items[0].snippet.thumbnails.default?.url,
                  channelTitle: data.items[0].snippet.channelTitle
                };
                
                await VideoService.addToWatchHistory(videoData);
              } catch (historyError) {
                console.error('Error adding video to watch history:', historyError);
              }
            }
          } else {
            console.error("No video data received or empty items array");
            setNotification({
              open: true,
              message: "Video not found on YouTube",
              severity: 'error'
            });
            
            // Set loading to false even if no video found
            setLoading(false);
          }
        } catch (youtubeError) {
          console.error("Error fetching video data from YouTube API:", youtubeError);
          
          setNotification({
            open: true,
            message: `Error loading video: ${youtubeError.message || 'Unknown error'}`,
            severity: 'error'
          });
          
          // Create a dummy video object to break out of loading state
          setVideo({
            id: videoId,
            snippet: {
              title: "Error loading video",
              description: "There was an error loading the video. Please try again later.",
              channelTitle: "Error",
              publishedAt: new Date().toISOString(),
              thumbnails: {
                high: { url: "https://via.placeholder.com/480x360?text=Error" }
              }
            },
            statistics: {
              viewCount: 0,
              likeCount: 0,
              dislikeCount: 0
            },
            isError: true
          });
        }
      } catch (error) {
        console.error("Unhandled error in fetchVideoDetails:", error);
        
        // Create a dummy video object to break out of loading state
        setVideo({
          id: videoId,
          snippet: {
            title: "Error",
            description: "An unexpected error occurred while loading the video.",
            channelTitle: "Error",
            publishedAt: new Date().toISOString(),
            thumbnails: {
              high: { url: "https://via.placeholder.com/480x360?text=Error" }
            }
          },
          statistics: {
            viewCount: 0,
            likeCount: 0,
            dislikeCount: 0
          },
          isError: true
        });
        
        setNotification({
          open: true,
          message: `Error: ${error.message || 'Unknown error'}`,
          severity: 'error'
        });
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    }

  // Function to check user interactions with the video (likes, dislikes, etc.)
  const checkUserInteractions = async () => {
      if (isLoggedIn && videoId) {
        try {
        // Check if video is liked
        const liked = await VideoService.isVideoLiked(videoId);
        setIsLiked(liked);
        
        // Check if video is disliked
        const disliked = await VideoService.isVideoDisliked(videoId);
        setIsDisliked(disliked);
        
        // Check if video is in watch later
        const inWatchLater = await VideoService.isVideoInWatchLater(videoId);
        setIsInWatchLater(inWatchLater);
        
        // Check if video is in watch history
        const inWatchHistory = await VideoService.isVideoInWatchHistory(videoId);
        setIsInWatchHistory(inWatchHistory);
        } catch (error) {
        console.error('Error checking user interactions:', error);
        }
      }
    }

  useEffect(() => {
    // Debug videoId
    console.log('VideoPage - videoId from useParams:', videoId);
    console.log('VideoPage - Current URL path:', location.pathname);

    // Check if we have the videoId from params or need to extract from state
    if (!videoId && location.state?.videoData) {
      console.log('No videoId in URL, but found videoData in location state:', location.state.videoData);
      const stateVideoId = location.state.videoData.videoId || location.state.videoData.id;
      if (stateVideoId) {
        console.log('Using videoId from location state:', stateVideoId);
        // Instead of redirecting, just use the video data we already have
        setVideo(location.state.videoData);
        setLoading(false);
        
        // Check user interactions
        if (isLoggedIn && stateVideoId) {
          checkUserInteractions(stateVideoId);
        }
        
        // If it's a local video, we can skip the API calls
        if (location.state.videoData.isLocalVideo || location.state.videoData.localVideoUrl) {
          console.log('This is a local video, skipping YouTube API calls');
          
          // Still try to fetch related videos based on the title
          if (location.state.videoData.snippet?.title) {
            fetchRelatedVideos(location.state.videoData.snippet.title);
          }
          
          return; // Skip the rest of this effect
        }
      }
    }

    if (!videoId && !location.state?.videoData) {
      console.error('No videoId provided in URL or location state');
      // Show an error and redirect to homepage after a delay
      setLoading(false);
      setVideo({
        id: 'error',
        snippet: {
          title: "Video Not Found",
          description: "No video ID was provided. You will be redirected to the homepage.",
          channelTitle: "Error",
          publishedAt: new Date().toISOString(),
          thumbnails: {
            high: { url: "https://via.placeholder.com/480x360?text=Video+Not+Found" }
          }
        },
        statistics: {
          viewCount: 0,
          likeCount: 0,
          dislikeCount: 0
        },
        isError: true
      });
      
      setNotification({
        open: true,
        message: "No video ID was provided. You will be redirected to the homepage.",
        severity: 'error'
      });
      
      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        history.push('/');
      }, 3000);
      
      return;
    }

    // If we have a videoId, try to load the video
    if (videoId) {
      // First check if the API key is valid to avoid unnecessary requests
      const apiKeyCheck = async () => {
        try {
          const isValid = await validateApiKey(API_KEY);
          return isValid;
        } catch (error) {
          console.error('Error validating API key:', error);
          return false;
        }
      };

      apiKeyCheck().then(isValid => {
        if (isValid) {
          // For local videos (numeric IDs typically), try to fetch from our backend first
          if (!isNaN(videoId) || videoId?.length < 8) {
            console.log(`VideoID ${videoId} looks like a local video ID, trying local API first`);
            VideoService.getVideoById(videoId)
              .then(localVideo => {
                console.log('Local video data received:', localVideo);
                
                if (localVideo && localVideo.videoUrl) {
                  // Transform to format compatible with our UI
                  const transformedVideo = {
                    id: localVideo.id.toString(),
                    videoId: localVideo.id.toString(),
                    isLocalVideo: true,
                    localVideoId: localVideo.id,
                    localVideoUrl: localVideo.videoUrl,
                    snippet: {
                      title: localVideo.title || 'Local Video',
                      description: localVideo.description || '',
                      channelTitle: localVideo.username || currentUser?.username || 'Unknown',
                      publishedAt: localVideo.createdAt || new Date().toISOString(),
                      thumbnails: {
                        default: { url: localVideo.thumbnailUrl },
                        medium: { url: localVideo.thumbnailUrl },
                        high: { url: localVideo.thumbnailUrl }
                      }
                    },
                    statistics: {
                      viewCount: localVideo.viewCount || 0,
                      likeCount: localVideo.likeCount || 0,
                      dislikeCount: localVideo.dislikeCount || 0
                    }
                  };
                  
                  setVideo(transformedVideo);
                  setLoading(false);
                  
                  // Check user interactions
                  checkUserInteractions();
                  
                  // Try to fetch related videos based on the title
                  fetchRelatedVideos(localVideo.title);
                } else {
                  // If local video fetch fails, try YouTube API as fallback
                  console.log('Local video not found or missing URL, trying YouTube API');
                  fetchVideoDetails();
                }
              })
              .catch(error => {
                console.error('Error loading local video:', error);
                // Fallback to YouTube API
                console.log('Falling back to YouTube API');
                fetchVideoDetails();
              });
          } else {
            // For YouTube video IDs (typically 11 characters), use the YouTube API
            console.log(`VideoID ${videoId} looks like a YouTube video ID`);
            fetchVideoDetails();
          }
        } else {
          console.error('API key is invalid, cannot load video details');
          setLoading(false);
          setVideo({
            id: videoId,
            snippet: {
              title: "API Key Error",
              description: "There was an error with the YouTube API key. Please update your API key.",
              channelTitle: "Error",
              publishedAt: new Date().toISOString(),
              thumbnails: {
                high: { url: "https://via.placeholder.com/480x360?text=API+Key+Error" }
              }
            },
            statistics: {
              viewCount: 0,
              likeCount: 0,
              dislikeCount: 0
            },
            isError: true
          });
        }
      });
    }

    // If the user is logged in, check their interactions with this video
    if (isLoggedIn && videoId) {
      checkUserInteractions();
    }
  }, [videoId, isLoggedIn, currentUser, history, location]);

  const fetchRelatedVideos = async (videoTitle) => {
    try {
      // Use the video title as search query, or a generic query for local videos
      let searchQuery = videoTitle.split(' ').slice(0, 3).join(' '); // Get first 3 words from title
      
      // For local videos, if the title doesn't provide good search terms, use some generic popular topics
      if (video?.isLocalVideo) {
        console.log("Fetching recommendations for local video:", videoId);
        // If this is our local video with ID 5, use a specific query for better recommendations
        if (videoId === '5') {
          searchQuery = 'youtube music video popular'; // Generic query that should return good results
        } else if (searchQuery.length < 10 || searchQuery.split(' ').length < 2) {
          // If title is too short or has very few words, supplement with generic terms
          searchQuery += ' video popular trending';
        }
      }
      
      console.log("Using search query for recommendations:", searchQuery);

      // Enhanced API parameters for better recommendations
      const { data } = await request('/search', {
        params: {
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          maxResults: 15, // Request more to have enough after filtering
          regionCode: 'VN',
          relevanceLanguage: 'vi',
          videoDuration: 'medium', // Filter for medium length videos
          videoEmbeddable: true,   // Ensure videos are embeddable
          videoSyndicated: true,   // Ensure videos can be played outside YouTube
          fields: 'items(id,snippet)'  // Optimize response size
        },
      });

      if (data.items && data.items.length > 0) {
        // Filter out the current video if it appears in search results
        const filteredItems = data.items.filter(item => {
          // For local videos, filter by making sure these are YouTube videos (different format)
          if (video?.isLocalVideo) {
            return true; // Keep all YouTube videos for local video recommendations
          }
          // For YouTube videos, filter out the current video
          return item.id.videoId !== videoId;
        });

        // Get detailed information about the videos
        if (filteredItems.length > 0) {
          const videoIds = filteredItems.map(item => item.id.videoId).join(',');

          const videoDetailsResponse = await request('/videos', {
            params: {
              part: 'snippet,contentDetails,statistics',
              id: videoIds,
              maxResults: 10,
              fields: 'items(id,snippet,contentDetails,statistics)' // Optimize response
            },
          });

          if (videoDetailsResponse.data.items) {
            // Save videos for autoplay and display
            setRelatedVideos(videoDetailsResponse.data.items.slice(0, 10));
            
            // If autoplay is enabled, preload the first video
            if (autoplayEnabled && videoDetailsResponse.data.items.length > 0) {
              const nextVideoId = videoDetailsResponse.data.items[0].id;
              console.log("Preloading next video for autoplay:", nextVideoId);
              // Preload the next video in a hidden iframe if supported
              const preloadFrame = document.createElement('link');
              preloadFrame.rel = 'preload';
              preloadFrame.as = 'document';
              preloadFrame.href = `https://www.youtube.com/embed/${nextVideoId}?autoplay=0`;
              document.head.appendChild(preloadFrame);
            }
          }
        } else {
          // Fallback to popular videos if no related videos found
          fetchPopularVideos();
        }
      } else {
        // Fallback to popular videos if search returned no results
        fetchPopularVideos();
      }

      setLoading(false);
    } catch (error) {
      console.log("Error fetching related videos:", error);
      // If there's an error with the search, fall back to popular videos
      fetchPopularVideos();
    }
  }

  // Helper function to fetch popular videos as fallback
  const fetchPopularVideos = async () => {
    try {
      console.log("Fetching popular videos as fallback");
        const popularVideosResponse = await request('/videos', {
          params: {
            part: 'snippet,contentDetails,statistics',
            chart: 'mostPopular',
            regionCode: 'VN',
            maxResults: 10,
          },
      });

        if (popularVideosResponse.data.items) {
        // Filter out the current video if it's from YouTube
          const filteredPopularVideos = popularVideosResponse.data.items.filter(
            item => item.id !== videoId
        );
        setRelatedVideos(filteredPopularVideos);
      }
    } catch (fallbackError) {
      console.log("Fallback error:", fallbackError);
      setRelatedVideos([]); // Empty array if even the fallback fails
    } finally {
      setLoading(false);
    }
  }

  const handleRelatedVideoClick = (relatedVideoId) => {
    // For related videos, we always need to navigate to YouTube-style URLs
    // This ensures proper playback whether coming from local or YouTube videos
    
    console.log("Clicked on related video:", relatedVideoId);
    
    // Cancel any active autoplay countdown
    if (countdownActive) {
      cancelAutoplayCountdown();
    }
    
    // If we're using the YouTube iframe API, we can use a smoother transition
    if (window.YT && window.YT.Player && !video?.isLocalVideo) {
      const player = document.getElementById('youtube-player');
      if (player) {
        try {
          // Update iframe src directly for smoother transition
          player.src = `https://www.youtube.com/embed/${relatedVideoId}?origin=${window.location.origin}&enablejsapi=1&autoplay=1&rel=0`;
          
          // Also update browser URL and history without full page reload
          history.push(`/watch/${relatedVideoId}`);
          
          // Reset some states that should be updated for the new video
          setLoading(true);
          
          // We need to fetch the new video details
          // This would typically happen in an useEffect when videoId changes
          // but we need to manually trigger it here for better performance
          const getVideoDetails = async () => {
            try {
              console.log("Fetching details for newly selected video:", relatedVideoId);
              
              const { data } = await request('/videos', {
          params: {
                  part: 'snippet,statistics,player',
                  id: relatedVideoId,
                },
              });
              
              if (data.items.length > 0) {
                setVideo(data.items[0]);
                // Fetch related videos for the new video
                fetchRelatedVideos(data.items[0].snippet.title);
              }
              
              setLoading(false);
            } catch (error) {
              console.error("Error fetching video details:", error);
              setLoading(false);
            }
          };
          
          getVideoDetails();
          return;
        } catch (error) {
          console.error("Error updating YouTube player directly:", error);
          // Fall back to regular navigation
        }
      }
    }
    
    // Standard navigation between YouTube videos if the above method fails
    if (video?.isLocalVideo) {
      // If clicking a YouTube recommendation from a local video page,
      // we need to use the YouTube watch format
      console.log("Navigating from local video to YouTube video");
      history.push(`/watch/${relatedVideoId}`);
    } else {
      // Standard navigation between YouTube videos
      history.push(`/watch/${relatedVideoId}`);
    }
  }

  const handleLikeToggle = async () => {
    try {
      if (!isLoggedIn) {
        setNotification({
          open: true,
          message: "You need to sign in to like videos",
          severity: 'warning'
        });
        return;
      }
      
      if (isLiked) {
        await VideoService.unlikeVideo(videoId);
        setIsLiked(false);
        setNotification({
          open: true,
          message: "Video unliked successfully",
          severity: 'info'
        });
      } else {
        if (isDisliked) {
          await VideoService.undislikeVideo(videoId);
          setIsDisliked(false);
        }
        
        const videoData = {
          videoId: videoId,
          title: video?.snippet?.title || '',
          description: video?.snippet?.description || '',
          thumbnailUrl: video?.snippet?.thumbnails?.high?.url || '',
          channelTitle: video?.snippet?.channelTitle || ''
        };
        
        console.log("Liking video with data:", JSON.stringify({
          videoId: videoData.videoId,
          title: videoData.title.substring(0, 30) + '...'
        }));
        
        await VideoService.likeVideo(videoData);
        setIsLiked(true);
        setNotification({
          open: true,
          message: "Video liked successfully",
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      let errorMessage = "Error toggling like status";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "The like service is unavailable. Please try again later.";
        } else if (error.response.status === 0 || error.response.status === 'cors') {
          errorMessage = "CORS error: The backend server is not accessible. Please check that it's running and properly configured.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message === 'Network Error') {
        errorMessage = "Cannot connect to the backend server. Please ensure it's running.";
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDislikeToggle = async () => {
    try {
      if (!isLoggedIn) {
        setNotification({
          open: true,
          message: "You need to sign in to dislike videos",
          severity: 'warning'
        });
        return;
      }
      
      if (isDisliked) {
        await VideoService.undislikeVideo(videoId);
        setIsDisliked(false);
        setNotification({
          open: true,
          message: "Video undisliked successfully",
          severity: 'info'
        });
      } else {
        if (isLiked) {
          await VideoService.unlikeVideo(videoId);
          setIsLiked(false);
        }
        
        const videoData = {
          videoId: videoId,
          title: video?.snippet?.title || '',
          description: video?.snippet?.description || '',
          thumbnailUrl: video?.snippet?.thumbnails?.high?.url || '',
          channelTitle: video?.snippet?.channelTitle || ''
        };
        
        console.log("Disliking video with data:", JSON.stringify({
          videoId: videoData.videoId,
          title: videoData.title.substring(0, 30) + '...'
        }));
        
        await VideoService.dislikeVideo(videoData);
        setIsDisliked(true);
        setNotification({
          open: true,
          message: "Video disliked successfully",
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
      let errorMessage = "Error toggling dislike status";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "The dislike service is unavailable. Please try again later.";
        } else if (error.response.status === 0 || error.response.status === 'cors') {
          errorMessage = "CORS error: The backend server is not accessible. Please check that it's running and properly configured.";  
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message === 'Network Error') {
        errorMessage = "Cannot connect to the backend server. Please ensure it's running.";
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleWatchLaterToggle = async () => {
    if (!isLoggedIn) {
      history.push('/login')
      return
    }
    
    try {
      if (isInWatchLater) {
        await VideoService.removeFromWatchLater(videoId)
        setIsInWatchLater(false)
        setNotification({
          open: true,
          message: `Video removed from ${currentUser.username || currentUser.email}'s Watch Later in your database`,
          severity: 'info',
          linkTo: '/watch-later'
        })
      } else {
        const videoData = {
          videoId,
          title: video?.snippet?.title || '',
          description: video?.snippet?.description || '',
          thumbnailUrl: video?.snippet?.thumbnails?.high?.url || '',
          channelTitle: video?.snippet?.channelTitle || ''
        }
        await VideoService.addToWatchLater(videoData)
        setIsInWatchLater(true)
        setNotification({
          open: true,
          message: `Video saved to ${currentUser.username || currentUser.email}'s Watch Later in your database`,
          severity: 'success',
          linkTo: '/watch-later'
        })
      }
    } catch (error) {
      console.error('Error toggling watch later:', error)
      
      // Kiểm tra các loại lỗi cụ thể liên quan đến database
      if (error.response) {
        // Lỗi từ server
        if (error.response.status === 500) {
          setNotification({
            open: true,
            message: `Database error: Please check your MySQL connection and make sure it's running`,
            severity: 'error'
          })
        } else {
          setNotification({
            open: true,
            message: `Error updating Watch Later: ${error.response.data.message || error.message}`,
            severity: 'error'
          })
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        setNotification({
          open: true,
          message: `Cannot connect to backend server. Please make sure backend is running on port 8080`,
          severity: 'error'
        })
      } else {
        // Lỗi khác
        setNotification({
          open: true,
          message: `Error updating Watch Later: ${error.message}`,
          severity: 'error'
        })
      }
    }
  }

  const handleReportClick = () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.token) {
      // User is not logged in, redirect to login page
      setNotification({
        open: true,
        message: "You need to sign in to report videos",
        severity: 'warning'
      });
      history.push('/login');
      return;
    }
    
    // User is logged in, open the report dialog
    setReportDialogOpen(true);
  }

  const handleReportDialogClose = () => {
    setReportDialogOpen(false)
    // Reset form state
    setReportReason('inappropriate_content')
    setReportDescription('')
  }

  const handleReportSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Get the user object with token from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.token) {
        throw new Error("You need to sign in to report videos");
      }
      
      const reportData = {
        videoId: videoId,
        reason: reportReason,
        description: reportDescription,
        title: video?.snippet?.title || 'Report'
      };
      
      console.log('Submitting report with data:', reportData);
      
      // Submit report to backend
      const response = await fetch('http://localhost:8080/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(reportData)
      });
      
      console.log('Report response status:', response.status);
      
      // Add better error handling for different status codes
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please sign in again.");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to report videos.");
        } else if (response.status === 404) {
          throw new Error("Report endpoint not found. Please contact support.");
        } else if (response.status === 500) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          
          if (errorText.includes("report_reason")) {
            throw new Error("Server error: Field 'report_reason' issue. Please try again later.");
          } else {
            throw new Error(`Server error: ${response.status}. Please try again later.`);
          }
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || `Server error: ${response.status}`;
          } catch (e) {
            errorMessage = `Server error: ${response.status}`;
          }
          
          throw new Error(errorMessage);
        }
      }
      
      let data;
      try {
        data = await response.json();
        console.log('Report submitted successfully:', data);
      } catch (e) {
        console.log('No JSON response, but report was submitted successfully');
      }
      
      setNotification({
        open: true,
        message: 'Your report has been submitted successfully',
        severity: 'success'
      });
      
      handleReportDialogClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      setNotification({
        open: true,
        message: `Error submitting report: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    })
  }

  const toggleAutoplay = (enabled) => {
    console.log(`Autoplay ${enabled ? 'enabled' : 'disabled'}`);
    setAutoplayEnabled(enabled);
    
    // If disabling autoplay, cancel any active countdown
    if (!enabled && countdownActive) {
      cancelAutoplayCountdown();
    }
    
    // Store user preference in localStorage
    localStorage.setItem('youtube_clone_autoplay', JSON.stringify(enabled));
    
    // If using the YouTube API Player, you can control autoplay directly:
    try {
      if (window.YT && window.YT.Player) {
        // This would apply to an existing YouTube player instance
        const player = document.querySelector('iframe#youtube-player');
        if (player && player.contentWindow) {
          // YouTube API autoplay setting
          player.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: enabled ? 'playVideo' : 'pauseVideo'
          }), '*');
        }
      }
    } catch (error) {
      console.error('Error controlling YouTube player:', error);
    }
  };
  
  // Load autoplay preference from localStorage on component mount
  useEffect(() => {
    const savedAutoplay = localStorage.getItem('youtube_clone_autoplay');
    if (savedAutoplay !== null) {
      setAutoplayEnabled(JSON.parse(savedAutoplay));
    }
  }, []);

  // Handle video ended event - start countdown for next video
  const handleVideoEnded = () => {
    if (autoplayEnabled && relatedVideos.length > 0) {
      // Set the next video to play
      setNextVideoToPlay(relatedVideos[0]);
      // Start countdown
      setCountdownActive(true);
      setCountdownSeconds(5);
      
      // Set interval for countdown
      countdownRef.current = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            // Time's up - play next video and clear interval
            clearInterval(countdownRef.current);
            setCountdownActive(false);
            handleRelatedVideoClick(relatedVideos[0].id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  
  // Cancel autoplay countdown
  const cancelAutoplayCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      setCountdownActive(false);
    }
  };
  
  // Clear the interval when component unmounts
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);
  
  // Update YouTube API onStateChange to use handleVideoEnded
  useEffect(() => {
    if (window.YT && window.YT.Player && !video?.isLocalVideo) {
      const player = document.getElementById('youtube-player');
      if (player) {
        try {
          new window.YT.Player('youtube-player', {
            events: {
              'onStateChange': (event) => {
                // State 0 means the video has ended
                if (event.data === 0) {
                  handleVideoEnded();
                }
              }
            }
          });
        } catch (error) {
          console.error('Error initializing YouTube player:', error);
        }
      }
    }
  }, [video, relatedVideos, autoplayEnabled]);

  // Add YouTube API key setup
  useEffect(() => {
    // Setup YouTube API with your key
    if (!window.googleApiLoaded) {
      console.log("Setting up YouTube API");
      window.googleApiLoaded = true;
      
      // Load Google API client library
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        window.gapi.load('client', () => {
          console.log("Attempting to initialize YouTube API with key");
          window.gapi.client.init({
            apiKey: 'AIzaSyBXoEAacf5by-sCmAodjwWFqOcUv247Ies', // Use correct API key
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"],
          }).then(() => {
            console.log("Google API client initialized successfully");
          }).catch(error => {
            console.error("Error initializing YouTube API:", error);
            // Hiển thị thông báo lỗi chi tiết hơn
            if (error.details && error.details.includes("API key not valid")) {
              console.error("API key is invalid. Please check your API key configuration.");
            } else if (error.details && error.details.includes("quota")) {
              console.error("YouTube API quota exceeded. Please try again later.");
            } else {
              console.error("Failed to initialize YouTube API client:", error.details || error.message || "Unknown error");
            }
            
            // Thử lại với chỉ apiKey mà không có discoveryDocs
            console.log("Trying alternative initialization...");
            window.gapi.client.setApiKey('AIzaSyBXoEAacf5by-sCmAodjwWFqOcUv247Ies');
            console.log("API key set directly");
          });
        });
      };
      document.body.appendChild(script);
    }
  }, []);

  // Add a new handleChannelClick function after the other handler functions
  const handleChannelClick = () => {
    if (!channelDetails || !channelDetails.id) {
      console.log("No channel details available");
      return;
    }
    
    console.log("Navigating to channel:", channelDetails.id);
    
    // For YouTube channels, open in a new tab
    if (!video.isLocalVideo) {
      window.open(`https://www.youtube.com/channel/${channelDetails.id}`, '_blank');
      return;
    }
    
    // For local users/channels, navigate within the app
    // This assumes you have a user profile page at /user/{userId}
    history.push(`/user/${channelDetails.id}`);
  };

  // Kiểm tra API key khi component mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const result = await validateApiKey();
        console.log('API key validation result:', result);
        setApiKeyValid(result.valid);
        if (!result.valid) {
          setApiKeyError(`${result.message}${result.details ? ': ' + result.details : ''}`);
          // Thông báo lỗi để người dùng biết
          setNotification({
            open: true,
            message: `YouTube API key error: ${result.message}`,
            severity: 'error'
          });
        }
      } catch (err) {
        console.error('Error validating API key:', err);
        setApiKeyValid(false);
        setApiKeyError('Exception occurred while validating API key');
      }
    };
    
    checkApiKey();
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
        {loading && apiKeyValid === false && (
          <>
            <Typography 
              variant="body1" 
              color="error" 
              style={{marginTop: '16px', maxWidth: '80%', textAlign: 'center'}}
            >
              YouTube API key is invalid or has reached quota limits. 
              <br />
              Error: {apiKeyError}
            </Typography>
            
            <Box mt={2} p={2} bgcolor="#fff4e5" borderRadius={1} maxWidth="600px">
              <Typography variant="body2" style={{marginBottom: '8px'}}>
                Current API key: <strong>{API_KEY}</strong>
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={async () => {
                  try {
                    setNotification({
                      open: true,
                      message: 'Testing API key...',
                      severity: 'info'
                    });
                    
                    const result = await validateApiKey();
                    setApiKeyValid(result.valid);
                    setApiKeyError(result.valid ? '' : `${result.message}${result.details ? ': ' + result.details : ''}`);
                    
                    setNotification({
                      open: true,
                      message: result.valid 
                        ? 'API key is valid! Try refreshing the page.' 
                        : `API key is invalid: ${result.message}`,
                      severity: result.valid ? 'success' : 'error'
                    });
                  } catch (err) {
                    console.error('Error checking API key:', err);
                    setNotification({
                      open: true,
                      message: 'Error checking API key',
                      severity: 'error'
                    });
                  }
                }}
                style={{marginRight: '8px'}}
              >
                Test API Key
              </Button>
              
              <Button
                variant="outlined"
                style={{marginTop: '8px'}}
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Box>
          </>
        )}
      </LoadingContainer>
    )
  }

  if (!video) {
    return (
      <ErrorContainer>
        <Typography variant="h5">Video not found</Typography>
      </ErrorContainer>
    )
  }

  // Hiển thị cảnh báo nếu video có trạng thái lỗi
  if (video.isError) {
    return (
      <ErrorContainer>
        <Typography variant="h5">Error loading video</Typography>
        <Typography variant="body1" style={{ marginTop: '16px', color: '#666' }}>
          {video.errorDetails || 'There was a problem loading the video. This may be due to network issues or YouTube API quota limits.'}
        </Typography>
        
        {apiKeyValid === false && (
          <Box mt={2} p={2} bgcolor="#fff4e5" borderRadius={1} maxWidth="600px">
            <Typography variant="subtitle1" color="error">
              YouTube API Key Issue Detected
            </Typography>
            <Typography variant="body2" style={{marginTop: '8px'}}>
              Error: {apiKeyError}
            </Typography>
            <Typography variant="body2" style={{marginTop: '8px', marginBottom: '16px'}}>
              The application is currently using the API key: <strong>{API_KEY}</strong>
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={async () => {
                try {
                  const result = await validateApiKey();
                  setApiKeyValid(result.valid);
                  setApiKeyError(result.valid ? '' : `${result.message}${result.details ? ': ' + result.details : ''}`);
                  
                  setNotification({
                    open: true,
                    message: result.valid 
                      ? 'API key is valid! Try refreshing the page.' 
                      : `API key is invalid: ${result.message}`,
                    severity: result.valid ? 'success' : 'error'
                  });
                } catch (err) {
                  console.error('Error checking API key:', err);
                  setNotification({
                    open: true,
                    message: 'Error checking API key',
                    severity: 'error'
                  });
                }
              }}
              style={{marginRight: '8px'}}
            >
              Test API Key
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => {
                const newKey = prompt('Enter a new YouTube API Key:', API_KEY);
                if (newKey && newKey.trim() !== '') {
                  // Không thể thực sự thay đổi API key trong runtime, nhưng có thể hướng dẫn người dùng
                  setNotification({
                    open: true,
                    message: 'To change the API key, you need to edit the .env file and restart the application.',
                    severity: 'info'
                  });
                  
                  console.log('User wants to set new API key:', newKey);
                }
              }}
            >
              Change API Key
            </Button>
          </Box>
        )}
        
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            style={{ marginLeft: '8px' }}
            onClick={() => history.push('/')}
          >
            Go to Homepage
          </Button>
        </Box>
      </ErrorContainer>
    )
  }

  // Trích xuất thông tin video với try-catch để tránh lỗi
  let title, channelTitle, publishedAt, description, viewCount, likeCount, dislikeCount;
  
  try {
    // Trích xuất dữ liệu từ đối tượng video
    title = video.snippet?.title || 'Untitled Video';
    channelTitle = video.snippet?.channelTitle || 'Unknown Channel';
    publishedAt = video.snippet?.publishedAt || new Date().toISOString();
    description = video.snippet?.description || '';
    viewCount = video.statistics?.viewCount || 0;
    likeCount = video.statistics?.likeCount || 0;
    dislikeCount = video.statistics?.dislikeCount || 0;
  } catch (error) {
    console.error('Error extracting video data:', error);
    // Nếu có lỗi khi trích xuất, sử dụng giá trị mặc định
    title = 'Error loading video';
    channelTitle = 'Unknown';
    publishedAt = new Date().toISOString();
    description = 'Video data could not be loaded correctly';
    viewCount = 0;
    likeCount = 0;
    dislikeCount = 0;
  }

  return (
    <VideoPageContainer>
      <PageContent>
        <MainContent>
          <VideoPlayerContainer id="videoContainer">
            {video.isLocalVideo ? (
              // Local video player for our own uploaded videos
              <>
                <video
                  controls
                  autoPlay
                  src={video.localVideoUrl}
                  onError={(e) => {
                    console.error("Video playback error:", e);
                    console.log("Attempted URL:", video.localVideoUrl);
                    
                    // Extract filename and clean it properly
                    const urlParts = video.localVideoUrl.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    console.log("Extracted filename:", filename);
                    
                    // Show error notification with direct link
                    setNotification({
                      open: true,
                      message: "Error playing video. Please try using the direct links below.",
                      severity: 'warning'
                    });
                    
                    // Replace the video player with a more direct approach
                    const container = document.getElementById('videoContainer');
                    if (container) {
                      // Create a direct HTML5 video player with multiple sources
                      // This bypasses React's rendering and directly sets HTML
                      const videoHtml = `
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: black; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                          <div style="width: 100%; height: 70%; position: relative;">
                            <video 
                              id="directVideo" 
                              controls 
                              autoplay 
                              style="width: 100%; height: 100%; background: #000;"
                            >
                              <source src="http://localhost:8080/api/videos/stream/${filename}" type="video/mp4">
                              <source src="http://localhost:8080/videos/stream/${filename}" type="video/mp4">
                              <source src="http://localhost:8080/api/videos/${filename}" type="video/mp4">
                              Your browser does not support HTML5 video.
                            </video>
                          </div>
                          
                          <div style="margin-top: 20px; width: 90%; padding: 10px; background: rgba(0,0,0,0.5); border-radius: 8px;">
                            <p style="color: white; margin-bottom: 10px;">Try these direct links:</p>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                              <a href="http://localhost:8080/api/videos/stream/${filename}" 
                                 target="_blank"
                                 style="background: #cc0000; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">
                                Open in New Tab
                              </a>
                              <a href="http://localhost:8080/api/videos/stream/${filename}" 
                                 download="${title || 'video'}.mp4" 
                                 style="background: #4285f4; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">
                                Download Video
                              </a>
                              <button 
                                 onclick="window.open('/direct-video.html?src=http://localhost:8080/api/videos/stream/${filename}', '_blank')"
                                 style="background: #0f9d58; color: white; padding: 8px 12px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
                                Open Simple Player
                              </button>
                            </div>
                          </div>
                        </div>
                      `;
                      
                      container.innerHTML = videoHtml;
                      
                      // Add event listener to the new video element
                      const directVideo = document.getElementById('directVideo');
                      if (directVideo) {
                        directVideo.onerror = () => {
                          console.error("All sources failed, showing alternatives");
                          const alternativeHtml = `
                            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: black; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
                              <h3 style="color: white; margin-bottom: 20px;">Unable to play video directly</h3>
                              <p style="color: #aaa; margin-bottom: 30px;">
                                The video cannot be played in the browser due to security restrictions or format issues.
                                Please try one of the options below:
                              </p>
                              
                              <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
                                <a href="http://localhost:8080/api/videos/stream/${filename}" 
                                   download="${title || 'video'}.mp4" 
                                   style="background: #4285f4; color: white; padding: 10px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">
                                  Download Video
                                </a>
                                <a href="http://localhost:8080/api/videos/stream/${filename}" 
                                   target="_blank"
                                   style="background: #cc0000; color: white; padding: 10px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">
                                  Open Direct URL
                                </a>
                              </div>
                              
                              <div style="margin-top: 30px; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; max-width: 500px;">
                                <p style="color: #aaa; margin-bottom: 10px; font-size: 12px;">Debug Information:</p>
                                <code style="color: #ddd; font-size: 11px; word-break: break-all;">
                                  Filename: ${filename}<br>
                                  URL: ${video.localVideoUrl}
                                </code>
                              </div>
                            </div>
                          `;
                          container.innerHTML = alternativeHtml;
                        };
                      }
                      
                      console.log("Replaced video player with direct HTML5 player");
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000',
                  }}
                />
                
                {/* Video troubleshooting tools */}
                <div style={{ 
                  position: 'absolute',
                  bottom: '-50px',
                  left: 0,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    startIcon={<InfoIcon />}
                    onClick={() => setShowAlternativeUrls(!showAlternativeUrls)}
                  >
                    Try Alternatives
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<DatabaseIcon />}
                    href={video.localVideoUrl}
                    download
                    target="_blank"
                  >
                    Download Video
                  </Button>
                </div>
                
                {/* Alternative URLs Dropdown */}
                {showAlternativeUrls && (
                  <Paper 
                    elevation={3} 
                    style={{ 
                      position: 'absolute',
                      bottom: '-250px',
                      left: 0,
                      width: '100%',
                      padding: '15px', 
                      backgroundColor: '#f5f5f5',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Alternative Video URLs
                    </Typography>
                    
                    {(() => {
                      let filename = '';
                      const localUrl = video.localVideoUrl;
                      
                      if (localUrl) {
                        const urlParts = localUrl.split('/');
                        filename = urlParts[urlParts.length - 1];
                        
                        return (
                          <>
                            <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                              Current filename: {filename}
                            </Typography>
                            
                            {/* Alternative URLs */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" style={{ minWidth: '120px' }}>
                                  Direct URL:
                                </Typography>
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  onClick={() => {
                                    const videoElement = document.querySelector('#videoContainer video');
                                    if (videoElement) {
                                      const url = `http://localhost:8080/${filename}`;
                                      videoElement.src = url;
                                      videoElement.load();
                                      console.log('Trying URL:', url);
                                    }
                                  }}
                                >
                                  Try
                                </Button>
                                <Typography variant="caption" style={{ marginLeft: '10px', fontSize: '10px', color: '#666' }}>
                                  http://localhost:8080/{filename}
                                </Typography>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" style={{ minWidth: '120px' }}>
                                  Videos path:
                                </Typography>
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  onClick={() => {
                                    const videoElement = document.querySelector('#videoContainer video');
                                    if (videoElement) {
                                      const url = `http://localhost:8080/videos/${filename}`;
                                      videoElement.src = url;
                                      videoElement.load();
                                      console.log('Trying URL:', url);
                                    }
                                  }}
                                >
                                  Try
                                </Button>
                                <Typography variant="caption" style={{ marginLeft: '10px', fontSize: '10px', color: '#666' }}>
                                  http://localhost:8080/videos/{filename}
                                </Typography>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" style={{ minWidth: '120px' }}>
                                  API Videos path:
                                </Typography>
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  onClick={() => {
                                    const videoElement = document.querySelector('#videoContainer video');
                                    if (videoElement) {
                                      const url = `http://localhost:8080/api/videos/${filename}`;
                                      videoElement.src = url;
                                      videoElement.load();
                                      console.log('Trying URL:', url);
                                    }
                                  }}
                                >
                                  Try
                                </Button>
                                <Typography variant="caption" style={{ marginLeft: '10px', fontSize: '10px', color: '#666' }}>
                                  http://localhost:8080/api/videos/{filename}
                                </Typography>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" style={{ minWidth: '120px' }}>
                                  Stream path:
                                </Typography>
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  onClick={() => {
                                    const videoElement = document.querySelector('#videoContainer video');
                                    if (videoElement) {
                                      const url = `http://localhost:8080/videos/stream/${filename}`;
                                      videoElement.src = url;
                                      videoElement.load();
                                      console.log('Trying URL:', url);
                                    }
                                  }}
                                >
                                  Try
                                </Button>
                                <Typography variant="caption" style={{ marginLeft: '10px', fontSize: '10px', color: '#666' }}>
                                  http://localhost:8080/videos/stream/{filename}
                                </Typography>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" style={{ minWidth: '120px' }}>
                                  API Stream path:
                                </Typography>
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  onClick={() => {
                                    const videoElement = document.querySelector('#videoContainer video');
                                    if (videoElement) {
                                      const url = `http://localhost:8080/api/videos/stream/${filename}`;
                                      videoElement.src = url;
                                      videoElement.load();
                                      console.log('Trying URL:', url);
                                    }
                                  }}
                                >
                                  Try
                                </Button>
                                <Typography variant="caption" style={{ marginLeft: '10px', fontSize: '10px', color: '#666' }}>
                                  http://localhost:8080/api/videos/stream/{filename}
                                </Typography>
                              </div>
                              
                              <Typography variant="subtitle2" style={{ marginTop: '10px' }}>
                                Alternative Players
                              </Typography>
                              
                              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                <Button 
                                  variant="contained" 
                                  color="primary"
                                  size="small"
                                  onClick={() => {
                                    const container = document.getElementById('videoContainer');
                                    if (container) {
                                      // Store original content if not already stored
                                      if (!originalVideoContent) {
                                        setOriginalVideoContent(container.innerHTML);
                                      }
                                      
                                      // Create iframe player
                                      const iframe = document.createElement('iframe');
                                      iframe.width = '100%';
                                      iframe.height = '100%';
                                      iframe.style.position = 'absolute';
                                      iframe.style.top = '0';
                                      iframe.style.left = '0';
                                      iframe.src = video.localVideoUrl;
                                      iframe.frameBorder = '0';
                                      iframe.allowFullscreen = true;
                                      
                                      // Replace container content with iframe
                                      container.innerHTML = '';
                                      container.appendChild(iframe);
                                      
                                      console.log('Using iframe player with URL:', video.localVideoUrl);
                                    }
                                  }}
                                >
                                  Use iframe
                                </Button>
                                
                                <Button 
                                  variant="contained" 
                                  color="primary"
                                  size="small"
                                  onClick={() => {
                                    const container = document.getElementById('videoContainer');
                                    if (container) {
                                      // Store original content if not already stored
                                      if (!originalVideoContent) {
                                        setOriginalVideoContent(container.innerHTML);
                                      }
                                      
                                      // Create embed tag
                                      const embed = document.createElement('embed');
                                      embed.width = '100%';
                                      embed.height = '100%';
                                      embed.style.position = 'absolute';
                                      embed.style.top = '0';
                                      embed.style.left = '0';
                                      embed.src = video.localVideoUrl;
                                      embed.type = 'video/mp4';
                                      
                                      // Replace container content with embed
                                      container.innerHTML = '';
                                      container.appendChild(embed);
                                      
                                      console.log('Using embed player with URL:', video.localVideoUrl);
                                    }
                                  }}
                                >
                                  Use embed
                                </Button>
                                
                                {originalVideoContent && (
                                  <Button 
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                      // Restore original content
                                      const container = document.getElementById('videoContainer');
                                      if (container) {
                                        container.innerHTML = originalVideoContent;
                                        console.log('Restored original video player');
                                      }
                                    }}
                                  >
                                    Restore
                                  </Button>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      }
                      
                      return null;
                    })()}
                  </Paper>
                )}
              </>
            ) : (
              // YouTube iframe embed - update with API parameters
            <iframe
                id="youtube-player"
                src={`https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}&enablejsapi=1&autoplay=1&rel=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
                onLoad={() => {
                  // Initialize YouTube Player API
                  if (!window.youtubeApiLoaded) {
                    const tag = document.createElement('script');
                    tag.src = "https://www.youtube.com/iframe_api";
                    document.body.appendChild(tag);
                    window.youtubeApiLoaded = true;
                    
                    // Set up YouTube API callback
                    window.onYouTubeIframeAPIReady = () => {
                      console.log("YouTube API ready");
                      new window.YT.Player('youtube-player', {
                        events: {
                          'onStateChange': (event) => {
                            // When video ends (state = 0), auto-advance if autoplay is enabled
                            if (event.data === 0 && autoplayEnabled && relatedVideos.length > 0) {
                              console.log("Video ended, advancing to next video");
                              handleRelatedVideoClick(relatedVideos[0].id);
                            }
                          }
                        }
                      });
                    };
                  }
                }}
            ></iframe>
            )}
          </VideoPlayerContainer>

          <VideoInfoSection>
            <VideoTitle variant="h1">{he.decode(title)}</VideoTitle>

            <VideoStats>
              <ViewsAndDate>
                <Typography variant="body2">
                  {numeral(viewCount).format('0,0')} views • {moment(publishedAt).format('MMM D, YYYY')}
                </Typography>
              </ViewsAndDate>

              <ActionButtons>
                <ActionButton onClick={handleLikeToggle}>
                  {isLiked ? <ThumbUpIcon style={{ color: '#3ea6ff' }} /> : <ThumbUpAltOutlinedIcon />}
                  <Typography variant="body2">{numeral(likeCount).format('0,0')}</Typography>
                </ActionButton>

                <ActionButton onClick={handleDislikeToggle}>
                  {isDisliked ? <ThumbDownIcon style={{ color: '#3ea6ff' }} /> : <ThumbDownAltOutlinedIcon />}
                  <Typography variant="body2">{dislikeCount ? numeral(dislikeCount).format('0,0') : ''}</Typography>
                </ActionButton>

                <ActionButton>
                  <ShareOutlinedIcon />
                  <Typography variant="body2"></Typography>
                </ActionButton>

                <ActionButton onClick={handleWatchLaterToggle}>
                  {isInWatchLater ? <WatchLaterIcon style={{ color: '#3ea6ff' }} /> : <PlaylistAddOutlinedIcon />}
                  <Typography variant="body2" style={{ display: 'flex', alignItems: 'center' }}>
                    {isInWatchLater ? 'ĐÃ LƯU' : ''} 
                    <DatabaseIcon style={{ fontSize: '0.8rem', marginLeft: '2px', color: isInWatchLater ? '#3ea6ff' : 'inherit' }} />
                  </Typography>
                </ActionButton>

                <ActionButton onClick={handleReportClick}>
                  <FlagOutlinedIcon />
                  <Typography variant="body2">Report</Typography>
                </ActionButton>

                <IconButton>
                  <MoreHorizOutlinedIcon />
                </IconButton>
              </ActionButtons>
            </VideoStats>

            <Divider />

            <ChannelInfo>
              <ChannelHeader>
                <ChannelAvatarLink onClick={handleChannelClick}>
                <ChannelAvatar
                  src={channelDetails?.snippet?.thumbnails?.default?.url}
                  alt={channelTitle}
                />
                </ChannelAvatarLink>

                <ChannelText onClick={handleChannelClick}>
                  <Typography variant="h3">{channelTitle}</Typography>
                  <Typography variant="body2">
                    {channelDetails ? numeral(channelDetails.statistics.subscriberCount).format('0.0a') : '0'} subscribers
                  </Typography>
                </ChannelText>

                {channelDetails && (
                  <SubscribeButton 
                    channelId={channelDetails.id}
                    channelUsername={channelTitle}
                    channelThumbnailUrl={channelDetails?.snippet?.thumbnails?.default?.url}
                    subscriberCount={channelDetails?.statistics?.subscriberCount || 0}
                  />
                )}
              </ChannelHeader>

              <DescriptionContainer>
                <Typography variant="body2">{description}</Typography>
              </DescriptionContainer>
            </ChannelInfo>

            <Divider />

            <CommentsSection>
              <CommentHeader>
                <Typography variant="h2">
                  {numeral(comments.length).format('0,0')} Comments
                </Typography>
              </CommentHeader>

              {comments.map((comment) => (
                <CommentItem key={comment.id}>
                  <CommentAvatar
                    src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
                    alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
                  />

                  <CommentContent>
                    <CommentHeader>
                      <Typography variant="body1">
                        {comment.snippet.topLevelComment.snippet.authorDisplayName}
                      </Typography>
                      <Typography variant="body2">
                        {moment(comment.snippet.topLevelComment.snippet.publishedAt).fromNow()}
                      </Typography>
                    </CommentHeader>

                    <Typography variant="body2">
                      {comment.snippet.topLevelComment.snippet.textDisplay}
                    </Typography>

                    <CommentActions>
                      <ThumbUpAltOutlinedIcon fontSize="small" />
                      <Typography variant="body2">
                        {numeral(comment.snippet.topLevelComment.snippet.likeCount).format('0,0')}
                      </Typography>
                      <ThumbDownAltOutlinedIcon fontSize="small" />
                    </CommentActions>
                  </CommentContent>
                </CommentItem>
              ))}
            </CommentsSection>

            {/* Only show related videos in mobile view inside main content */}
            {isMobileView && relatedVideos.length > 0 && (
              <RelatedVideosMobile>
                <Typography variant="h2" style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  marginBottom: '12px',
                  paddingLeft: '8px'
                }}>
                  Up next
                </Typography>
                {relatedVideos.map((video, index) => (
                  <RelatedVideoItem
                    key={video.id}
                    onClick={() => handleRelatedVideoClick(video.id)}
                  >
                    <RelatedVideoThumbnail>
                      {index === 0 && (
                        <AutoplayBadge onClick={(e) => e.stopPropagation()}>
                          <AutoplayToggle 
                            isActive={autoplayEnabled} 
                            onToggle={toggleAutoplay} 
                          />
                        </AutoplayBadge>
                      )}
                      <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                      />
                      <Duration>
                        {getFormattedDurationString(video.contentDetails.duration)}
                      </Duration>
                    </RelatedVideoThumbnail>
                    <RelatedVideoInfo>
                      <RelatedVideoTitle>
                        {he.decode(video.snippet.title)}
                      </RelatedVideoTitle>
                      <RelatedVideoChannel>
                        {video.snippet.channelTitle}
                      </RelatedVideoChannel>
                      <RelatedVideoStats>
                        {numeral(video.statistics.viewCount).format('0.0a')} views • {moment(video.snippet.publishedAt).fromNow()}
                      </RelatedVideoStats>
                    </RelatedVideoInfo>
                  </RelatedVideoItem>
                ))}
              </RelatedVideosMobile>
            )}
          </VideoInfoSection>
        </MainContent>

        {/* Always show related videos in desktop view as sidebar */}
        {relatedVideos.length > 0 && (
          <RelatedVideosSection>
            <Typography variant="h2" style={{ 
              fontSize: '16px', 
              fontWeight: '500', 
              marginBottom: '12px',
              paddingLeft: '8px'
            }}>
              Up next
            </Typography>
            {relatedVideos.map((video, index) => (
              <RelatedVideoItem
                key={video.id}
                onClick={() => handleRelatedVideoClick(video.id)}
              >
                <RelatedVideoThumbnail>
                  {index === 0 && (
                    <AutoplayBadge onClick={(e) => e.stopPropagation()}>
                      <AutoplayToggle 
                        isActive={autoplayEnabled} 
                        onToggle={toggleAutoplay} 
                      />
                    </AutoplayBadge>
                  )}
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                  />
                  <Duration>
                    {getFormattedDurationString(video.contentDetails.duration)}
                  </Duration>
                </RelatedVideoThumbnail>
                <RelatedVideoInfo>
                  <RelatedVideoTitle>
                    {he.decode(video.snippet.title)}
                  </RelatedVideoTitle>
                  <RelatedVideoChannel>
                    {video.snippet.channelTitle}
                  </RelatedVideoChannel>
                  <RelatedVideoStats>
                    {numeral(video.statistics.viewCount).format('0.0a')} views • {moment(video.snippet.publishedAt).fromNow()}
                  </RelatedVideoStats>
                </RelatedVideoInfo>
              </RelatedVideoItem>
            ))}
          </RelatedVideosSection>
        )}
      </PageContent>

      {/* Report Dialog */}
      <Dialog 
        open={reportDialogOpen} 
        onClose={handleReportDialogClose}
        aria-labelledby="report-dialog-title"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '8px',
            padding: '8px'
          }
        }}
      >
        <DialogTitle id="report-dialog-title" style={{ paddingBottom: '8px' }}>
          Report Video: {video?.snippet?.title ? video.snippet.title.substring(0, 40) + (video.snippet.title.length > 40 ? '...' : '') : ''}
        </DialogTitle>
        <DialogContent>
          {video?.snippet?.thumbnails?.medium?.url && (
            <Box mb={2} display="flex" alignItems="center">
              <img 
                src={video.snippet.thumbnails.medium.url} 
                alt={video.snippet.title} 
                style={{ width: '120px', height: '68px', marginRight: '12px', objectFit: 'cover', borderRadius: '4px' }} 
              />
              <Typography variant="body2" color="textSecondary">
                {video.snippet.channelTitle}
              </Typography>
            </Box>
          )}
          <Typography variant="subtitle1" gutterBottom>
            Why are you reporting this video?
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Select the most appropriate reason for your report. This helps our moderation team assess the content properly.
          </Typography>
          <FormControl component="fieldset" fullWidth margin="normal">
            <RadioGroup 
              value={reportReason} 
              onChange={(e) => setReportReason(e.target.value)}
            >
              <FormControlLabel 
                value="inappropriate_content" 
                control={<Radio color="primary" />} 
                label={<>
                  <Typography variant="body2">Inappropriate content</Typography>
                  <Typography variant="caption" color="textSecondary">Content that may be unsuitable for some audiences</Typography>
                </>} 
              />
              <FormControlLabel 
                value="harmful_dangerous_content" 
                control={<Radio color="primary" />} 
                label={<>
                  <Typography variant="body2">Harmful or dangerous content</Typography>
                  <Typography variant="caption" color="textSecondary">Content that may encourage harmful activities</Typography>
                </>}
              />
              <FormControlLabel 
                value="violent_graphic_content" 
                control={<Radio color="primary" />} 
                label={<>
                  <Typography variant="body2">Violent or graphic content</Typography>
                  <Typography variant="caption" color="textSecondary">Content containing violence or disturbing imagery</Typography>
                </>}
              />
              <FormControlLabel 
                value="spam_misleading" 
                control={<Radio color="primary" />} 
                label={<>
                  <Typography variant="body2">Spam or misleading</Typography>
                  <Typography variant="caption" color="textSecondary">Deceptive, misleading, or repetitive content</Typography>
                </>}
              />
              <FormControlLabel 
                value="copyright_violation" 
                control={<Radio color="primary" />} 
                label={<>
                  <Typography variant="body2">Copyright violation</Typography>
                  <Typography variant="caption" color="textSecondary">Content that infringes on copyright</Typography>
                </>}
              />
              <FormControlLabel 
                value="other" 
                control={<Radio color="primary" />} 
                label={<>
                  <Typography variant="body2">Other</Typography>
                  <Typography variant="caption" color="textSecondary">Please specify in additional details</Typography>
                </>}
              />
            </RadioGroup>
          </FormControl>
          
          <TextField
            label="Additional details (optional)"
            multiline
            rows={4}
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="Please provide any additional details about your report"
          />
          
          <Box mt={2} p={1.5} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="body2" display="flex" alignItems="center">
              <InfoIcon style={{ fontSize: '16px', marginRight: '8px', color: '#2196f3' }} />
              Your report will be saved to our database and reviewed by our team
            </Typography>
          </Box>
        </DialogContent>
        <StyledDialogActions>
          <Button onClick={handleReportDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleReportSubmit} 
            color="primary" 
            variant="contained"
            disabled={isSubmitting}
            style={{ 
              backgroundColor: isSubmitting ? '#ccc' : '#f44336', 
              color: 'white',
              minWidth: '120px'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </StyledDialogActions>
      </Dialog>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={props => <Slide {...props} direction="up" />}
      >
        <NotificationContent severity={notification.severity}>
          <NotificationIconWrapper>
            {notification.severity === 'success' && <CheckCircleIcon style={{ color: '#4caf50' }} />}
            {notification.severity === 'info' && <InfoIcon style={{ color: '#2196f3' }} />}
            {notification.severity === 'error' && <ErrorIcon style={{ color: '#f44336' }} />}
            <DatabaseIcon style={{ marginLeft: '4px', fontSize: '0.9rem' }} />
          </NotificationIconWrapper>
          <Typography style={{ marginLeft: 8, flexGrow: 1 }}>{notification.message}</Typography>
          {notification.linkTo && (
            <Button 
              color="primary" 
              size="small" 
              onClick={() => history.push(notification.linkTo)}
              style={{ minWidth: 'auto', marginRight: '8px' }}
            >
              View List
            </Button>
          )}
          <IconButton size="small" color="inherit" onClick={handleCloseNotification}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </NotificationContent>
      </Snackbar>

      {/* Add countdown component inside VideoPlayerContainer */}
      {countdownActive && nextVideoToPlay && (
        <AutoplayCountdown 
          nextVideo={nextVideoToPlay}
          seconds={countdownSeconds}
          onCancel={cancelAutoplayCountdown}
        />
      )}
    </VideoPageContainer>
  )
}

const VideoLikeButton = ({ videoInfo, isLiked, onLikeToggle }) => {
  const { isLoggedIn } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const history = useHistory()

  const handleLikeClick = async () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true)
      return
    }

    onLikeToggle()
  }

  const handleLogin = () => {
    history.push('/login')
    setShowLoginDialog(false)
  }

  const handleClose = () => {
    setShowLoginDialog(false)
  }

  return (
    <>
      <LikeButtonContainer onClick={handleLikeClick}>
        {isLiked ?
          <ThumbUpIcon style={{ color: '#3ea6ff' }} /> :
          <ThumbUpOutlinedIcon />
        }
        <LikeText $isActive={isLiked}>Like</LikeText>
      </LikeButtonContainer>

      {showLoginDialog && (
        <LoginDialogBackdrop onClick={handleClose}>
          <LoginDialogContainer onClick={(e) => e.stopPropagation()}>
            <CustomDialogTitle>Sign in to like this video</CustomDialogTitle>
            <CustomDialogContent>
              Signed-in users can like videos and build playlists. Sign in to save your preferences.
            </CustomDialogContent>
            <StyledDialogActions>
              <DialogButton onClick={handleClose}>Cancel</DialogButton>
              <DialogButton $primary onClick={handleLogin}>Sign In</DialogButton>
            </StyledDialogActions>
          </LoginDialogContainer>
        </LoginDialogBackdrop>
      )}
    </>
  )
}

const VideoDislikeButton = ({ videoInfo, isDisliked, onDislikeToggle }) => {
  const { isLoggedIn } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const history = useHistory()

  const handleDislikeClick = async () => {
    if (!isLoggedIn) {
      setShowLoginDialog(true)
      return
    }

    onDislikeToggle()
  }

  const handleLogin = () => {
    history.push('/login')
    setShowLoginDialog(false)
  }

  const handleClose = () => {
    setShowLoginDialog(false)
  }

  return (
    <>
      <DislikeButtonContainer onClick={handleDislikeClick}>
        {isDisliked ?
          <ThumbDownIcon style={{ color: '#3ea6ff' }} /> :
          <ThumbDownOutlinedIcon />
        }
        <DislikeText $isActive={isDisliked}>Dislike</DislikeText>
      </DislikeButtonContainer>

      {showLoginDialog && (
        <LoginDialogBackdrop onClick={handleClose}>
          <LoginDialogContainer onClick={(e) => e.stopPropagation()}>
            <CustomDialogTitle>Sign in to dislike this video</CustomDialogTitle>
            <CustomDialogContent>
              Signed-in users can dislike videos and build playlists. Sign in to save your preferences.
            </CustomDialogContent>
            <StyledDialogActions>
              <DialogButton onClick={handleClose}>Cancel</DialogButton>
              <DialogButton $primary onClick={handleLogin}>Sign In</DialogButton>
            </StyledDialogActions>
          </LoginDialogContainer>
        </LoginDialogBackdrop>
      )}
    </>
  )
}

export default VideoPage

// Styled components
const VideoPageContainer = styled.div`
  padding: 0;
  width: 100%;
  margin: 0 auto;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    padding: 24px 24px 0 24px;
  }
`

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    flex-direction: row;
    max-width: 1280px;
    margin: 0 auto;
    gap: 24px;
  }
`

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    flex: 1;
    max-width: calc(100% - 426px);
  }
`

const VideoPlayerContainer = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`

const VideoInfoSection = styled.div`
  margin-top: 12px;
  padding: 0 16px;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    padding: 0;
  }
`

const VideoTitle = styled(Typography)`
  && {
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
    margin-bottom: 8px;
    
    @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
      font-size: 20px;
      line-height: 28px;
    }
  }
`

const VideoStats = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`

const ViewsAndDate = styled.div`
  margin-bottom: 8px;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    margin-bottom: 0;
  }
`

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
`

const ActionButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  cursor: pointer;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    flex-direction: row;
    
    svg {
      margin-right: 4px;
    }
  }
`

const ChannelInfo = styled.div`
  margin: 16px 0;
`

const ChannelHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`

const ChannelAvatar = styled(Avatar)`
  && {
    width: 48px;
    height: 48px;
    margin-right: 12px;
  }
`

const ChannelText = styled.div`
  flex: 1;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  h3 {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
  }
`

const DescriptionContainer = styled.div`
  margin-top: 16px;
  white-space: pre-line;
`

const CommentsSection = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;
`

const CommentHeader = styled.div`
  margin-bottom: 24px;
  
  h2 {
    font-size: 16px;
    font-weight: 500;
  }
`

const CommentItem = styled.div`
  display: flex;
  margin-bottom: 24px;
`

const CommentAvatar = styled(Avatar)`
  && {
    width: 40px;
    height: 40px;
    margin-right: 16px;
  }
`

const CommentContent = styled.div`
  flex: 1;
`

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  
  svg {
    margin-right: 4px;
    cursor: pointer;
  }
  
  p {
    margin-right: 12px;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
`

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
`

// Style cho các video liên quan
const RelatedVideosSection = styled.div`
  display: block;
  width: 100%;
  margin-top: 16px;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    display: block;
    width: 402px;
    min-width: 402px;
    margin-top: 0;
    
    h2 {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
    }
  }
`

const RelatedVideosMobile = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;
  
  h2 {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    display: none;
  }
`

const RelatedVideoItem = styled.div`
  display: flex;
  margin-bottom: 8px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`

const RelatedVideoThumbnail = styled.div`
  position: relative;
  width: 168px;
  min-width: 168px;
  height: 94px;
  margin-right: 8px;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Duration = styled.div`
  position: absolute;
  right: 4px;
  bottom: 4px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 500;
`

const RelatedVideoInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 4px;
`

const RelatedVideoTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #0f0f0f;
`

const RelatedVideoChannel = styled.p`
  font-size: 12px;
  color: #606060;
  margin: 0 0 4px 0;
`

const RelatedVideoStats = styled.p`
  font-size: 12px;
  color: #606060;
  margin: 0;
`

const AutoplayBadge = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 2px;
  font-weight: 500;
  z-index: 1;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`

const AutoplayToggle = ({ isActive, onToggle }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onToggle(!isActive);
  };
  
  return (
    <div 
      onClick={handleClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center',
        padding: '2px',
        cursor: 'pointer'
      }}
    >
      <span style={{ marginRight: '4px' }}>Autoplay</span>
      <div 
        style={{
          width: '28px',
          height: '14px',
          backgroundColor: isActive ? '#3ea6ff' : '#909090',
          borderRadius: '7px',
          position: 'relative',
          transition: 'background-color 0.2s',
          marginLeft: '4px'
        }}
      >
        <div 
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '1px',
            left: isActive ? '15px' : '1px',
            transition: 'left 0.2s'
          }}
        />
      </div>
    </div>
  );
};

const LikeButtonContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 16px;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`

const LikeText = styled.span`
  margin-left: 4px;
  font-size: 14px;
  color: ${props => props.$isActive ? '#3ea6ff' : 'inherit'};
`

const LoginDialogBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`

const LoginDialogContainer = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 4px;
  width: 300px;
`

const CustomDialogTitle = styled.h2`
  margin-bottom: 16px;
`

const CustomDialogContent = styled.p`
  margin-bottom: 24px;
`

const StyledDialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
`

const ChannelAvatarLink = styled.div`
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`