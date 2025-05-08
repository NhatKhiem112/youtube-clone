import React, { useState, useEffect, useRef } from 'react';
import { Button, CircularProgress, Menu, MenuItem, ListItemIcon, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import UnsubscribeIcon from '@material-ui/icons/Cancel';
import subscriptionService from '../services/subscription.service';
import AuthService from '../services/auth.service';

const useStyles = makeStyles(() => ({
  button: {
    textTransform: 'none',
    borderRadius: '18px',
    fontWeight: 'bold',
    backgroundColor: '#cc0000',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#aa0000'
    }
  },
  subscribedButton: {
    textTransform: 'none',
    borderRadius: '18px',
    fontWeight: 'bold',
    backgroundColor: '#eeeeee',
    color: '#606060',
    '&:hover': {
      backgroundColor: '#e0e0e0'
    }
  },
  buttonProgress: {
    color: '#cc0000',
    marginLeft: 8
  },
  menuPaper: {
    borderRadius: '8px',
    minWidth: '200px'
  },
  menuItem: {
    padding: '10px 16px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)'
    }
  },
  menuIcon: {
    marginRight: '16px',
    minWidth: '24px',
    color: '#606060'
  },
  divider: {
    margin: '8px 0'
  },
  notificationLevel: {
    marginLeft: '8px',
    fontSize: '12px',
    color: '#909090'
  }
}));

const SubscribeButton = ({ channelId, channelUsername, channelThumbnailUrl, subscriberCount: initialCount, size = 'medium' }) => {
  const classes = useStyles();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(initialCount || 0);
  const [notificationLevel, setNotificationLevel] = useState("ALL"); // ALL, PERSONALIZED, NONE
  const [anchorEl, setAnchorEl] = useState(null);
  const buttonRef = useRef(null);
  
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser && channelId) {
        try {
          const response = await subscriptionService.getSubscriptionStatus(channelId);
          setIsSubscribed(response.data.subscribed);
          setSubscriberCount(response.data.subscriberCount);
          
          // Set notification level if available in response
          if (response.data.notificationEnabled !== undefined) {
            if (response.data.notificationEnabled === true) {
              setNotificationLevel("ALL");
            } else {
              setNotificationLevel("NONE");
            }
          }
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      }
    };

    checkSubscriptionStatus();
  }, [channelId]);
  
  const handleButtonClick = (event) => {
    if (isSubscribed) {
      setAnchorEl(event.currentTarget);
    } else {
      handleSubscribe();
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleSubscribe = async () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      // Redirect to login page if not logged in
      window.location.href = '/login';
      return;
    }
    
    setLoading(true);
    try {
      if (isSubscribed) {
        // This function is now only for initial subscription
        // Unsubscribe is handled through the menu
        return;
      } else {
        // Subscribe with complete channel data
        const channelData = {
          channelName: channelUsername,
          channelThumbnailUrl: channelThumbnailUrl || 'https://yt3.ggpht.com/channel/image.jpg',
          subscriberCount: subscriberCount
        };
        
        await subscriptionService.subscribeToChannel(channelId, channelUsername, channelData);
        setIsSubscribed(true);
        setNotificationLevel("ALL"); // Default to all notifications
      }
      // Refresh subscription status to get updated count
      const response = await subscriptionService.getSubscriptionStatus(channelId);
      setSubscriberCount(response.data.subscriberCount);
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert(`Subscription action failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (level) => {
    setLoading(true);
    try {
      // Toggle notification setting in backend
      await subscriptionService.toggleNotification(channelId);
      setNotificationLevel(level);
      handleCloseMenu();
    } catch (error) {
      console.error('Error updating notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      await subscriptionService.unsubscribeFromChannel(channelId);
      setIsSubscribed(false);
      handleCloseMenu();
      // Update subscriber count
      const response = await subscriptionService.getSubscriptionStatus(channelId);
      setSubscriberCount(response.data.subscriberCount);
    } catch (error) {
      console.error('Error unsubscribing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (!isSubscribed) return 'Subscribe';
    
    if (notificationLevel === "ALL") {
      return (
        <>
          Đã đăng ký
          <NotificationsActiveIcon style={{ fontSize: 16, marginLeft: 6, verticalAlign: 'middle' }} />
        </>
      );
    } else if (notificationLevel === "PERSONALIZED") {
      return (
        <>
          Đã đăng ký
          <NotificationsIcon style={{ fontSize: 16, marginLeft: 6, verticalAlign: 'middle' }} />
        </>
      );
    } else {
      return 'Đã đăng ký';
    }
  };
  
  return (
    <>
      <Button
        ref={buttonRef}
        variant="contained"
        size={size}
        onClick={handleButtonClick}
        disabled={loading}
        className={isSubscribed ? classes.subscribedButton : classes.button}
        style={{ position: 'relative' }}
      >
        {getButtonLabel()}
        {loading && <CircularProgress size={16} className={classes.buttonProgress} />}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          className: classes.menuPaper
        }}
      >
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNotificationChange("ALL")}
          selected={notificationLevel === "ALL"}
        >
          <ListItemIcon className={classes.menuIcon}>
            <NotificationsActiveIcon />
          </ListItemIcon>
          <Typography>
            Tất cả
          </Typography>
        </MenuItem>
        
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNotificationChange("PERSONALIZED")}
          selected={notificationLevel === "PERSONALIZED"}
        >
          <ListItemIcon className={classes.menuIcon}>
            <NotificationsIcon />
          </ListItemIcon>
          <Typography>
            Dành riêng cho bạn
          </Typography>
        </MenuItem>
        
        <MenuItem
          className={classes.menuItem}
          onClick={() => handleNotificationChange("NONE")}
          selected={notificationLevel === "NONE"}
        >
          <ListItemIcon className={classes.menuIcon}>
            <NotificationsOffIcon />
          </ListItemIcon>
          <Typography>
            Không nhận thông báo
          </Typography>
        </MenuItem>
        
        <Divider className={classes.divider} />
        
        <MenuItem className={classes.menuItem} onClick={handleUnsubscribe}>
          <ListItemIcon className={classes.menuIcon}>
            <UnsubscribeIcon />
          </ListItemIcon>
          <Typography>
            Hủy đăng ký
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default SubscribeButton; 