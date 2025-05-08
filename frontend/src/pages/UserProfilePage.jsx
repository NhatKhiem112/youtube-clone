import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import {
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Paper,
  Divider,
  Box,
  Chip
} from '@material-ui/core';
import axios from 'axios';
import moment from 'moment';
import numeral from 'numeral';
import { request } from '../utils/api';
import VideoService from '../services/video.service';
import SubscriptionService from '../services/subscription.service';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import PersonIcon from '@material-ui/icons/Person';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';

const UserProfilePage = () => {
  const { userId } = useParams();
  const history = useHistory();
  const { isLoggedIn, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isYoutubeChannel, setIsYoutubeChannel] = useState(false);
  
  // Check if this is a YouTube channel ID format
  useEffect(() => {
    const isYouTubeId = userId && /^UC[a-zA-Z0-9_-]{22}$/.test(userId);
    setIsYoutubeChannel(isYouTubeId);
  }, [userId]);
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isYoutubeChannel) {
          // For YouTube channels, use the YouTube API
          await fetchYouTubeChannelData();
        } else {
          // For local users, use your backend API
          await fetchLocalUserData();
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId, isYoutubeChannel]);
  
  const fetchYouTubeChannelData = async () => {
    try {
      // Get channel details from YouTube API
      const { data } = await request('/channels', {
        params: {
          part: 'snippet,statistics',
          id: userId,
        },
      });
      
      if (data.items && data.items.length > 0) {
        const channelData = data.items[0];
        setUserProfile({
          id: channelData.id,
          username: channelData.snippet.title,
          email: null, // YouTube API doesn't provide email
          avatarUrl: channelData.snippet.thumbnails.medium.url,
          banner: channelData.brandingSettings?.image?.bannerExternalUrl,
          description: channelData.snippet.description,
          subscribers: channelData.statistics.subscriberCount,
          videoCount: channelData.statistics.videoCount,
          viewCount: channelData.statistics.viewCount,
          createdAt: channelData.snippet.publishedAt,
          isYouTubeChannel: true
        });
        
        // Get channel videos
        const videosResponse = await request('/search', {
          params: {
            part: 'snippet',
            channelId: userId,
            maxResults: 12,
            order: 'date',
            type: 'video'
          },
        });
        
        if (videosResponse.data.items) {
          // Get detailed video info
          const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');
          const videoDetailsResponse = await request('/videos', {
            params: {
              part: 'snippet,contentDetails,statistics',
              id: videoIds,
            },
          });
          
          if (videoDetailsResponse.data.items) {
            setUserVideos(videoDetailsResponse.data.items);
          }
        }
      } else {
        setError('YouTube channel not found');
      }
    } catch (error) {
      console.error('Error fetching YouTube channel data:', error);
      setError('Failed to load YouTube channel information');
    }
  };
  
  const fetchLocalUserData = async () => {
    try {
      // This is a mock implementation - replace with your actual API call
      // For example: const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
      
      // For now, using VideoService to get user's videos
      const videos = await VideoService.getUserVideos();
      setUserVideos(videos);
      
      // Mock user profile data - replace with actual API data
      setUserProfile({
        id: userId,
        username: videos.length > 0 ? videos[0].username : `User ${userId}`,
        email: null,
        avatarUrl: null,
        description: "This is a local user account in our database.",
        subscribers: 0,
        videoCount: videos.length,
        viewCount: videos.reduce((total, video) => total + (video.viewCount || 0), 0),
        createdAt: videos.length > 0 ? videos[0].createdAt : new Date().toISOString(),
        isYouTubeChannel: false
      });
      
      // Check subscription status if logged in
      if (isLoggedIn) {
        try {
          const isSubbed = await SubscriptionService.isSubscribed(userId);
          setIsSubscribed(isSubbed);
          
          const notifEnabled = await SubscriptionService.hasNotificationsEnabled(userId);
          setNotificationsEnabled(notifEnabled);
        } catch (err) {
          console.error('Error checking subscription status:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching local user data:', error);
      setError('Failed to load user information');
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleSubscribeToggle = async () => {
    if (!isLoggedIn) {
      history.push('/login');
      return;
    }
    
    try {
      if (isSubscribed) {
        await SubscriptionService.unsubscribe(userId);
        setIsSubscribed(false);
        setNotificationsEnabled(false);
      } else {
        const channelData = {
          channelId: userId,
          channelTitle: userProfile.username,
          thumbnailUrl: userProfile.avatarUrl,
        };
        await SubscriptionService.subscribe(channelData);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };
  
  const handleNotificationToggle = async () => {
    if (!isLoggedIn || !isSubscribed) return;
    
    try {
      await SubscriptionService.toggleNotifications(userId);
      setNotificationsEnabled(!notificationsEnabled);
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };
  
  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <ErrorContainer>
        <Typography variant="h5" color="error">{error}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => history.goBack()}
          style={{ marginTop: '20px' }}
        >
          Go Back
        </Button>
      </ErrorContainer>
    );
  }
  
  if (!userProfile) {
    return (
      <ErrorContainer>
        <Typography variant="h5">User not found</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => history.goBack()}
          style={{ marginTop: '20px' }}
        >
          Go Back
        </Button>
      </ErrorContainer>
    );
  }
  
  return (
    <ProfileContainer>
      <UserBanner style={userProfile.banner ? { backgroundImage: `url(${userProfile.banner})` } : {}}>
        {!userProfile.banner && (
          <DefaultBannerOverlay />
        )}
      </UserBanner>
      
      <UserInfoSection>
        <UserAvatarSection>
          <UserAvatar src={userProfile.avatarUrl} alt={userProfile.username}>
            {!userProfile.avatarUrl && <PersonIcon style={{ width: '60%', height: '60%' }} />}
          </UserAvatar>
        </UserAvatarSection>
        
        <UserDetailsSection>
          <Typography variant="h4" component="h1">{userProfile.username}</Typography>
          
          <UserStats>
            <Typography variant="body2">
              {numeral(userProfile.subscribers).format('0,0')} subscribers • {userProfile.videoCount} videos
            </Typography>
            {userProfile.viewCount && (
              <Typography variant="body2">
                {numeral(userProfile.viewCount).format('0,0')} total views
              </Typography>
            )}
          </UserStats>
          
          <Chip
            icon={userProfile.isYouTubeChannel ? <VideoLibraryIcon /> : <PersonIcon />}
            label={userProfile.isYouTubeChannel ? "YouTube Channel" : "Local User"}
            variant="outlined"
            size="small"
            style={{ marginTop: '8px' }}
          />
        </UserDetailsSection>
        
        <SubscriptionSection>
          {isLoggedIn && userId !== (currentUser?.id?.toString() || '') && (
            <>
              <SubscribeButton 
                variant="contained" 
                color={isSubscribed ? "default" : "primary"}
                onClick={handleSubscribeToggle}
              >
                {isSubscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
              </SubscribeButton>
              
              {isSubscribed && (
                <NotificationButton onClick={handleNotificationToggle}>
                  {notificationsEnabled ? (
                    <NotificationsActiveIcon fontSize="small" />
                  ) : (
                    <NotificationsOffIcon fontSize="small" />
                  )}
                </NotificationButton>
              )}
            </>
          )}
        </SubscriptionSection>
      </UserInfoSection>
      
      <TabsSection>
        <StyledTabs 
          value={activeTab} 
          onChange={handleTabChange}
          centered
          indicatorColor="primary"
        >
          <StyledTab label="VIDEOS" />
          <StyledTab label="ABOUT" />
        </StyledTabs>
      </TabsSection>
      
      <Divider />
      
      <TabContent>
        {activeTab === 0 && (
          <VideosTab>
            {userVideos.length === 0 ? (
              <NoVideosMessage>
                <Typography variant="h6">No videos found</Typography>
              </NoVideosMessage>
            ) : (
              <Grid container spacing={2}>
                {userVideos.map((video) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
                    <VideoCard 
                      video={video}
                      onClick={() => history.push(`/watch/${video.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </VideosTab>
        )}
        
        {activeTab === 1 && (
          <AboutTab>
            <AboutSection>
              <Typography variant="h6">Description</Typography>
              <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                {userProfile.description || "No description available"}
              </Typography>
            </AboutSection>
            
            <AboutSection>
              <Typography variant="h6">Stats</Typography>
              <StatsGrid>
                <StatItem>
                  <Typography variant="body2" color="textSecondary">Joined</Typography>
                  <Typography variant="body1">{moment(userProfile.createdAt).format('MMMM D, YYYY')}</Typography>
                </StatItem>
                <StatItem>
                  <Typography variant="body2" color="textSecondary">Subscribers</Typography>
                  <Typography variant="body1">{numeral(userProfile.subscribers).format('0,0')}</Typography>
                </StatItem>
                <StatItem>
                  <Typography variant="body2" color="textSecondary">Videos</Typography>
                  <Typography variant="body1">{userProfile.videoCount}</Typography>
                </StatItem>
                <StatItem>
                  <Typography variant="body2" color="textSecondary">Total Views</Typography>
                  <Typography variant="body1">{numeral(userProfile.viewCount).format('0,0')}</Typography>
                </StatItem>
              </StatsGrid>
            </AboutSection>
          </AboutTab>
        )}
      </TabContent>
    </ProfileContainer>
  );
};

// Styled Components
const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px 30px;
`;

const UserBanner = styled.div`
  height: 120px;
  background-color: #f5f5f5;
  background-size: cover;
  background-position: center;
  position: relative;
  border-radius: 4px 4px 0 0;
  
  @media (min-width: 768px) {
    height: 180px;
  }
`;

const DefaultBannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, rgba(204, 0, 0, 0.07), rgba(0, 0, 0, 0.05));
`;

const UserInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  margin-top: -40px;
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    margin-top: -60px;
  }
`;

const UserAvatarSection = styled.div`
  margin-bottom: 16px;
  
  @media (min-width: 768px) {
    margin-right: 24px;
    margin-bottom: 0;
  }
`;

const UserAvatar = styled(Avatar)`
  width: 80px !important;
  height: 80px !important;
  border: 3px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #e0e0e0;
  
  @media (min-width: 768px) {
    width: 120px !important;
    height: 120px !important;
  }
`;

const UserDetailsSection = styled.div`
  flex: 1;
`;

const UserStats = styled.div`
  margin: 8px 0 12px;
`;

const SubscriptionSection = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  
  @media (min-width: 768px) {
    margin-top: 8px;
  }
`;

const SubscribeButton = styled(Button)`
  text-transform: uppercase;
  font-weight: 500;
  border-radius: 2px;
  padding: 6px 16px;
`;

const NotificationButton = styled(Button)`
  min-width: 0;
  width: 36px;
  height: 36px;
  padding: 6px;
  margin-left: 8px;
  border-radius: 50%;
`;

const TabsSection = styled.div`
  margin-top: 32px;
`;

const StyledTabs = styled(Tabs)`
  .MuiTab-root {
    min-width: 100px;
  }
`;

const StyledTab = styled(Tab)`
  text-transform: uppercase;
  font-weight: 500;
`;

const TabContent = styled.div`
  padding: 24px 0;
`;

const VideosTab = styled.div`
  min-height: 300px;
`;

const NoVideosMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: #f9f9f9;
  border-radius: 4px;
`;

const AboutTab = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const AboutSection = styled.div`
  margin-bottom: 32px;
  
  h6 {
    margin-bottom: 12px;
    position: relative;
    padding-bottom: 8px;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 3px;
      background-color: #cc0000;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const StatItem = styled.div`
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 4px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  text-align: center;
  padding: 0 16px;
`;

export default UserProfilePage; 