import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import { Avatar, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 24px',
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)'
    }
  },
  avatar: {
    width: 24,
    height: 24,
    marginRight: 16
  },
  text: {
    fontSize: 14,
    fontWeight: 400,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
}));

const SubscriptionItem = ({ channel }) => {
  const classes = useStyles();
  
  return (
    <Link
      to={`/channel/${channel.id}`}
      className={classes.root}
    >
      <Avatar 
        src={channel.profileImageUrl} 
        alt={channel.username}
        className={classes.avatar}
      />
      <Typography className={classes.text}>
        {channel.username}
      </Typography>
    </Link>
  );
};

export default SubscriptionItem; 