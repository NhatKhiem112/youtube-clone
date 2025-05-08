import React from 'react';
import styled from 'styled-components/macro';
import { Card, CardMedia, Typography, Box, Avatar } from '@material-ui/core';
import moment from 'moment';
import numeral from 'numeral';
import he from 'he';
import { getFormattedDurationString } from '../../utils/utils';
import PersonIcon from '@material-ui/icons/Person';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

const VideoCard = ({ video, onClick }) => {
  // Handle both YouTube video format and local video format
  const isYouTubeVideo = video.snippet && video.id && !video.videoUrl;
  
  // Extract relevant data based on video type
  const title = isYouTubeVideo 
    ? video.snippet.title 
    : video.title;
  
  const channelTitle = isYouTubeVideo 
    ? video.snippet.channelTitle 
    : video.username;
  
  const viewCount = isYouTubeVideo 
    ? video.statistics?.viewCount 
    : video.viewCount || 0;
    
  const publishedAt = isYouTubeVideo 
    ? video.snippet.publishedAt 
    : video.createdAt || video.updatedAt;
    
  const thumbnailUrl = isYouTubeVideo 
    ? (video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url) 
    : video.thumbnailUrl || 'https://via.placeholder.com/320x180?text=No+Thumbnail';
    
  const duration = isYouTubeVideo 
    ? video.contentDetails?.duration 
    : video.duration || 'PT0M0S';
    
  const videoId = isYouTubeVideo 
    ? video.id 
    : video.id || video._id;

  // Format duration if available
  const formattedDuration = duration ? getFormattedDurationString(duration) : '0:00';
  
  const handleClick = () => {
    if (onClick) {
      onClick(videoId);
    }
  };

  return (
    <StyledCard onClick={handleClick}>
      <ThumbnailContainer>
        <StyledCardMedia
          component="img"
          image={thumbnailUrl}
          alt={title}
        />
        <DurationBadge>
          {formattedDuration}
        </DurationBadge>
        {!isYouTubeVideo && (
          <LocalVideoBadge>
            <span>Local</span>
          </LocalVideoBadge>
        )}
      </ThumbnailContainer>
      
      <CardContent>
        <VideoInfo>
          <ChannelAvatar>
            {isYouTubeVideo ? (
              <Avatar 
                src={`https://i.ytimg.com/vi/${videoId}/default.jpg`} 
                alt={channelTitle}
              />
            ) : (
              <Avatar>
                <PersonIcon />
              </Avatar>
            )}
          </ChannelAvatar>
          
          <TextContent>
            <VideoTitle>
              {he.decode(title)}
            </VideoTitle>
            
            <ChannelName>
              {channelTitle}
            </ChannelName>
            
            <VideoMetadata>
              <span>{numeral(viewCount).format('0,0')} views</span>
              <Dot>•</Dot>
              <span>{moment(publishedAt).fromNow()}</span>
            </VideoMetadata>
          </TextContent>
        </VideoInfo>
      </CardContent>
    </StyledCard>
  );
};

// Styled components
const StyledCard = styled(Card)`
  width: 100%;
  cursor: pointer;
  background-color: transparent;
  box-shadow: none;
  border-radius: 0;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  aspect-ratio: 16 / 9;
  background-color: #000;
`;

const StyledCardMedia = styled(CardMedia)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DurationBadge = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
`;

const LocalVideoBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(204, 0, 0, 0.9);
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
`;

const CardContent = styled.div`
  padding: 0;
`;

const VideoInfo = styled.div`
  display: flex;
  align-items: flex-start;
`;

const ChannelAvatar = styled.div`
  margin-right: 12px;
  
  .MuiAvatar-root {
    width: 36px;
    height: 36px;
  }
`;

const TextContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const VideoTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  margin: 0 0 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #0f0f0f;
`;

const ChannelName = styled.p`
  font-size: 12px;
  color: #606060;
  margin: 0 0 4px 0;
`;

const VideoMetadata = styled.div`
  font-size: 12px;
  color: #606060;
  display: flex;
  align-items: center;
`;

const Dot = styled.span`
  margin: 0 4px;
`;

export default VideoCard; 