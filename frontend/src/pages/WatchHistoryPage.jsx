import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import HistoryIcon from '@material-ui/icons/History';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import VideoService from '../services/video.service';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import {
    FULL_SIDEBAR_WIDTH,
    MINI_SIDEBAR_WIDTH,
    SHOW_FULL_SIDEBAR_BREAKPOINT,
    SHOW_MINI_SIDEBAR_BREAKPOINT
} from '../utils/utils';
import DatabaseIcon from '@material-ui/icons/Storage';
import { useAtom } from 'jotai';
import { isSidebarDrawerOpenAtom, userSettingToShowFullSidebarAtom } from '../store';

import WatchHistoryVideoCard from '../components/WatchHistoryVideoCard';

const WatchHistoryPage = () => {
    const [watchedVideos, setWatchedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showClearDialog, setShowClearDialog] = useState(false);
    const { isLoggedIn, currentUser } = useAuth();
    const history = useHistory();
    const [isSidebarDrawerOpen] = useAtom(isSidebarDrawerOpenAtom);
    const [showFullSidebar] = useAtom(userSettingToShowFullSidebarAtom);

    useEffect(() => {
        if (isLoggedIn && currentUser) {
            console.log("Fetching Watch History for user:", currentUser.username || currentUser.email);
            fetchWatchHistory();
        } else {
            setLoading(false);
            setWatchedVideos([]);
        }

        return () => {
            console.log("Cleaning up Watch History page");
        };
    }, [isLoggedIn, currentUser]);

    const fetchWatchHistory = async () => {
        try {
            setLoading(true);
            console.log("Đang gọi API lấy lịch sử xem...");
            const data = await VideoService.getWatchHistory();
            console.log(`Kết quả từ API: ${JSON.stringify(data)}`);
            console.log(`Fetched ${data.length} videos for Watch History`);
            setWatchedVideos(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching watch history', err);
            if (err.response && err.response.status === 500) {
                setError('Database connection error: Please make sure MySQL is running and phpMyAdmin is accessible.');
            } else if (err.request) {
                setError('Cannot connect to backend server. Please check if the Spring Boot application is running on port 8080.');
            } else {
                setError(`Failed to load watch history: ${err.message}`);
            }
            setLoading(false);
        }
    };

    const handleRemove = async (videoId) => {
        try {
            console.log(`Removing video ${videoId} from Watch History for user: ${currentUser?.username || currentUser?.email}`);
            await VideoService.removeFromWatchHistory(videoId);
            
            setWatchedVideos(prevVideos => prevVideos.filter(video => video.videoId !== videoId));
        } catch (error) {
            console.error('Error removing video from watch history', error);
            setError(`Error removing video: ${error.message}`);
        }
    };

    const handleClearHistory = async () => {
        try {
            setShowClearDialog(false);
            setLoading(true);
            
            console.log(`Clearing Watch History for user: ${currentUser?.username || currentUser?.email}`);
            await VideoService.clearWatchHistory();
            
            setWatchedVideos([]);
            setLoading(false);
        } catch (error) {
            console.error('Error clearing watch history', error);
            setError(`Error clearing history: ${error.message}`);
            setLoading(false);
        }
    };

    const handleLoginClick = () => {
        history.push('/login');
    };

    // Nếu không đăng nhập, hiển thị thông báo yêu cầu đăng nhập
    if (!isLoggedIn) {
        return (
            <WatchHistoryContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
                <HeaderContainer>
                    <StyledIcon />
                    <Typography variant="h4" component="h1">
                        Lịch sử xem
                    </Typography>
                    <DatabaseBadge>
                        <DatabaseIcon fontSize="small" />
                        <Typography variant="caption">Lưu trong database</Typography>
                    </DatabaseBadge>
                </HeaderContainer>

                <NotLoggedInContainer>
                    <Typography variant="h6" gutterBottom>
                        Đăng nhập để xem lịch sử xem của bạn
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Video bạn đã xem sẽ xuất hiện ở đây trong database của hệ thống
                    </Typography>
                    <LoginButton
                        variant="contained"
                        color="primary"
                        onClick={handleLoginClick}
                    >
                        Đăng nhập
                    </LoginButton>
                </NotLoggedInContainer>
            </WatchHistoryContainer>
        );
    }

    return (
        <WatchHistoryContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
            <HeaderContainer>
                <StyledIcon />
                <Typography variant="h4" component="h1">
                    Lịch sử xem
                </Typography>
                <DatabaseBadge>
                    <DatabaseIcon fontSize="small" />
                    <Typography variant="caption">Lưu trong database</Typography>
                </DatabaseBadge>
                {currentUser && (
                    <UserInfoContainer>
                        <Typography variant="subtitle1" style={{ fontWeight: 500 }}>
                            {currentUser.username || currentUser.email}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {watchedVideos.length} video{watchedVideos.length !== 1 ? 's' : ''}
                        </Typography>
                    </UserInfoContainer>
                )}
                
                {watchedVideos.length > 0 && (
                    <ClearHistoryButton
                        variant="contained"
                        color="secondary"
                        startIcon={<DeleteForeverIcon />}
                        onClick={() => setShowClearDialog(true)}
                    >
                        Xoá lịch sử
                    </ClearHistoryButton>
                )}
            </HeaderContainer>

            {loading ? (
                <LoadingContainer>
                    <CircularProgress />
                </LoadingContainer>
            ) : error ? (
                <ErrorContainer>
                    <Typography variant="h6" gutterBottom>
                        Lỗi khi tải dữ liệu
                    </Typography>
                    <Typography variant="body1" color="error">
                        {error}
                    </Typography>
                    {error.includes('Database') && (
                        <Typography variant="body2" style={{ marginTop: '16px', textAlign: 'left' }}>
                            Vui lòng đảm bảo:
                            <ul>
                                <li>MySQL server đã được cài đặt và đang chạy</li>
                                <li>phpMyAdmin có thể truy cập tại localhost/phpmyadmin</li>
                                <li>Database 'youtube_clone' tồn tại (nó được tự động tạo)</li>
                                <li>Ứng dụng Spring Boot backend đang chạy trên cổng 8080</li>
                            </ul>
                        </Typography>
                    )}
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={fetchWatchHistory}
                        style={{ marginTop: '16px' }}
                    >
                        Thử lại
                    </Button>
                </ErrorContainer>
            ) : watchedVideos.length === 0 ? (
                <EmptyContainer>
                    <StyledHistoryIcon />
                    <Typography variant="h6">
                        Lịch sử xem của bạn đang trống
                    </Typography>
                    <Typography variant="body1" style={{ marginTop: '8px', textAlign: 'center', maxWidth: '600px' }}>
                        Các video bạn đã xem sẽ xuất hiện ở đây. Lịch sử xem giúp bạn dễ dàng quay lại các video bạn đã xem trước đó.
                    </Typography>
                    <ExploreButton
                        variant="contained"
                        onClick={() => history.push('/')}
                    >
                        Khám phá video
                    </ExploreButton>
                </EmptyContainer>
            ) : (
                <>
                    <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
                        Video đã xem ({watchedVideos.length})
                    </Typography>
                    <Grid container spacing={2}>
                        {watchedVideos.map((video) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
                                <WatchHistoryVideoCard
                                    video={video}
                                    onRemove={handleRemove}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
            
            <Dialog
                open={showClearDialog}
                onClose={() => setShowClearDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    style: {
                        borderRadius: '8px',
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle id="alert-dialog-title" style={{ paddingBottom: '8px' }}>
                    {"Xác nhận xoá lịch sử xem"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xoá toàn bộ lịch sử xem? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowClearDialog(false)} color="primary">
                        Huỷ
                    </Button>
                    <Button 
                        onClick={handleClearHistory} 
                        color="secondary" 
                        variant="contained"
                        autoFocus
                    >
                        Xoá toàn bộ
                    </Button>
                </DialogActions>
            </Dialog>
        </WatchHistoryContainer>
    );
};

// Styled Components
const WatchHistoryContainer = styled.div`
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
    margin-left: ${props => (props.showFullSidebar && props.isSidebarDrawerOpen) ? FULL_SIDEBAR_WIDTH : MINI_SIDEBAR_WIDTH}px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 12px;
`;

const StyledIcon = styled(HistoryIcon)`
  && {
    font-size: 2rem;
    margin-right: 16px;
    color: #F44336;
  }
`;

const DatabaseBadge = styled.div`
  display: flex;
  align-items: center;
  background-color: #E3F2FD;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  margin-left: 16px;
  
  & svg {
    margin-right: 4px;
    color: #1976D2;
  }
`;

const UserInfoContainer = styled.div`
  margin-left: auto;
  text-align: right;
  
  @media (max-width: 600px) {
    margin-left: 0;
    width: 100%;
    text-align: left;
    margin-top: 8px;
  }
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
  background-color: #ffebee;
  border-radius: 8px;
  color: #c62828;
  margin-bottom: 24px;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 16px;
`;

const StyledHistoryIcon = styled(HistoryIcon)`
  font-size: 80px;
  color: #E0E0E0;
  margin-bottom: 24px;
`;

const ExploreButton = styled(Button)`
  && {
    margin-top: 24px;
    background-color: #3ea6ff;
    
    &:hover {
      background-color: #2196f3;
    }
  }
`;

const NotLoggedInContainer = styled.div`
  margin: 32px auto;
  max-width: 600px;
  text-align: center;
  padding: 24px;
  background-color: #F5F5F5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoginButton = styled(Button)`
  && {
    margin-top: 16px;
    background-color: #3ea6ff;
    
    &:hover {
      background-color: #2196f3;
    }
  }
`;

const ClearHistoryButton = styled(Button)`
  margin-left: 24px;
  background-color: #f44336;
  color: white;
  
  && {
    &:hover {
      background-color: #d32f2f;
    }
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 8px;
  }
`;

export default WatchHistoryPage; 