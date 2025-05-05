import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CloseIcon from '@material-ui/icons/Close';
import HistoryIcon from '@material-ui/icons/History';
import Tooltip from '@material-ui/core/Tooltip';
import Moment from 'react-moment';

// Thẻ video
const VideoCard = styled(Card)`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

// Wrapper cho media
const MediaWrapper = styled.div`
  position: relative;
  padding-top: 56.25%; /* Tỉ lệ 16:9 */
  overflow: hidden;
  cursor: pointer;
`;

// Hình ảnh thumbnail
const Thumbnail = styled(CardMedia)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  transition: transform 0.3s ease;
  
  ${VideoCard}:hover & {
    transform: scale(1.05);
  }
`;

// Thời gian xem
const WatchTime = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Số lần xem
const WatchCount = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Nội dung thẻ
const Content = styled(CardContent)`
  flex: 1;
  padding: 12px;
`;

// Tiêu đề video
const Title = styled(Typography)`
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`;

// Tên kênh
const ChannelName = styled(Typography)`
  color: #606060;
  font-size: 14px;
`;

// Nút xoá video
const RemoveButton = styled(IconButton)`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px;
  
  &:hover {
    background-color: rgba(211, 47, 47, 0.8);
  }
  
  & svg {
    font-size: 16px;
  }
`;

// Menu Options
const MenuButton = styled(IconButton)`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  & svg {
    font-size: 16px;
  }
`;

const formatWatchCount = (count) => {
  if (count === 1) return "Đã xem 1 lần";
  return `Đã xem ${count} lần`;
};

const WatchHistoryVideoCard = ({ video, onRemove }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showRemoveButton, setShowRemoveButton] = useState(false);
  
  const handleMenuClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setAnchorEl(null);
  };
  
  const handleRemove = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onRemove(video.videoId);
    handleMenuClose();
  };
  
  const videoUrl = `/video/${video.videoId}`;
  
  return (
    <VideoCard 
      onMouseEnter={() => setShowRemoveButton(true)}
      onMouseLeave={() => setShowRemoveButton(false)}
    >
      <MediaWrapper>
        <Link to={videoUrl}>
          <Thumbnail image={video.thumbnailUrl} title={video.title} />
          
          <WatchTime>
            <HistoryIcon style={{ fontSize: 14 }} />
            <Moment fromNow>{video.lastWatchedAt}</Moment>
          </WatchTime>
          
          <WatchCount>
            {formatWatchCount(video.watchCount)}
          </WatchCount>
          
          {showRemoveButton ? (
            <Tooltip title="Tuỳ chọn">
              <MenuButton 
                aria-label="more" 
                onClick={handleMenuClick}
              >
                <MoreVertIcon />
              </MenuButton>
            </Tooltip>
          ) : null}
          
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleRemove}>
              <CloseIcon fontSize="small" style={{ marginRight: 8 }} />
              Xoá khỏi lịch sử
            </MenuItem>
          </Menu>
        </Link>
      </MediaWrapper>
      
      <Content>
        <Link to={videoUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Title variant="subtitle1" component="h2">
            {video.title}
          </Title>
          <ChannelName variant="body2" color="textSecondary">
            {video.channelTitle}
          </ChannelName>
        </Link>
      </Content>
    </VideoCard>
  );
};

export default WatchHistoryVideoCard; 