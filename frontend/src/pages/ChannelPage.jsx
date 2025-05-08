import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Divider,
  Box,
  CircularProgress,
  Tab,
  Tabs
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import SubscribeButton from '../components/SubscribeButton';
import videoService from '../services/video.service';
import subscriptionService from '../services/subscription.service';
import axios from 'axios';
import VideoCard from '../components/VideoCard';

const YOUTUBE_API_KEY = 'AIzaSyBXoEAacf5by-sCmAodjwWFqOcUv247Ies';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(8)
  },
  banner: {
    width: '100%',
    height: 200,
    backgroundColor: theme.palette.grey[200],
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(4)
  },
  channelInfo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }
  },
  avatar: {
    width: 120,
    height: 120,
    marginRight: theme.spacing(4),
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '3px solid white',
    [theme.breakpoints.down('xs')]: {
      marginRight: 0,
      marginBottom: theme.spacing(2)
    }
  },
  channelText: {
    flex: 1,
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(2)
    }
  },
  channelName: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1)
  },
  subscriberCount: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1)
  },
  description: {
    marginBottom: theme.spacing(2),
    whiteSpace: 'pre-line'
  },
  tabs: {
    marginBottom: theme.spacing(4)
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      width: '100%'
    }
  },
  notificationButton: {
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
      marginTop: theme.spacing(1)
    }
  },
  videoGrid: {
    marginTop: theme.spacing(4)
  },
  videoItem: {
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-5px)'
    }
  },
  statsContainer: {
    display: 'flex',
    gap: theme.spacing(4),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      gap: theme.spacing(1)
    }
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  statLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem'
  }
}));

