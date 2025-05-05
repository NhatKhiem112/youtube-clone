import React from 'react';
import styled from 'styled-components/macro';
import { Typography, Card, CardMedia, CardContent, IconButton, Badge, Chip } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';

const WatchLaterVideoCard = ({ video, onRemove }) => {
  const history = useHistory();
  const { currentUser } = useAuth();

  const handleClick = () => {
    history.push(`/watch/${video.videoId}`);
  };

  const handleRemove = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onRemove) {
      onRemove(video.videoId);
    }
  };

  return (
    <StyledCard onClick={handleClick}>
      <ThumbnailContainer>
        <CardMedia
          component="img"
          image={video.thumbnailUrl || 'https://via.placeholder.com/480x360'}
          alt={video.title}
        />
        
        <PlayButtonContainer>
          <PlayButton aria-label="Play video">
            <PlayArrowIcon />
          </PlayButton>
        </PlayButtonContainer>
        
        <RemoveButtonContainer>
          <RemoveButton onClick={handleRemove} aria-label="Remove from Watch Later">
            <DeleteIcon />
          </RemoveButton>
        </RemoveButtonContainer>
        
        <WatchLaterIndicator>
          <WatchLaterIcon fontSize="small" />
        </WatchLaterIndicator>
        
        {currentUser && (
          <UserChip
            icon={<AccountCircleIcon />}
            label={currentUser.username || currentUser.email}
            size="small"
          />
        )}
      </ThumbnailContainer>
      <StyledCardContent>
        <VideoTitle variant="subtitle1">
          {video.title}
        </VideoTitle>
        <ChannelName variant="body2">
          {video.channelTitle}
        </ChannelName>
        <Typography variant="caption" color="textSecondary">
          Added on {moment(video.addedAt).format('MMM D, YYYY')}
        </Typography>
      </StyledCardContent>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ThumbnailContainer = styled.div`
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  
  .MuiCardMedia-root {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlayButtonContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;

  ${StyledCard}:hover & {
    opacity: 1;
  }
`;

const PlayButton = styled(IconButton)`
  background-color: rgba(0, 0, 0, 0.7);
  color: #ff0000;
  padding: 12px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }

  .MuiSvgIcon-root {
    font-size: 28px;
  }
`;

const RemoveButtonContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 48px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;

  ${StyledCard}:hover & {
    opacity: 1;
  }
`;

const RemoveButton = styled(IconButton)`
  background-color: rgba(0, 0, 0, 0.7);
  color: #f44336;
  padding: 6px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
  }

  .MuiSvgIcon-root {
    font-size: 18px;
  }
`;

const WatchLaterIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #3f51b5;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const UserChip = styled(Chip)`
  position: absolute;
  bottom: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  z-index: 5;
  
  .MuiChip-icon {
    color: white;
  }
  
  .MuiChip-label {
    padding: 0 8px;
    max-width: 120px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledCardContent = styled(CardContent)`
  flex-grow: 1;
  padding: 12px;
`;

const VideoTitle = styled(Typography)`
  font-weight: 500;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ChannelName = styled(Typography)`
  color: #606060;
  margin-bottom: 4px;
`;

export default WatchLaterVideoCard; 