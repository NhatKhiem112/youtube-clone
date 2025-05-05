import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
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
  Box,
  SnackbarContent,
  Tabs,
  Tab,
  Divider,
  Chip,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  FormHelperText
} from '@material-ui/core';
import { green, red, amber, blue } from '@material-ui/core/colors';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import FilterListIcon from '@material-ui/icons/FilterList';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import CommentIcon from '@material-ui/icons/Comment';
import DateRangeIcon from '@material-ui/icons/DateRange';
import TodayIcon from '@material-ui/icons/Today';
import axios from 'axios';
import authHeader from '../services/auth-header';

// Custom Alert component to replace @material-ui/lab/Alert
const CustomAlert = ({ severity, onClose, children }) => {
  const getColor = () => {
    switch (severity) {
      case 'success': return green[600];
      case 'error': return red[600];
      case 'warning': return amber[700];
      case 'info': return blue[600];
      default: return blue[600];
    }
  };

  return (
    <SnackbarContent
      style={{ backgroundColor: getColor() }}
      message={<span>{children}</span>}
      action={
        onClose && (
          <Button color="inherit" size="small" onClick={onClose}>
            CLOSE
          </Button>
        )
      }
    />
  );
};

const UploadVideo = () => {
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoSettings, setVideoSettings] = useState({
    status: 'PUBLIC',
    allowComments: true,
    showRatings: true,
    ageRestriction: false,
    category: 'entertainment',
    tags: '',
    license: 'standard'
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const videoInputRef = useRef();
  const thumbnailInputRef = useRef();
  
  // Thêm trạng thái cho tab
  const [tabValue, setTabValue] = useState(0);
  
  // Thêm trạng thái cho việc lọc và hiển thị
  const [viewCount, setViewCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [likePercentage, setLikePercentage] = useState(0);
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setVideoPreview(e.target.result);
      };
      fileReader.readAsDataURL(file);
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

  const handleVideoUpload = async (event) => {
    event.preventDefault();
    
    if (!videoFile) {
      setNotification({
        open: true,
        message: 'Please select a video file',
        severity: 'error'
      });
      return;
    }

    if (!title.trim()) {
      setNotification({
        open: true,
        message: 'Please enter a title',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', videoSettings.status);
    
    // Thêm các trường metadata mới
    formData.append('allowComments', videoSettings.allowComments);
    formData.append('showRatings', videoSettings.showRatings);
    formData.append('ageRestriction', videoSettings.ageRestriction);
    formData.append('category', videoSettings.category);
    formData.append('tags', videoSettings.tags);
    formData.append('license', videoSettings.license);
    
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    setLoading(true);

    try {
      // Đảm bảo URL đúng với endpoint backend
      const response = await axios.post(
        '/api/videos/upload',
        formData,
        {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setNotification({
        open: true,
        message: 'Video uploaded successfully!',
        severity: 'success'
      });

      // Redirect to video page after 2 seconds
      setTimeout(() => {
        history.push(`/watch?v=${response.data.id}`);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Chi tiết hơn về lỗi
      let errorMessage = 'Failed to upload video';
      
      if (error.response) {
        // Server trả về lỗi với mã trạng thái
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
        
        if (error.response.status === 405) {
          errorMessage = 'Method not allowed. Server không chấp nhận phương thức POST tại endpoint này.';
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized. Vui lòng đăng nhập lại.';
        } else if (error.response.status === 413) {
          errorMessage = 'Video quá lớn, vượt quá giới hạn kích thước của server.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Yêu cầu đã được gửi nhưng không nhận được phản hồi
        console.error('Request:', error.request);
        errorMessage = 'Không nhận được phản hồi từ server. Kiểm tra xem server có đang chạy không.';
      } else {
        // Lỗi xảy ra trong quá trình thiết lập request
        console.error('Error message:', error.message);
        errorMessage = `Lỗi khi tạo yêu cầu: ${error.message}`;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '32px', marginBottom: '32px' }}>
      <Paper elevation={3} style={{ padding: '24px' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Video
        </Typography>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="secondary"
          variant="fullWidth"
          style={{ marginBottom: '24px', borderBottom: '1px solid #eee' }}
        >
          <Tab label="Chi tiết" style={{ fontWeight: tabValue === 0 ? 'bold' : 'normal', color: tabValue === 0 ? '#cc0000' : '#606060' }} />
          <Tab label="Tùy chọn nâng cao" style={{ fontWeight: tabValue === 1 ? 'bold' : 'normal', color: tabValue === 1 ? '#cc0000' : '#606060' }} />
          <Tab label="Thống kê & Lọc" style={{ fontWeight: tabValue === 2 ? 'bold' : 'normal', color: tabValue === 2 ? '#cc0000' : '#606060' }} />
        </Tabs>
        
        <form onSubmit={handleVideoUpload}>
          {/* Tab chi tiết video cơ bản */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Video Upload Area */}
              <Grid item xs={12}>
                <Box 
                  border={1} 
                  borderColor="grey.300" 
                  borderRadius={4} 
                  p={3} 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center"
                  onClick={() => videoInputRef.current.click()}
                  style={{ 
                    cursor: 'pointer', 
                    minHeight: '200px', 
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '2px dashed #ddd'
                  }}
                >
                  {videoPreview ? (
                    <video 
                      controls 
                      src={videoPreview} 
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} 
                    />
                  ) : (
                    <>
                      <CloudUploadIcon style={{ fontSize: 60, color: '#cc0000', marginBottom: '16px' }} />
                      <Typography variant="h6" style={{ color: '#333', fontWeight: 500 }}>Select video to upload</Typography>
                      <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', maxWidth: '80%', marginTop: '8px' }}>
                        Or drag and drop video files
                        <br />
                        <span style={{ fontSize: '12px', color: '#888' }}>MP4, WebM, MOV (Recommended: 1080p or 720p)</span>
                      </Typography>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    ref={videoInputRef}
                    style={{ display: 'none' }}
                  />
                </Box>
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
                  style={{ cursor: 'pointer', height: '150px', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundColor: '#f5f5f5' }}
                >
                  {thumbnailPreview ? (
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      style={{ maxWidth: '100%', maxHeight: '130px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <>
                      <PhotoCameraIcon style={{ fontSize: 40, color: '#cc0000', marginBottom: '8px' }} />
                      <Typography variant="body2" align="center" style={{ color: '#606060' }}>
                        Select thumbnail image
                        <br />
                        <span style={{ fontSize: '10px' }}>JPEG, PNG (Recommended: 1280×720)</span>
                      </Typography>
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
                <FormControl fullWidth style={{ marginBottom: '16px' }}>
                  <InputLabel id="status-label">Video Visibility</InputLabel>
                  <Select
                    labelId="status-label"
                    value={videoSettings.status}
                    onChange={(e) => setVideoSettings({...videoSettings, status: e.target.value})}
                    label="Video Visibility"
                  >
                    <MenuItem value="PUBLIC">Public (Everyone can see)</MenuItem>
                    <MenuItem value="PRIVATE">Private (Only you can see)</MenuItem>
                    <MenuItem value="UNLISTED">Unlisted (Anyone with the link)</MenuItem>
                    <MenuItem value="PENDING_REVIEW">Submit for Review (Need approval before public)</MenuItem>
                  </Select>
                  <FormHelperText>
                    {videoSettings.status === 'PENDING_REVIEW' ? 
                      'Your video will be reviewed by moderators before being published.' : 
                      'Choose who can see your video'}
                  </FormHelperText>
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
            </Grid>
          )}
          
          {/* Tab tùy chọn nâng cao */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tùy chọn nâng cao
                </Typography>
                <Divider style={{ marginBottom: '16px' }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="category-label">Thể loại</InputLabel>
                  <Select
                    labelId="category-label"
                    value={videoSettings.category}
                    onChange={(e) => setVideoSettings({...videoSettings, category: e.target.value})}
                    label="Thể loại"
                  >
                    <MenuItem value="entertainment">Giải trí</MenuItem>
                    <MenuItem value="music">Âm nhạc</MenuItem>
                    <MenuItem value="education">Giáo dục</MenuItem>
                    <MenuItem value="gaming">Trò chơi</MenuItem>
                    <MenuItem value="sports">Thể thao</MenuItem>
                    <MenuItem value="news">Tin tức</MenuItem>
                    <MenuItem value="howto">Hướng dẫn</MenuItem>
                    <MenuItem value="science">Khoa học</MenuItem>
                    <MenuItem value="travel">Du lịch</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="license-label">Giấy phép</InputLabel>
                  <Select
                    labelId="license-label"
                    value={videoSettings.license}
                    onChange={(e) => setVideoSettings({...videoSettings, license: e.target.value})}
                    label="Giấy phép"
                  >
                    <MenuItem value="standard">Giấy phép YouTube tiêu chuẩn</MenuItem>
                    <MenuItem value="creative">Creative Commons</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Tags (phân cách bằng dấu phẩy)"
                  variant="outlined"
                  fullWidth
                  value={videoSettings.tags}
                  onChange={(e) => setVideoSettings({...videoSettings, tags: e.target.value})}
                  margin="normal"
                  placeholder="video, youtube, tutorial, ..."
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Hạn chế & Quyền
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={videoSettings.allowComments} 
                      onChange={(e) => setVideoSettings({...videoSettings, allowComments: e.target.checked})} 
                      color="primary"
                    />
                  }
                  label="Cho phép bình luận"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={videoSettings.showRatings} 
                      onChange={(e) => setVideoSettings({...videoSettings, showRatings: e.target.checked})} 
                      color="primary"
                    />
                  }
                  label="Hiển thị đánh giá (thích/không thích)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={videoSettings.ageRestriction} 
                      onChange={(e) => setVideoSettings({...videoSettings, ageRestriction: e.target.checked})} 
                      color="primary"
                    />
                  }
                  label="Hạn chế độ tuổi (18+)"
                />
              </Grid>
            </Grid>
          )}
          
          {/* Tab Thống kê & Lọc */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <FilterListIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Lọc & Thống kê
                </Typography>
                <Divider style={{ marginBottom: '16px' }} />
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  <Chip 
                    icon={<VisibilityIcon />} 
                    label={`Chế độ: ${videoSettings.status === 'PUBLIC' ? 'Công khai' : videoSettings.status === 'PRIVATE' ? 'Riêng tư' : videoSettings.status === 'UNLISTED' ? 'Không liệt kê' : 'Chờ kiểm duyệt'}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    icon={<TodayIcon />} 
                    label={`Ngày tải lên: ${formatDate(uploadDate)}`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      <VisibilityIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      Lượt xem
                    </Typography>
                    <Typography variant="h5" component="h2">
                      {viewCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      <CommentIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      Bình luận
                    </Typography>
                    <Typography variant="h5" component="h2">
                      {commentCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      <ThumbUpIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      Lượt thích (%)
                    </Typography>
                    <Typography variant="h5" component="h2">
                      {likePercentage}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Box mt={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    <DateRangeIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Ngày tải lên
                  </Typography>
                  <TextField
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" style={{ marginTop: '16px' }}>
                  * Các thống kê sẽ cập nhật sau khi video được đăng tải
                </Typography>
              </Grid>
            </Grid>
          )}
          
          <Grid container spacing={3} style={{ marginTop: '16px' }}>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={24} /> : null}
                style={{ 
                  backgroundColor: loading ? '#f5f5f5' : '#cc0000',
                  color: loading ? '#999' : 'white',
                  padding: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 5px rgba(204, 0, 0, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Uploading...' : 'Upload Video'}
              </Button>
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
        <CustomAlert severity={notification.severity} onClose={handleCloseNotification}>
          {notification.message}
        </CustomAlert>
      </Snackbar>
    </Container>
  );
};

export default UploadVideo; 