const ChannelPage = () => {
  const { channelId } = useParams();
  const classes = useStyles();
  const history = useHistory();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching channel data for ID: ${channelId}`);

        // Check subscription status
        const subscriptionStatus = await subscriptionService.getSubscriptionStatus(channelId);
        setSubscribed(subscriptionStatus.data.subscribed);
        
        if (subscriptionStatus.data.subscribed) {
          const notificationStatus = await subscriptionService.hasNotificationsEnabled(channelId);
          setNotificationEnabled(notificationStatus);
        }

        // Fetch channel details from YouTube API
        const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
          params: {
            part: 'snippet,statistics,brandingSettings',
            id: channelId,
            key: YOUTUBE_API_KEY
          }
        });

        if (response.data.items && response.data.items.length > 0) {
          const channelData = response.data.items[0];
          console.log('Channel data:', channelData);
          
          setChannel({
            id: channelId,
            title: channelData.snippet.title,
            description: channelData.snippet.description,
            thumbnail: channelData.snippet.thumbnails.high.url,
            banner: channelData.brandingSettings.image?.bannerExternalUrl || null,
            subscriberCount: parseInt(channelData.statistics.subscriberCount) || 0,
            videoCount: parseInt(channelData.statistics.videoCount) || 0,
            viewCount: parseInt(channelData.statistics.viewCount) || 0,
            publishedAt: new Date(channelData.snippet.publishedAt).toLocaleDateString()
          });

          // Fetch videos from this channel
          const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
              part: 'snippet',
              channelId: channelId,
              maxResults: 12,
              order: 'date',
              type: 'video',
              key: YOUTUBE_API_KEY
            }
          });

          if (videosResponse.data.items && videosResponse.data.items.length > 0) {
            // Get detailed video info with statistics
            const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');
            const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
              params: {
                part: 'snippet,statistics',
                id: videoIds,
                key: YOUTUBE_API_KEY
              }
            });

            const videoList = videoDetailsResponse.data.items.map(video => ({
              id: video.id,
              title: video.snippet.title,
              thumbnail: video.snippet.thumbnails.high.url,
              channelTitle: video.snippet.channelTitle,
              publishedAt: video.snippet.publishedAt,
              viewCount: video.statistics.viewCount || 0
            }));

            setVideos(videoList);
          }
        } else {
          setError('Channel not found');
        }
      } catch (error) {
        console.error('Error fetching channel data:', error);
        setError('Error loading channel data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      fetchChannelData();
    }
  }, [channelId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleSubscription = async () => {
    try {
      if (subscribed) {
        await subscriptionService.unsubscribeFromChannel(channelId);
        setSubscribed(false);
        setNotificationEnabled(false);
      } else {
        await subscriptionService.subscribeToChannel(channelId, channel.title, {
          channelThumbnailUrl: channel.thumbnail,
          subscriberCount: channel.subscriberCount
        });
        setSubscribed(true);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      await subscriptionService.toggleNotification(channelId);
      setNotificationEnabled(!notificationEnabled);
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const navigateToVideo = (videoId) => {
    history.push(`/watch?v=${videoId}`);
  };

  if (loading) {
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={classes.container}>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h5" color="error">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => history.goBack()}
            style={{ marginTop: 16 }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!channel) {
    return (
      <Container className={classes.container}>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h5">
            Channel not found
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => history.goBack()}
            style={{ marginTop: 16 }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <div 
        className={classes.banner} 
        style={{ 
          backgroundImage: channel.banner ? `url(${channel.banner})` : 'linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)'
        }}
      />

      <div className={classes.channelInfo}>
        <Avatar
          src={channel.thumbnail}
          alt={channel.title}
          className={classes.avatar}
        />
        
        <div className={classes.channelText}>
          <Typography variant="h4" className={classes.channelName}>
            {channel.title}
          </Typography>
          
          <Typography variant="subtitle1" className={classes.subscriberCount}>
            {channel.subscriberCount.toLocaleString()} subscribers • {channel.videoCount.toLocaleString()} videos
          </Typography>
          
          <div className={classes.statsContainer}>
            <div className={classes.statItem}>
              <Typography className={classes.statValue}>
                {channel.videoCount.toLocaleString()}
              </Typography>
              <Typography className={classes.statLabel}>Videos</Typography>
            </div>
            
            <div className={classes.statItem}>
              <Typography className={classes.statValue}>
                {channel.viewCount.toLocaleString()}
              </Typography>
              <Typography className={classes.statLabel}>Views</Typography>
            </div>
            
            <div className={classes.statItem}>
              <Typography className={classes.statValue}>
                {channel.publishedAt}
              </Typography>
              <Typography className={classes.statLabel}>Joined</Typography>
            </div>
          </div>
        </div>
        
        <div>
          <div className={classes.actionButtons}>
            <Button
              variant="contained"
              color={subscribed ? "default" : "primary"}
              onClick={handleToggleSubscription}
            >
              {subscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
            </Button>
            
            {subscribed && (
              <Button
                variant="outlined"
                className={classes.notificationButton}
                onClick={handleToggleNotifications}
                startIcon={notificationEnabled ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
              >
                {notificationEnabled ? 'Notifications On' : 'Notifications Off'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <Paper elevation={0}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          className={classes.tabs}
        >
          <Tab label="Videos" />
          <Tab label="About" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Grid container spacing={3} className={classes.videoGrid}>
          {videos.length > 0 ? (
            videos.map((video) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={video.id} className={classes.videoItem}>
                <VideoCard
                  video={video}
                  onClick={() => navigateToVideo(video.id)}
                />
              </Grid>
            ))
          ) : (
            <Box p={3} width="100%" textAlign="center">
              <Typography variant="body1" color="textSecondary">
                No videos found for this channel.
              </Typography>
            </Box>
          )}
        </Grid>
      )}

      {tabValue === 1 && (
        <Paper elevation={1} style={{ padding: 16 }}>
          <Typography variant="h6" gutterBottom>
            About {channel.title}
          </Typography>
          <Divider style={{ marginBottom: 16 }} />
          <Typography variant="body1" className={classes.description}>
            {channel.description || 'No description available.'}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ChannelPage; 