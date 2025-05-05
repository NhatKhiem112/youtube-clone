import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Box
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import axios from 'axios';
import authHeader from '../services/auth-header';

const EditVideo = () => {
  const { id } = useParams();
  const history = useHistory();
  const [videoData, setVideoData] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const thumbnailInputRef = useRef();

  useEffect(() => {
    fetchVideoData();
  }, [id]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/videos/${id}`, { headers: authHeader() });
      setVideoData(response.data);
      setTitle(response.data.title);
      setDescription(response.data.description || '');
      setStatus(response.data.status);
      setThumbnailPreview(response.data.thumbnailUrl);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching video data:', error);
      setError('Failed to load video data. Please try again later.');
      setLoading(false);
    }
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!title.trim()) {
      setNotification({
        open: true,
        message: 'Please enter a title',
        severity: 'error'
      });
      return;
    }

    setSaving(true);

    try {
      // Update video metadata
      const response = await axios.put(
        `/api/videos/${id}`,
        {
          title,
          description,
          status
        },
        { headers: authHeader() }
      );

      // If a new thumbnail was selected, upload it
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('thumbnail', thumbnailFile);
        
        await axios.post(
          `/api/videos/${id}/thumbnail`,
          formData,
          {
            headers: {
              ...authHeader(),
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      setNotification({
        open: true,
        message: 'Video updated successfully!',
        severity: 'success'
      });

      // Redirect back to my videos page after 2 seconds
      setTimeout(() => {
        history.push('/my-videos');
      }, 2000);
    } catch (error) {
      console.error('Update error:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to update video',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Container style={{ marginTop: '32px', textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ marginTop: '32px' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '32px', marginBottom: '32px' }}>
      <Paper elevation={3} style={{ padding: '24px' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Video
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Video Preview */}
            <Grid item xs={12}>
              {videoData && videoData.videoUrl && (
                <Box border={1} borderColor="grey.300" borderRadius={4} p={2} mb={2}>
                  <video 
                    controls 
                    src={videoData.videoUrl} 
                    style={{ maxWidth: '100%', maxHeight: '300px', margin: '0 auto', display: 'block' }} 
                  />
                </Box>
              )}
            </Grid>

            {/* Thumbnail Upload Area */}
            <Grid item xs={12} sm={6}>
              <Box 
                border={1} 
                borderColor="grey.300" 
                borderRadius={4} 
                p={2} 
                display="flex" 
                flexDirection="column" 
                alignItems="center"
                onClick={() => thumbnailInputRef.current.click()}
                style={{ cursor: 'pointer', height: '150px', justifyContent: 'center' }}
              >
                {thumbnailPreview ? (
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    style={{ maxWidth: '100%', maxHeight: '130px' }} 
                  />
                ) : (
                  <>
                    <PhotoCameraIcon style={{ fontSize: 40, color: '#606060', marginBottom: '8px' }} />
                    <Typography variant="body2">Select new thumbnail image</Typography>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  ref={thumbnailInputRef}
                  style={{ display: 'none' }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="status-label">Visibility</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Visibility"
                >
                  <MenuItem value="PUBLIC">Public</MenuItem>
                  <MenuItem value="UNLISTED">Unlisted</MenuItem>
                  <MenuItem value="PRIVATE">Private</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Video Details */}
            <Grid item xs={12}>
              <TextField
                label="Title"
                variant="outlined"
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between">
                <Button
                  variant="outlined"
                  onClick={() => history.push('/my-videos')}
                  style={{ width: '48%' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  style={{ width: '48%' }}
                >
                  {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

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
    </Container>
  );
};

export default EditVideo; 