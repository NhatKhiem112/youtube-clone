import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components/macro';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Box,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  useTheme,
  Paper,
  Tooltip
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import MovieIcon from '@material-ui/icons/Movie';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import LinkIcon from '@material-ui/icons/Link';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import BlockIcon from '@material-ui/icons/Block';
import InfoIcon from '@material-ui/icons/Info';
import axios from 'axios';
import authHeader from '../services/auth-header';
import VideoService from '../services/video.service';
import {
  FULL_SIDEBAR_WIDTH,
  MINI_SIDEBAR_WIDTH,
  SHOW_FULL_SIDEBAR_BREAKPOINT,
  SHOW_MINI_SIDEBAR_BREAKPOINT,
  useMinWidthToShowFullSidebar,
  useShouldShowMiniSidebar
} from '../utils/utils';

// Styled components for enhanced design
const StyledContainer = styled.div`
  padding: 24px;
  margin-top: 64px;
  max-width: 1200px;
  margin-right: auto;
  
  /* Đảm bảo không đè lên sidebar */
  @media (max-width: ${SHOW_MINI_SIDEBAR_BREAKPOINT - 1}px) {
    /* Khi không có sidebar */
    margin-left: auto;
  }
  
  @media (min-width: ${SHOW_MINI_SIDEBAR_BREAKPOINT}px) and (max-width: ${SHOW_FULL_SIDEBAR_BREAKPOINT - 1}px) {
    /* Khi có mini sidebar */
    margin-left: ${MINI_SIDEBAR_WIDTH}px;
  }
  
  @media (min-width: ${SHOW_FULL_SIDEBAR_BREAKPOINT}px) {
    /* Khi có full sidebar */
    margin-left: ${props => props.showFullSidebar ? FULL_SIDEBAR_WIDTH : MINI_SIDEBAR_WIDTH}px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
`;

const StyledIcon = styled(MovieIcon)`
  && {
    font-size: 2rem;
    margin-right: 16px;
    color: #cc0000;
  }
`;

const PageHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 16px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const CardMediaWrapper = styled(Box)`
  position: relative;
  overflow: hidden;
  padding-top: 56.25%; /* Tỉ lệ 16:9 */
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%);
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover:before {
    opacity: 1;
  }
`;

const StyledCardMedia = styled(CardMedia)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const VideoTitle = styled(Typography)`
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 48px;
`;

const StyledCardContent = styled(CardContent)`
  flex-grow: 1;
  padding: 16px;
`;

const StyledCardActions = styled(CardActions)`
  display: flex;
  justify-content: space-between;
  padding: 8px 16px 16px;
  
  .MuiIconButton-root {
    margin-right: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const StatusChip = styled(Chip)`
  font-size: 12px;
  height: 24px;
  padding: 0 8px;
  margin-top: 8px;
`;

const StyledButton = styled(Button)`
  background-color: #cc0000;
  color: white;
  font-weight: 500;
  padding: 8px 24px;
  transition: all 0.3s ease;
  text-transform: none;
  
  &:hover {
    background-color: #990000;
    box-shadow: 0 2px 10px rgba(204, 0, 0, 0.3);
  }
`;

const EmptyStateContainer = styled(Box)`
  text-align: center;
  padding: 60px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
`;

const VideoMetaData = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  color: #606060;
`;

const VideoStats = styled(Box)`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 24px;
`;

