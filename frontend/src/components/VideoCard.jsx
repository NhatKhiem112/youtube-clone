import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box } from '@material-ui/core';
import moment from 'moment';
import numeral from 'numeral';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '100%',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    }
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9 aspect ratio
    position: 'relative'
  },
  content: {
    padding: theme.spacing(1.5)
  },
  title: {
    fontWeight: 500,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    height: '2.5em',
    lineHeight: '1.25em'
  },
  channelTitle: {
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
    marginTop: theme.spacing(0.5)
  },
  videoInfo: {
    display: 'flex',
    color: theme.palette.text.secondary,
    fontSize: '0.8rem',
    marginTop: theme.spacing(0.5),
    alignItems: 'center'
  },
  dot: {
    display: 'inline-block',
    margin: '0 4px',
    fontSize: '0.8rem'
  },
  duration: {
    position: 'absolute',
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: theme.spacing(0.25, 0.5),
    borderRadius: 2,
    fontSize: '0.75rem',
    fontWeight: 500
  }
}));

const VideoCard = ({ video, onClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root} onClick={onClick}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image={video.thumbnail}
          title={video.title}
        >
          {video.duration && (
            <Box className={classes.duration}>
              {video.duration}
            </Box>
          )}
        </CardMedia>
        <CardContent className={classes.content}>
          <Typography variant="subtitle1" className={classes.title}>
            {video.title}
          </Typography>
          
          <Typography variant="body2" className={classes.channelTitle}>
            {video.channelTitle}
          </Typography>
          
          <div className={classes.videoInfo}>
            <span>{numeral(video.viewCount).format('0.a')} views</span>
            <span className={classes.dot}>•</span>
            <span>{moment(video.publishedAt).fromNow()}</span>
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default VideoCard; 