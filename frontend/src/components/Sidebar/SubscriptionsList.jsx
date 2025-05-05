import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress, Box, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SubscriptionItem from './SubscriptionItem';
import subscriptionService from '../../services/subscription.service';
import AuthService from '../../services/auth.service';

const useStyles = makeStyles(() => ({
  root: {
    marginTop: 16,
    marginBottom: 16
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    textTransform: 'uppercase',
    padding: '8px 24px',
    color: '#606060'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0'
  },
  empty: {
    padding: '8px 24px',
    color: '#606060',
    fontSize: 13
  },
  divider: {
    margin: '12px 0'
  }
}));

const SubscriptionsList = () => {
  const classes = useStyles();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setIsLoggedIn(true);
      loadSubscriptions();
    } else {
      setLoading(false);
    }
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getMySubscriptions();
      setSubscriptions(response.data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Divider className={classes.divider} />
      
      <Typography className={classes.title}>
        Subscriptions
      </Typography>
      
      {loading ? (
        <div className={classes.loading}>
          <CircularProgress size={24} />
        </div>
      ) : subscriptions.length > 0 ? (
        subscriptions.map((channel) => (
          <SubscriptionItem key={channel.id} channel={channel} />
        ))
      ) : (
        <Box className={classes.empty}>
          <Typography variant="body2">
            No channels yet
          </Typography>
        </Box>
      )}
      
      <Divider className={classes.divider} />
    </div>
  );
};

export default SubscriptionsList; 