import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  CircularProgress,
  Box,
  Grid,
  Paper,
  Avatar,
  Button,
  Divider
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import AuthService from '../services/auth.service';
import subscriptionService from '../services/subscription.service';
import { makeStyles } from '@material-ui/core/styles';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import SubscriptionsIcon from '@material-ui/icons/Subscriptions';
import YouTubeIcon from '@material-ui/icons/YouTube';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2)
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    background: 'linear-gradient(to right, rgba(204, 0, 0, 0.05), transparent)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: '4px',
      backgroundColor: '#cc0000'
    }
  },
  headerIcon: {
    color: '#cc0000',
    marginRight: theme.spacing(2),
    fontSize: 28
  },
  loadingContainer: {
    marginTop: theme.spacing(8),
    textAlign: 'center'
  },
  channelCard: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    borderRadius: theme.spacing(2),
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '3px',
      background: 'linear-gradient(to right, #cc0000, #ff5722)',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.3s ease',
    },
    '&:hover::after': {
      transform: 'scaleX(1)'
    }
  },
  avatar: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    border: '3px solid transparent',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing(2),
    '&::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '110%',
      height: '110%',
      transform: 'translate(-50%, -50%) scale(0)',
      borderRadius: '50%',
      border: '1px solid rgba(204, 0, 0, 0.3)',
      transition: 'transform 0.3s ease',
    },
    '&:hover::after': {
      transform: 'translate(-50%, -50%) scale(1)'
    }
  },
  channelName: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    textAlign: 'center',
    position: 'relative',
    padding: theme.spacing(0.5, 0),
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '0%',
      height: '2px',
      background: 'linear-gradient(to right, #cc0000, #ff5722)',
      transition: 'width 0.3s ease',
    },
    '$channelCard:hover &::after': {
      width: '50%'
    }
  },
  subscriberCount: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center'
  },
  youtubeIcon: {
    fontSize: 14,
    marginRight: 4,
    color: '#cc0000'
  },
  notificationIcon: {
    marginRight: theme.spacing(1)
  },
  notificationButton: {
    marginTop: theme.spacing(2),
    borderRadius: 20,
    textTransform: 'none',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)'
    }
  },
  notificationActiveBtn: {
    backgroundColor: 'rgba(204, 0, 0, 0.1)',
    color: '#cc0000',
    '&:hover': {
      backgroundColor: 'rgba(204, 0, 0, 0.2)'
    }
  },
  notificationInactiveBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
    background: 'linear-gradient(to bottom, rgba(250, 250, 250, 1), rgba(245, 245, 245, 0.8))',
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
  },
  emptyIcon: {
    fontSize: 60,
    color: '#cc0000',
    marginBottom: theme.spacing(2),
    opacity: 0.6
  },
  loginButton: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1, 4),
    borderRadius: 20,
    backgroundColor: '#cc0000',
    color: 'white',
    textTransform: 'none',
    fontWeight: 500,
    boxShadow: '0 4px 8px rgba(204, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#aa0000',
      boxShadow: '0 6px 12px rgba(204, 0, 0, 0.4)',
      transform: 'translateY(-2px)'
    }
  },
  divider: {
    margin: theme.spacing(3, 0),
    width: '100%'
  }
}));

// Lấy API key từ biến môi trường hoặc sử dụng giá trị cứng
const YOUTUBE_API_KEY = 'AIzaSyBXoEAacf5by-sCmAodjwWFqOcUv247Ies';
// process.env.REACT_APP_YOUTUBE_API_KEY || 

const SubscriptionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    
    setIsLoggedIn(true);
    loadSubscriptions();
  }, []);

  // Phương thức lấy thông tin kênh từ YouTube API
  const fetchChannelDetails = async (channelId) => {
    try {
      console.log(`Fetching details for channel: ${channelId}`);
      
      if (!YOUTUBE_API_KEY) {
        console.error('Missing YouTube API key');
        return null;
      }
      
      const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'snippet,statistics',
          id: channelId,
          key: YOUTUBE_API_KEY
        }
      });
      
      if (response.data.items && response.data.items.length > 0) {
        const channelData = response.data.items[0];
        console.log('Channel data from YouTube API:', channelData);
        
        return {
          id: channelId,
          username: channelData.snippet.title,
          profileImageUrl: channelData.snippet.thumbnails.default.url,
          subscriberCount: parseInt(channelData.statistics.subscriberCount || '0'),
          notificationEnabled: true, // Giữ nguyên giá trị hiện tại
        };
      }
      
      console.log(`No data found for channel: ${channelId}`);
      return null;
    } catch (error) {
      console.error(`Error fetching channel details for ${channelId}:`, error);
      return null;
    }
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      console.log('Fetching subscriptions...');
      const response = await subscriptionService.getMySubscriptions();
      console.log('Subscriptions response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Subscription data details:', response.data.map(sub => ({
          id: sub.id,
          username: sub.username,
          hasImage: !!sub.profileImageUrl,
          hasCount: !!sub.subscriberCount
        })));
        
        // Xác định các kênh cần lấy thêm thông tin từ YouTube API
        const channelsNeedingDetails = response.data.filter(
          sub => !sub.profileImageUrl || !sub.subscriberCount || sub.subscriberCount === 0
        );
        
        console.log(`${channelsNeedingDetails.length} channels need additional details`);
        
        // Tạo bản sao của danh sách đăng ký để cập nhật
        let enhancedSubscriptions = [...response.data];
        
        // Lấy thông tin bổ sung cho các kênh cần thiết
        if (channelsNeedingDetails.length > 0) {
          for (const channel of channelsNeedingDetails) {
            const youtubeData = await fetchChannelDetails(channel.id);
            
            if (youtubeData) {
              // Cập nhật thông tin kênh trong danh sách
              enhancedSubscriptions = enhancedSubscriptions.map(sub => {
                if (sub.id === youtubeData.id) {
                  return {
                    ...sub,
                    username: youtubeData.username || sub.username || 'YouTube Channel',
                    profileImageUrl: youtubeData.profileImageUrl || sub.profileImageUrl,
                    subscriberCount: youtubeData.subscriberCount || sub.subscriberCount || 0
                  };
                }
                return sub;
              });
            }
          }
        }
        
        // Đảm bảo tất cả các kênh đều có đủ thông tin
        enhancedSubscriptions = enhancedSubscriptions.map(sub => ({
          ...sub,
          username: sub.username || sub.channelName || 'YouTube Channel',
          profileImageUrl: sub.profileImageUrl || sub.channelThumbnailUrl || 'https://yt3.ggpht.com/ytc/AMLnZu-fB-c8OJZ5X0t9wGT-RQOQ8v2TdApKJnYFUA=s176-c-k-c0x00ffffff-no-rj',
          subscriberCount: typeof sub.subscriberCount === 'number' ? sub.subscriberCount : 0
        }));
        
        console.log('Enhanced subscriptions:', enhancedSubscriptions);
        setSubscriptions(enhancedSubscriptions);
      } else {
        console.error('Invalid subscription data format:', response);
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (channelId) => {
    try {
      await subscriptionService.toggleNotification(channelId);
      // Reload subscriptions to get updated data
      loadSubscriptions();
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const navigateToChannel = (channelId) => {
    history.push(`/channel/${channelId}`);
  };

  const handleLogin = () => {
    history.push('/login');
  };

  if (loading) {
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress style={{ color: '#cc0000' }} />
      </Container>
    );
  }

  if (!isLoggedIn) {
    return (
      <Container maxWidth="md" className={classes.container}>
        <Box className={classes.emptyState}>
          <SubscriptionsIcon className={classes.emptyIcon} />
          <Typography variant="h5" gutterBottom>
            Sign in to see your subscriptions
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Keep track of your favorite channels in one place
          </Typography>
          <Button 
            variant="contained" 
            className={classes.loginButton}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Container maxWidth="md" className={classes.container}>
        <Box className={classes.emptyState}>
          <SubscriptionsIcon className={classes.emptyIcon} />
          <Typography variant="h5" gutterBottom>
            No subscriptions yet
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Channels you subscribe to will appear here
          </Typography>
          <Divider className={classes.divider} />
          <Typography variant="body2" color="textSecondary">
            Find channels to subscribe to by exploring videos
          </Typography>
          <Button 
            variant="contained" 
            className={classes.loginButton}
            onClick={() => history.push('/')}
          >
            Explore Videos
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Box className={classes.header}>
        <SubscriptionsIcon className={classes.headerIcon} />
        <Typography variant="h4" component="h1">
          Subscriptions
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {subscriptions.map((channel) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={channel.id}>
            <Paper className={classes.channelCard} onClick={() => navigateToChannel(channel.id)}>
              <div className={classes.avatarContainer}>
                <Avatar 
                  className={classes.avatar} 
                  src={channel.profileImageUrl}
                  alt={channel.username}
                >
                  {!channel.profileImageUrl && channel.username.charAt(0).toUpperCase()}
                </Avatar>
              </div>
              
              <Typography variant="h6" className={classes.channelName}>
                {channel.username}
              </Typography>
              
              <Typography variant="body2" className={classes.subscriberCount}>
                <YouTubeIcon className={classes.youtubeIcon} />
                {channel.subscriberCount.toLocaleString()} subscribers
              </Typography>
              
              <Button
                size="small"
                variant="outlined"
                className={`${classes.notificationButton} ${channel.notificationEnabled ? classes.notificationActiveBtn : classes.notificationInactiveBtn}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleNotifications(channel.id);
                }}
                startIcon={
                  channel.notificationEnabled ? 
                    <NotificationsActiveIcon className={classes.notificationIcon} /> : 
                    <NotificationsOffIcon className={classes.notificationIcon} />
                }
              >
                {channel.notificationEnabled ? 'Notifications on' : 'Notifications off'}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SubscriptionsPage; 