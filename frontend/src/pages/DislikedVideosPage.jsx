import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Button from '@material-ui/core/Button';
import VideoService from '../services/video.service';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import {
    FULL_SIDEBAR_WIDTH,
    MINI_SIDEBAR_WIDTH,
    SHOW_FULL_SIDEBAR_BREAKPOINT,
    SHOW_MINI_SIDEBAR_BREAKPOINT,
    useMinWidthToShowFullSidebar,
    useShouldShowMiniSidebar
} from '../utils/utils';

import DislikedVideoCard from '../components/DislikedVideoCard';

const DislikedVideosPage = () => {
    const [dislikedVideos, setDislikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isLoggedIn } = useAuth();
    const history = useHistory();
    const showFullSidebar = useMinWidthToShowFullSidebar();
    const showMiniSidebar = useShouldShowMiniSidebar();

    useEffect(() => {
        // Only fetch disliked videos if logged in
        if (isLoggedIn) {
            fetchDislikedVideos();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn]);

    const fetchDislikedVideos = async () => {
        try {
            setLoading(true);
            const data = await VideoService.getDislikedVideos();
            setDislikedVideos(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching disliked videos', err);
            setError('Failed to load disliked videos');
            setLoading(false);
        }
    };

    const handleUndislike = async (videoId) => {
        try {
            await VideoService.undislikeVideo(videoId);
            // Remove undisliked video from the list
            setDislikedVideos(dislikedVideos.filter(video => video.videoId !== videoId));
        } catch (error) {
            console.error('Error undisliking video', error);
        }
    };

    const handleLoginClick = () => {
        history.push('/login');
    };

    // If not logged in, display a message asking to sign in
    if (!isLoggedIn) {
        return (
            <DislikedVideosContainer showFullSidebar={showFullSidebar} showMiniSidebar={showMiniSidebar}>
                <HeaderContainer>
                    <StyledIcon />
                    <Typography variant="h4" component="h1">
                        Disliked Videos
                    </Typography>
                </HeaderContainer>

                <NotLoggedInContainer>
                    <Typography variant="h6" gutterBottom>
                        Sign in to view your disliked videos
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Videos that you dislike will be shown here
                    </Typography>
                    <LoginButton
                        variant="contained"
                        color="primary"
                        onClick={handleLoginClick}
                    >
                        Sign In
                    </LoginButton>
                </NotLoggedInContainer>
            </DislikedVideosContainer>
        );
    }

    return (
        <DislikedVideosContainer showFullSidebar={showFullSidebar} showMiniSidebar={showMiniSidebar}>
            <HeaderContainer>
                <StyledIcon />
                <Typography variant="h4" component="h1">
                    Disliked Videos
                </Typography>
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
                </ErrorContainer>
            ) : dislikedVideos.length === 0 ? (
                <EmptyContainer>
                    <Typography variant="h6">
                        You haven't disliked any videos yet.
                    </Typography>
                </EmptyContainer>
            ) : (
                <Grid container spacing={2}>
                    {dislikedVideos.map((video) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
                            <DislikedVideoCard
                                video={video}
                                onUndislike={handleUndislike}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </DislikedVideosContainer>
    );
};

const DislikedVideosContainer = styled.div`
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

const StyledIcon = styled(ThumbDownIcon)`
  && {
    font-size: 2rem;
    margin-right: 16px;
    color: #2196f3;
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
`;

const EmptyContainer = styled.div`
  text-align: center;
  padding: 64px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const NotLoggedInContainer = styled.div`
  text-align: center;
  padding: 64px;
  background-color: #f9f9f9;
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

export default DislikedVideosPage; 