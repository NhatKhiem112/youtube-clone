import React, { useState, useEffect, forwardRef } from 'react'
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
import { request } from '../utils/api'
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

const VideoPage = () => {
  const { videoId } = useParams()
  const history = useHistory()
  const [video, setVideo] = useState(null)
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
    severity: 'success'
  })
  const [showFeatureNotAvailable, setShowFeatureNotAvailable] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState('inappropriate_content')
  const [reportDescription, setReportDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true)
        const { data } = await request('/videos', {
          params: {
            part: 'snippet,contentDetails,statistics',
            id: videoId,
          },
        })

        if (data.items.length > 0) {
          setVideo(data.items[0])

          // Fetch channel details
          const channelResponse = await request('/channels', {
            params: {
              part: 'snippet,statistics',
              id: data.items[0].snippet.channelId,
            },
          })

          if (channelResponse.data.items.length > 0) {
            setChannelDetails(channelResponse.data.items[0])
          }

          // Fetch comments
          const commentsResponse = await request('/commentThreads', {
            params: {
              part: 'snippet',
              videoId: videoId,
              maxResults: 20,
            },
          })

          if (commentsResponse.data.items) {
            setComments(commentsResponse.data.items)
          }

          // Fetch related videos using the video title as search query
          fetchRelatedVideos(data.items[0].snippet.title)

          // Thêm vào lịch sử xem nếu đã đăng nhập
          if (isLoggedIn && currentUser) {
            try {
              console.log("Thêm video vào lịch sử xem:", videoId);
              const videoData = {
                videoId: videoId,
                title: data.items[0].snippet.title,
                description: data.items[0].snippet.description,
                thumbnailUrl: data.items[0].snippet.thumbnails.high?.url || data.items[0].snippet.thumbnails.default?.url,
                channelTitle: data.items[0].snippet.channelTitle
              };
              
              const response = await VideoService.addToWatchHistory(videoData);
              console.log("Kết quả thêm video vào lịch sử:", response);
              
              // Kiểm tra xem đã thêm thành công chưa
              const inHistory = await VideoService.isVideoInWatchHistory(videoId);
              console.log("Video có trong lịch sử:", inHistory);
              setIsInWatchHistory(inHistory);
            } catch (historyError) {
              console.error('Lỗi khi thêm video vào lịch sử xem:', historyError);
              if (historyError.response) {
                console.error('Server response:', historyError.response.data);
              }
            }
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.log(error)
        setLoading(false)
      }
    }

    fetchVideoDetails()
  }, [videoId, isLoggedIn, currentUser])

  useEffect(() => {
    const checkIfVideoIsLiked = async () => {
      if (isLoggedIn && videoId) {
        try {
          const liked = await VideoService.isVideoLiked(videoId)
          setIsLiked(liked)
        } catch (error) {
          console.error('Error checking if video is liked:', error)
        }
      }
    }

    checkIfVideoIsLiked()
  }, [isLoggedIn, videoId])

  useEffect(() => {
    const checkIfVideoIsDisliked = async () => {
      if (isLoggedIn && videoId) {
        try {
          const disliked = await VideoService.isVideoDisliked(videoId)
          setIsDisliked(disliked)
        } catch (error) {
          console.error('Error checking if video is disliked:', error)
        }
      }
    }

    checkIfVideoIsDisliked()
  }, [isLoggedIn, videoId])

  useEffect(() => {
    const checkIfVideoIsInWatchLater = async () => {
      if (isLoggedIn && videoId) {
        try {
          const inWatchLater = await VideoService.isVideoInWatchLater(videoId)
          setIsInWatchLater(inWatchLater)
        } catch (error) {
          console.error('Error checking if video is in watch later:', error)
        }
      }
    }

    checkIfVideoIsInWatchLater()
  }, [isLoggedIn, videoId])

  useEffect(() => {
    const checkIfVideoIsInWatchHistory = async () => {
      if (isLoggedIn && videoId) {
        try {
          const inWatchHistory = await VideoService.isVideoInWatchHistory(videoId);
          setIsInWatchHistory(inWatchHistory);
        } catch (error) {
          console.error('Error checking if video is in watch history:', error);
        }
      }
    };

    checkIfVideoIsInWatchHistory();
  }, [isLoggedIn, videoId]);

  const fetchRelatedVideos = async (videoTitle) => {
    try {
      // Thay vì sử dụng relatedToVideoId (có thể bị hạn chế), 
      // chúng ta sẽ tìm kiếm dựa trên tiêu đề video
      const searchQuery = videoTitle.split(' ').slice(0, 3).join(' ') // Lấy 3 từ đầu tiên từ tiêu đề

      const { data } = await request('/search', {
        params: {
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          maxResults: 10,
          regionCode: 'VN',
          relevanceLanguage: 'vi',
        },
      })

      if (data.items && data.items.length > 0) {
        // Lọc ra video hiện tại nếu nó xuất hiện trong kết quả tìm kiếm
        const filteredItems = data.items.filter(item => item.id.videoId !== videoId)

        // Lấy thêm thông tin chi tiết của các video
        if (filteredItems.length > 0) {
          const videoIds = filteredItems.map(item => item.id.videoId).join(',')

          const videoDetailsResponse = await request('/videos', {
            params: {
              part: 'snippet,contentDetails,statistics',
              id: videoIds,
            },
          })

          if (videoDetailsResponse.data.items) {
            setRelatedVideos(videoDetailsResponse.data.items)
          }
        } else {
          // Nếu không tìm thấy video phù hợp, sử dụng API videos để lấy video phổ biến
          const popularVideosResponse = await request('/videos', {
            params: {
              part: 'snippet,contentDetails,statistics',
              chart: 'mostPopular',
              regionCode: 'VN',
              maxResults: 10,
            },
          })

          if (popularVideosResponse.data.items) {
            // Lọc ra video hiện tại nếu có
            const filteredPopularVideos = popularVideosResponse.data.items.filter(
              item => item.id !== videoId
            )
            setRelatedVideos(filteredPopularVideos)
          }
        }
      } else {
        // Nếu không tìm thấy video liên quan, sử dụng API videos để lấy video phổ biến
        const popularVideosResponse = await request('/videos', {
          params: {
            part: 'snippet,contentDetails,statistics',
            chart: 'mostPopular',
            regionCode: 'VN',
            maxResults: 10,
          },
        })

        if (popularVideosResponse.data.items) {
          // Lọc ra video hiện tại nếu có
          const filteredPopularVideos = popularVideosResponse.data.items.filter(
            item => item.id !== videoId
          )
          setRelatedVideos(filteredPopularVideos)
        }
      }

      setLoading(false)
    } catch (error) {
      console.log(error)
      // Nếu có lỗi khi tìm kiếm, sử dụng API videos để lấy video phổ biến
      try {
        const popularVideosResponse = await request('/videos', {
          params: {
            part: 'snippet,contentDetails,statistics',
            chart: 'mostPopular',
            regionCode: 'VN',
            maxResults: 10,
          },
        })

        if (popularVideosResponse.data.items) {
          // Lọc ra video hiện tại nếu có
          const filteredPopularVideos = popularVideosResponse.data.items.filter(
            item => item.id !== videoId
          )
          setRelatedVideos(filteredPopularVideos)
        }
      } catch (fallbackError) {
        console.log("Fallback error:", fallbackError)
      }

      setLoading(false)
    }
  }

  const handleRelatedVideoClick = (relatedVideoId) => {
    history.push(`/watch/${relatedVideoId}`)
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
        // If the video is disliked, undislike it first
        if (isDisliked) {
          await VideoService.undislikeVideo(videoId);
          setIsDisliked(false);
        }
        
        const videoData = {
          videoId,
          title: video?.snippet?.title || '',
          description: video?.snippet?.description || '',
          thumbnailUrl: video?.snippet?.thumbnails?.high?.url || '',
          channelTitle: video?.snippet?.channelTitle || ''
        };
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
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
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
        // If the video is liked, unlike it first
        if (isLiked) {
          await VideoService.unlikeVideo(videoId);
          setIsLiked(false);
        }
        
        const videoData = {
          videoId,
          title: video?.snippet?.title || '',
          description: video?.snippet?.description || '',
          thumbnailUrl: video?.snippet?.thumbnails?.high?.url || '',
          channelTitle: video?.snippet?.channelTitle || ''
        };
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
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
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

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
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

  const {
    snippet: {
      title,
      channelTitle,
      publishedAt,
      description
    },
    statistics: {
      viewCount,
      likeCount,
      dislikeCount
    }
  } = video

  return (
    <VideoPageContainer>
      <PageContent>
        <MainContent>
          <VideoPlayerContainer>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            ></iframe>
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
                <ChannelAvatar
                  src={channelDetails?.snippet?.thumbnails?.default?.url}
                  alt={channelTitle}
                />

                <ChannelText>
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

            {/* Hiển thị video liên quan trên mobile */}
            {isMobileView && relatedVideos.length > 0 && (
              <RelatedVideosMobile>
                <Typography variant="h2" gutterBottom>
                  Đề xuất xem tiếp
                </Typography>
                {relatedVideos.map((video) => (
                  <RelatedVideoItem
                    key={video.id}
                    onClick={() => handleRelatedVideoClick(video.id)}
                  >
                    <RelatedVideoThumbnail>
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

        {/* Hiển thị video liên quan trên desktop */}
        {!isMobileView && relatedVideos.length > 0 && (
          <RelatedVideosSection>
            <Typography variant="h2" gutterBottom>
              Đề xuất xem tiếp
            </Typography>
            {relatedVideos.map((video) => (
              <RelatedVideoItem
                key={video.id}
                onClick={() => handleRelatedVideoClick(video.id)}
              >
                <RelatedVideoThumbnail>
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
  }
`

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    flex: 1;
    margin-right: 24px;
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
  display: none;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    display: block;
    width: 350px;
    
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
  margin-bottom: 16px;
  cursor: pointer;
`

const RelatedVideoThumbnail = styled.div`
  position: relative;
  width: 168px;
  min-width: 168px;
  height: 94px;
  margin-right: 8px;
  
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
`

const RelatedVideoChannel = styled.p`
  font-size: 13px;
  color: #606060;
  margin: 0 0 4px 0;
`

const RelatedVideoStats = styled.p`
  font-size: 13px;
  color: #606060;
  margin: 0;
`

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