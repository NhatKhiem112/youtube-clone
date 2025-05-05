import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  CircularProgress,
  Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VideoService from '../services/video.service';
import { useHistory } from 'react-router-dom';
import ReportVideoCard from '../components/ReportVideoCard';
import styled from 'styled-components/macro';
import ReportIcon from '@material-ui/icons/Report';
import { SHOW_MINI_SIDEBAR_BREAKPOINT, SHOW_FULL_SIDEBAR_BREAKPOINT, MINI_SIDEBAR_WIDTH, FULL_SIDEBAR_WIDTH } from '../utils/utils';
import { useAtom } from 'jotai';
import { isSidebarDrawerOpenAtom, userSettingToShowFullSidebarAtom } from '../store';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(8)
  },
  title: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(3)
  },
  errorBox: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
    backgroundColor: '#ffebee',
    borderRadius: theme.spacing(1),
    color: '#c62828'
  },
  emptyBox: {
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    textAlign: 'center'
  },
  subtitle: {
    marginBottom: theme.spacing(2)
  },
  backButton: {
    marginTop: theme.spacing(2)
  }
}));

const ReportsPage = () => {
  const classes = useStyles();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiAvailable, setApiAvailable] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const history = useHistory();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isSidebarDrawerOpen] = useAtom(isSidebarDrawerOpenAtom);
  const [showFullSidebar] = useAtom(userSettingToShowFullSidebarAtom);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      history.push('/login');
      return;
    }

    // Only fetch data once to prevent infinite loops
    if (dataFetched) {
      return;
    }

    // Add a flag to prevent multiple API calls
    let isMounted = true;
    
    const fetchReports = async () => {
      if (!isMounted) return;
      
      try {
        console.log('Fetching reports...');
        const data = await VideoService.getUserReports();
        
        // Prevent state updates if component unmounted
        if (!isMounted) return;
        
        // Check if data is empty (which could indicate an error was handled by the service)
        if (!data || data.length === 0) {
          console.log('No reports data available');
          setLoading(false);
          setDataFetched(true);
          return;
        }
        
        // Normalize data to match ReportVideoCard expectations
        const normalizedReports = data.map(report => ({
          ...report,
          reason: report.reportReason || report.reason,
          videoId: report.videoId, 
          title: report.title || 'Untitled Report',
          thumbnailUrl: report.thumbnailUrl || null,
          channelTitle: report.channelTitle || '',
          createdAt: report.createdAt || new Date().toISOString(),
          status: report.status || 'PENDING'
        }));
        
        setReports(normalizedReports);
        setLoading(false);
        setDataFetched(true);
      } catch (err) {
        console.error('Error fetching reports:', err);
        
        // Prevent state updates if component unmounted
        if (!isMounted) return;
        
        if (err.response && err.response.status === 404) {
          // API endpoint doesn't exist yet
          setApiAvailable(false);
          setError('The report feature is currently unavailable on the server.');
        } else {
          setError('Failed to load your reports. Please try again later.');
        }
        setLoading(false);
        setDataFetched(true);
      }
    };

    fetchReports();
    
    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [history, user, dataFetched]);

  const handleGoBack = () => {
    history.goBack();
  };

  const handleRetry = () => {
    setDataFetched(false);
    setLoading(true);
    setError('');
  };

  if (loading) {
    return (
      <ReportsContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      </ReportsContainer>
    );
  }

  if (!apiAvailable) {
    return (
      <ReportsContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
        <HeaderContainer>
          <StyledIcon />
          <Typography variant="h4" component="h1">
            Reports Feature
          </Typography>
        </HeaderContainer>
        
        <ErrorContainer>
          <Typography variant="h6">Service Unavailable</Typography>
          <Typography>
            The report feature is currently unavailable. The backend API for this feature has not been deployed yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            style={{ marginTop: '16px' }}
            onClick={handleGoBack}
          >
            Go Back
          </Button>
        </ErrorContainer>
      </ReportsContainer>
    );
  }

  return (
    <ReportsContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
      <HeaderContainer>
        <StyledIcon />
        <Typography variant="h4" component="h1">
          Your Reports
        </Typography>
      </HeaderContainer>

      {error && (
        <ErrorContainer>
          <Typography>{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            style={{ marginTop: '16px' }}
            onClick={handleRetry}
          >
            Retry
          </Button>
        </ErrorContainer>
      )}

      {!error && reports.length === 0 ? (
        <EmptyContainer>
          <Typography variant="h6">
            You haven't reported any videos yet
          </Typography>
          <Typography variant="body1" color="textSecondary" style={{ marginTop: 8 }}>
            When you report a video, it will appear here
          </Typography>
        </EmptyContainer>
      ) : (
        <>
          <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
            Videos you've reported ({reports.length})
          </Typography>
          
          {reports.map(report => (
            <ReportVideoCard key={report.id} report={report} />
          ))}
        </>
      )}
    </ReportsContainer>
  );
};

const ReportsContainer = styled.div`
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
`;

const StyledIcon = styled(ReportIcon)`
  && {
    font-size: 2rem;
    margin-right: 16px;
    color: #f44336;
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

export default ReportsPage; 