const MyVideos = () => {
  const history = useHistory();
  const theme = useTheme();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDelete, setOpenDelete] = useState(false);
  const [openVisibility, setOpenVisibility] = useState(false);
  const [openStatusInfo, setOpenStatusInfo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVisibility, setSelectedVisibility] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const showFullSidebar = useMinWidthToShowFullSidebar();
  const showMiniSidebar = useShouldShowMiniSidebar();

  useEffect(() => {
    fetchMyVideos();
  }, []);

  const fetchMyVideos = async () => {
    try {
      setLoading(true);
      const videos = await VideoService.getUserVideos();
      
      // Fetch moderation status for videos with specific statuses
      const videosWithModerationInfo = await Promise.all(
        videos.map(async (video) => {
          // Log each video's thumbnail URL for debugging
          console.log(`Video ${video.id} thumbnail URL: ${video.thumbnailUrl}`);
          
          if (video.status === 'PENDING_REVIEW' || video.status === 'APPROVED' || video.status === 'REJECTED') {
            try {
              const moderationInfo = await VideoService.getModerationStatus(video.id);
              return { 
                ...video, 
                rejectionReason: moderationInfo.comment,
                reviewedBy: moderationInfo.reviewedBy,
                reviewedAt: moderationInfo.updatedAt
              };
            } catch (error) {
              console.error(`Failed to get moderation info for video ${video.id}`, error);
              return video;
            }
          }
          return video;
        })
      );
      
      setVideos(videosWithModerationInfo);
      setError('');
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (video) => {
    setSelectedVideo(video);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await VideoService.deleteVideo(selectedVideo.id);
      
      setVideos(videos.filter(video => video.id !== selectedVideo.id));
      setNotification({
        open: true,
        message: 'Video deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Delete error:', error);
      setNotification({
        open: true,
        message: 'Failed to delete video',
        severity: 'error'
      });
    } finally {
      setOpenDelete(false);
    }
  };

  const handleVisibilityClick = (video) => {
    setSelectedVideo(video);
    setSelectedVisibility(video.status);
    setOpenVisibility(true);
  };

  const handleStatusInfoClick = (video) => {
    setSelectedVideo(video);
    setOpenStatusInfo(true);
  };

  const handleVisibilityChange = async () => {
    try {
      // If video was rejected and now being resubmitted for review
      if (selectedVideo.status === 'REJECTED' && selectedVisibility === 'PENDING_REVIEW') {
        await VideoService.resubmitForReview(selectedVideo.id);
        
        setNotification({
          open: true,
          message: 'Video resubmitted for review successfully',
          severity: 'success'
        });
      } else {
        // Regular visibility update
        await VideoService.updateVideo(
          selectedVideo.id,
          { title: selectedVideo.title, description: selectedVideo.description, status: selectedVisibility }
        );
        
        setNotification({
          open: true,
          message: 'Video visibility updated successfully',
          severity: 'success'
        });
      }
      
      // Update the video in the list
      setVideos(videos.map(video => 
        video.id === selectedVideo.id ? {...video, status: selectedVisibility} : video
      ));
      
    } catch (error) {
      console.error('Update error:', error);
      setNotification({
        open: true,
        message: 'Failed to update video visibility',
        severity: 'error'
      });
    } finally {
      setOpenVisibility(false);
    }
  };

  const handleEditClick = (video) => {
    history.push(`/edit-video/${video.id}`);
  };

  const handleWatchClick = (video) => {
    history.push(`/watch/${video.id}`);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PUBLIC':
        return 'Public';
      case 'PRIVATE':
        return 'Private';
      case 'UNLISTED':
        return 'Unlisted';
      case 'PROCESSING':
        return 'Processing';
      case 'PENDING_REVIEW':
        return 'Pending Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PUBLIC':
        return <VisibilityIcon fontSize="small" />;
      case 'PRIVATE':
        return <VisibilityOffIcon fontSize="small" />;
      case 'UNLISTED':
        return <LinkIcon fontSize="small" />;
      case 'PROCESSING':
        return <CircularProgress size={12} />;
      case 'PENDING_REVIEW':
        return <HourglassEmptyIcon fontSize="small" />;
      case 'APPROVED':
        return <CheckCircleIcon fontSize="small" />;
      case 'REJECTED':
        return <BlockIcon fontSize="small" />;
      default:
        return <VisibilityIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLIC':
        return { background: '#e6f4ea', color: '#0d652d' };
      case 'PRIVATE':
        return { background: '#fce8e6', color: '#c5221f' };
      case 'UNLISTED':
        return { background: '#e8eaed', color: '#3c4043' };
      case 'PROCESSING':
        return { background: '#fff7e6', color: '#b06000' };
      case 'PENDING_REVIEW':
        return { background: '#fff8e1', color: '#f57c00' };
      case 'APPROVED':
        return { background: '#e8f5e9', color: '#2e7d32' };
      case 'REJECTED':
        return { background: '#ffebee', color: '#c62828' };
      default:
        return { background: '#e8eaed', color: '#3c4043' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <StyledContainer showFullSidebar={showFullSidebar} showMiniSidebar={showMiniSidebar}>
        <LoadingContainer>
          <CircularProgress size={60} style={{ color: '#cc0000' }} />
        </LoadingContainer>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer showFullSidebar={showFullSidebar} showMiniSidebar={showMiniSidebar}>
        <ErrorContainer>
          <Paper elevation={3} style={{ padding: 24 }}>
            <Alert severity="error" style={{ marginBottom: 16 }}>{error}</Alert>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => fetchMyVideos()}
              style={{ marginTop: 16 }}
            >
              Try Again
            </Button>
          </Paper>
        </ErrorContainer>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer showFullSidebar={showFullSidebar} showMiniSidebar={showMiniSidebar}>
      <HeaderContainer>
        <StyledIcon />
        <Typography variant="h4" component="h1">
          My Videos
        </Typography>
      </HeaderContainer>
      
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <StyledButton 
          variant="contained" 
          onClick={() => history.push('/upload')}
          startIcon={<MovieIcon />}
          size="large"
          style={{ fontSize: '15px', padding: '10px 24px' }}
        >
          Upload New Video
        </StyledButton>
      </Box>

      {videos.length === 0 ? (
        <EmptyStateContainer mt={5}>
          <MovieIcon style={{ fontSize: 60, color: '#cc0000', marginBottom: 24 }} />
          <Typography variant="h5" gutterBottom style={{ fontWeight: 500 }}>
            You haven't uploaded any videos yet
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph style={{ maxWidth: 500, margin: '0 auto 24px' }}>
            Your creative journey starts here. Upload your first video to share with the world.
          </Typography>
          <StyledButton 
            variant="contained" 
            onClick={() => history.push('/upload')}
            startIcon={<MovieIcon />}
          >
            Upload Your First Video
          </StyledButton>
        </EmptyStateContainer>
      ) : (
        <Grid container spacing={3} style={{ margin: 0, width: '100%' }}>
          {videos.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id} style={{ paddingTop: 12, paddingBottom: 12 }}>
              <StyledCard>
                <CardMediaWrapper>
                  <StyledCardMedia
                    component="img"
                    alt={video.title}
                    image={video.thumbnailUrl ? `http://localhost:8080${video.thumbnailUrl}` : 'https://via.placeholder.com/320x180?text=No+Thumbnail'}
                    title={video.title}
                    onClick={() => handleWatchClick(video)}
                  />
                  <Box 
                    position="absolute"
                    bottom="8px"
                    right="8px"
                    zIndex="2"
                    display="flex"
                    alignItems="center"
                    bgcolor="rgba(0,0,0,0.7)"
                    color="white"
                    px={1}
                    py={0.5}
                    borderRadius={1}
                    fontSize="12px"
                  >
                    <PlayArrowIcon fontSize="small" style={{ marginRight: 4 }} />
                    {video.viewCount} views
                  </Box>
                  
                  {video.status === 'REJECTED' && (
                    <Box 
                      position="absolute"
                      top="8px"
                      left="8px"
                      zIndex="2"
                      bgcolor="rgba(198, 40, 40, 0.9)"
                      color="white"
                      px={1}
                      py={0.5}
                      borderRadius={1}
                      fontSize="12px"
                      display="flex"
                      alignItems="center"
                    >
                      <BlockIcon fontSize="small" style={{ marginRight: 4 }} />
                      Rejected
                    </Box>
                  )}
                  
                  {video.status === 'PENDING_REVIEW' && (
                    <Box 
                      position="absolute"
                      top="8px"
                      left="8px"
                      zIndex="2"
                      bgcolor="rgba(245, 124, 0, 0.9)"
                      color="white"
                      px={1}
                      py={0.5}
                      borderRadius={1}
                      fontSize="12px"
                      display="flex"
                      alignItems="center"
                    >
                      <HourglassEmptyIcon fontSize="small" style={{ marginRight: 4 }} />
                      In Review
                    </Box>
                  )}
                </CardMediaWrapper>
                
                <StyledCardContent>
                  <VideoTitle variant="subtitle1" component="h2">
                    {video.title}
                  </VideoTitle>
                  
                  <Typography variant="body2" color="textSecondary" component="p" 
                    style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '40px',
                      marginBottom: '8px'
                    }}
                  >
                    {video.description || 'No description'}
                  </Typography>
                  
                  <VideoMetaData>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(video.createdAt)}
                    </Typography>
                  </VideoMetaData>
                  
                  <VideoStats>
                    <StatusChip 
                      size="small"
                      label={getStatusLabel(video.status)}
                      icon={getStatusIcon(video.status)}
                      style={{ 
                        backgroundColor: getStatusColor(video.status).background,
                        color: getStatusColor(video.status).color
                      }}
                    />
                  </VideoStats>
                </StyledCardContent>
                
                <Divider light />
                
                <StyledCardActions>
                  <Box>
                    <IconButton size="small" color="primary" onClick={() => handleWatchClick(video)} title="Watch">
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => handleEditClick(video)} title="Edit">
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box>
                    {(video.status === 'PENDING_REVIEW' || video.status === 'APPROVED' || video.status === 'REJECTED') && (
                      <Tooltip title="View status details">
                        <IconButton 
                          size="small" 
                          style={{ color: getStatusColor(video.status).color }} 
                          onClick={() => handleStatusInfoClick(video)}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton size="small" style={{ color: theme.palette.info.main }} onClick={() => handleVisibilityClick(video)} title="Change visibility">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={() => handleDeleteClick(video)} title="Delete">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </StyledCardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        PaperProps={{
          style: {
            borderRadius: 8,
            padding: 8
          }
        }}
      >
        <DialogTitle style={{ paddingBottom: 8 }}>Delete Video</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "<strong>{selectedVideo?.title}</strong>"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button onClick={() => setOpenDelete(false)} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            style={{ 
              backgroundColor: theme.palette.error.main,
              color: 'white'
            }}
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Visibility Dialog */}
      <Dialog
        open={openVisibility}
        onClose={() => setOpenVisibility(false)}
        PaperProps={{
          style: {
            borderRadius: 8,
            padding: 8,
            width: '400px'
          }
        }}
      >
        <DialogTitle style={{ paddingBottom: 8 }}>Change Video Visibility</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ marginBottom: 16 }}>
            Change visibility for "<strong>{selectedVideo?.title}</strong>"
          </DialogContentText>
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="visibility-label">Visibility</InputLabel>
            <Select
              labelId="visibility-label"
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              label="Visibility"
            >
              <MenuItem value="PUBLIC">
                <Box display="flex" alignItems="center">
                  <VisibilityIcon fontSize="small" style={{ marginRight: 8, color: '#0d652d' }} />
                  Public
                </Box>
              </MenuItem>
              <MenuItem value="PRIVATE">
                <Box display="flex" alignItems="center">
                  <VisibilityOffIcon fontSize="small" style={{ marginRight: 8, color: '#c5221f' }} />
                  Private
                </Box>
              </MenuItem>
              <MenuItem value="UNLISTED">
                <Box display="flex" alignItems="center">
                  <LinkIcon fontSize="small" style={{ marginRight: 8, color: '#3c4043' }} />
                  Unlisted
                </Box>
              </MenuItem>
              <MenuItem value="PENDING_REVIEW">
                <Box display="flex" alignItems="center">
                  <HourglassEmptyIcon fontSize="small" style={{ marginRight: 8, color: '#f57c00' }} />
                  Submit for Review
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {selectedVisibility === 'PENDING_REVIEW' && (
            <Paper variant="outlined" style={{ padding: 16, marginTop: 16, backgroundColor: '#fff8e1' }}>
              <Typography variant="body2" style={{ color: '#f57c00' }}>
                Your video will be reviewed by moderators before being published. This process may take some time.
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          <Button onClick={() => setOpenVisibility(false)} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleVisibilityChange} 
            style={{ 
              backgroundColor: '#cc0000',
              color: 'white'
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Status Info Dialog */}
      <Dialog
        open={openStatusInfo}
        onClose={() => setOpenStatusInfo(false)}
        PaperProps={{
          style: {
            borderRadius: 8,
            padding: 8,
            width: '450px'
          }
        }}
      >
        <DialogTitle style={{ paddingBottom: 8 }}>
          <Box display="flex" alignItems="center">
            {getStatusIcon(selectedVideo?.status)}
            <Typography variant="h6" style={{ marginLeft: 8 }}>
              {getStatusLabel(selectedVideo?.status)} Status
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>{selectedVideo?.title}</strong>
            </Typography>
          </Box>
          
          {selectedVideo?.status === 'PENDING_REVIEW' && (
            <Paper variant="outlined" style={{ padding: 16, marginBottom: 16, backgroundColor: '#fff8e1' }}>
              <Typography variant="body2" gutterBottom style={{ color: '#f57c00', fontWeight: 500 }}>
                This video is waiting for moderator review
              </Typography>
              <Typography variant="body2" style={{ color: '#f57c00' }}>
                Your video will be reviewed by our content team. You'll be notified when it's approved or rejected.
                This process typically takes 24-48 hours.
              </Typography>
            </Paper>
          )}
          
          {selectedVideo?.status === 'APPROVED' && (
            <Paper variant="outlined" style={{ padding: 16, marginBottom: 16, backgroundColor: '#e8f5e9' }}>
              <Typography variant="body2" gutterBottom style={{ color: '#2e7d32', fontWeight: 500 }}>
                This video has been approved by moderators
              </Typography>
              <Typography variant="body2" style={{ color: '#2e7d32' }}>
                Your video meets our community guidelines and has been approved for publication.
                You can now change its visibility to Public if you wish.
              </Typography>
            </Paper>
          )}
          
          {selectedVideo?.status === 'REJECTED' && (
            <Paper variant="outlined" style={{ padding: 16, marginBottom: 16, backgroundColor: '#ffebee' }}>
              <Typography variant="body2" gutterBottom style={{ color: '#c62828', fontWeight: 500 }}>
                This video has been rejected by moderators
              </Typography>
              <Typography variant="body2" style={{ color: '#c62828' }}>
                Your video doesn't meet our community guidelines or contains inappropriate content.
                You may edit and resubmit it for review.
              </Typography>
              <Typography variant="body2" style={{ color: '#c62828', marginTop: 8 }}>
                <strong>Reason:</strong> {selectedVideo?.rejectionReason || 'Content policy violation'}
              </Typography>
            </Paper>
          )}
          
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Current Status:</Typography>
            <Chip 
              label={getStatusLabel(selectedVideo?.status)}
              icon={getStatusIcon(selectedVideo?.status)}
              style={{ 
                backgroundColor: getStatusColor(selectedVideo?.status).background,
                color: getStatusColor(selectedVideo?.status).color
              }}
            />
          </Box>
          
          <Divider style={{ margin: '16px 0' }} />
          
          <Typography variant="body2" color="textSecondary">
            {selectedVideo?.status === 'PENDING_REVIEW' 
              ? 'You can edit your video while it\'s being reviewed, but any changes will restart the review process.'
              : selectedVideo?.status === 'REJECTED'
              ? 'You can edit your video and submit it for review again.'
              : 'You can change the visibility of your video at any time.'}
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          {selectedVideo?.status === 'REJECTED' && (
            <Button 
              onClick={() => {
                setOpenStatusInfo(false);
                handleEditClick(selectedVideo);
              }} 
              color="primary"
            >
              Edit Video
            </Button>
          )}
          {selectedVideo?.status === 'APPROVED' && (
            <Button 
              onClick={() => {
                setOpenStatusInfo(false);
                handleVisibilityClick(selectedVideo);
              }} 
              color="primary"
            >
              Change Visibility
            </Button>
          )}
          <Button 
            onClick={() => setOpenStatusInfo(false)} 
            color="secondary" 
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default MyVideos; 