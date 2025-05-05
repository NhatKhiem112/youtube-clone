import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import Button from '@material-ui/core/Button';
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

import WatchLaterVideoCard from '../components/WatchLaterVideoCard';

const WatchLaterPage = () => {
    const [watchLaterVideos, setWatchLaterVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isLoggedIn, currentUser } = useAuth();
    const history = useHistory();
    const [isSidebarDrawerOpen] = useAtom(isSidebarDrawerOpenAtom);
    const [showFullSidebar] = useAtom(userSettingToShowFullSidebarAtom);

    useEffect(() => {
        // Luôn làm mới danh sách khi người dùng đăng nhập hoặc thay đổi
        if (isLoggedIn && currentUser) {
            console.log("Fetching Watch Later videos for user:", currentUser.username || currentUser.email);
            fetchWatchLaterVideos();
        } else {
            setLoading(false);
            setWatchLaterVideos([]);
        }

        // Cleanup function khi component unmount hoặc dependence thay đổi
        return () => {
            console.log("Cleaning up Watch Later page");
        };
    }, [isLoggedIn, currentUser]);

    const fetchWatchLaterVideos = async () => {
        try {
            setLoading(true);
            // Đảm bảo lấy token mới nhất từ localStorage trước khi gọi API
            // VideoService.getWatchLaterVideos() sẽ sử dụng token từ authHeader()
            const data = await VideoService.getWatchLaterVideos();
            console.log(`Fetched ${data.length} videos for Watch Later`);
            setWatchLaterVideos(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching watch later videos', err);
            // Xác định loại lỗi cụ thể để hiển thị thông báo phù hợp
            if (err.response && err.response.status === 500) {
                setError('Database connection error: Please make sure MySQL is running and phpMyAdmin is accessible.');
            } else if (err.request) {
                setError('Cannot connect to backend server. Please check if the Spring Boot application is running on port 8080.');
            } else {
                setError(`Failed to load watch later videos: ${err.message}`);
            }
            setLoading(false);
        }
    };

    const handleRemove = async (videoId) => {
        try {
            // Đảm bảo sử dụng token của người dùng hiện tại
            console.log(`Removing video ${videoId} from Watch Later for user: ${currentUser?.username || currentUser?.email}`);
            await VideoService.removeFromWatchLater(videoId);
            
            // Cập nhật UI sau khi xóa thành công
            setWatchLaterVideos(prevVideos => prevVideos.filter(video => video.videoId !== videoId));
        } catch (error) {
            console.error('Error removing video from watch later', error);
            setError(`Error removing video: ${error.message}`);
        }
    };

    const handleLoginClick = () => {
        history.push('/login');
    };

    // Nếu không đăng nhập, hiển thị thông báo yêu cầu đăng nhập
    if (!isLoggedIn) {
        return (
            <WatchLaterContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
                <HeaderContainer>
                    <StyledIcon />
                    <Typography variant="h4" component="h1">
                        Watch Later
                    </Typography>
                    <DatabaseBadge>
                        <DatabaseIcon fontSize="small" />
                        <Typography variant="caption">Lưu trong database</Typography>
                    </DatabaseBadge>
                </HeaderContainer>

                <NotLoggedInContainer>
                    <Typography variant="h6" gutterBottom>
                        Đăng nhập để xem danh sách "Xem sau" của bạn
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Video bạn lưu để xem sau sẽ xuất hiện ở đây trong database của hệ thống
                    </Typography>
                    <LoginButton
                        variant="contained"
                        color="primary"
                        onClick={handleLoginClick}
                    >
                        Đăng nhập
                    </LoginButton>
                </NotLoggedInContainer>
            </WatchLaterContainer>
        );
    }

    return (
        <WatchLaterContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
            <HeaderContainer>
                <StyledIcon />
                <Typography variant="h4" component="h1">
                    Watch Later
                </Typography>
                <DatabaseBadge>
                    <DatabaseIcon fontSize="small" />
                    <Typography variant="caption">Lưu trong database</Typography>
                </DatabaseBadge>
                {currentUser && (
                    <UserInfoContainer>
                        <Typography variant="subtitle1">
                            {currentUser.username || currentUser.email}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {watchLaterVideos.length} video{watchLaterVideos.length !== 1 ? 's' : ''}
                        </Typography>
                    </UserInfoContainer>
                )}
            </HeaderContainer>

            {loading ? (
                <LoadingContainer>
                    <CircularProgress />
                </LoadingContainer>
            ) : error ? (
                <ErrorContainer>
                    <Typography variant="body1" color="error">
                        {error}
                    </Typography>
                    {error.includes('Database') && (
                        <Typography variant="body2" style={{ marginTop: '16px' }}>
                            Please make sure:
                            <ul>
                                <li>MySQL server is installed and running</li>
                                <li>phpMyAdmin is accessible at localhost/phpmyadmin</li>
                                <li>Database 'youtube_clone' exists (it should be created automatically)</li>
                                <li>Backend Spring Boot application is running on port 8080</li>
                            </ul>
                        </Typography>
                    )}
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={fetchWatchLaterVideos}
                        style={{ marginTop: '16px' }}
                    >
                        Try Again
                    </Button>
                </ErrorContainer>
            ) : watchLaterVideos.length === 0 ? (
                <EmptyContainer>
                    <StyledWatchLaterIcon />
                    <Typography variant="h6">
                        Danh sách "Xem sau" của bạn đang trống
                    </Typography>
                    <Typography variant="body1" style={{ marginTop: '8px', textAlign: 'center', maxWidth: '600px' }}>
                        Các video bạn đánh dấu "Xem sau" sẽ xuất hiện ở đây. Quay lại xem video và nhấn vào biểu tượng 
                        "SAVE" để thêm video vào danh sách này.
                    </Typography>
                    <ExploreButton
                        variant="contained"
                        color="primary"
                        onClick={() => history.push('/')}
                        style={{ marginTop: '16px' }}
                    >
                        Khám phá video
                    </ExploreButton>
                </EmptyContainer>
            ) : (
                <Grid container spacing={2}>
                    {watchLaterVideos.map((video) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
                            <WatchLaterVideoCard
                                video={video}
                                onRemove={handleRemove}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </WatchLaterContainer>
    );
};

const WatchLaterContainer = styled.div`
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

const StyledIcon = styled(WatchLaterIcon)`
  && {
    font-size: 2rem;
    margin-right: 16px;
    color: #3f51b5;
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

const StyledWatchLaterIcon = styled(WatchLaterIcon)`
  && {
    font-size: 48px;
    color: #909090;
    margin-bottom: 16px;
  }
`;

const ExploreButton = styled(Button)`
  && {
    margin-top: 24px;
  }
`;

const NotLoggedInContainer = styled.div`
  margin: 32px auto;
  max-width: 600px;
  text-align: center;
  padding: 24px;
  background-color: #f9f9f9;
  border-radius: 8px;
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

const DatabaseBadge = styled.div`
  display: flex;
  align-items: center;
  background-color: #E3F2FD;
  border-radius: 16px;
  padding: 4px 8px;
  margin-left: 12px;
  
  svg {
    margin-right: 4px;
    color: #1976D2;
  }
`;

export default WatchLaterPage; 