import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Tabs, 
  Tab,
  Paper,
  Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import authHeader from '../services/auth-header';
import { useHistory } from 'react-router-dom';
import ReportVideoCard from '../components/ReportVideoCard';
import styled from 'styled-components/macro';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { SHOW_MINI_SIDEBAR_BREAKPOINT, SHOW_FULL_SIDEBAR_BREAKPOINT, MINI_SIDEBAR_WIDTH, FULL_SIDEBAR_WIDTH } from '../utils/utils';
import { useAtom } from 'jotai';
import { isSidebarDrawerOpenAtom, userSettingToShowFullSidebarAtom } from '../store';

const REPORT_URL = 'http://localhost:8080/api/reports';

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
  tabsPaper: {
    marginBottom: theme.spacing(4)
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

const AdminReportsPage = () => {
  const classes = useStyles();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiAvailable, setApiAvailable] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const history = useHistory();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isSidebarDrawerOpen] = useAtom(isSidebarDrawerOpenAtom);
  const [showFullSidebar] = useAtom(userSettingToShowFullSidebarAtom);

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!user || !user.roles.includes('ROLE_ADMIN')) {
      history.push('/');
      return;
    }
    
    // Reset dataFetched when tab changes
    setDataFetched(false);
  }, [history, user, tabValue]);

  // Separate useEffect for data fetching to avoid infinite loops
  useEffect(() => {
    // If data already fetched for this tab, don't fetch again
    if (dataFetched || isRequestInProgress) {
      return;
    }

    // Add a flag to prevent multiple API calls
    let isMounted = true;
    setIsRequestInProgress(true);
    
    const fetchData = async () => {
      if (isMounted) {
        await fetchReports(isMounted);
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [dataFetched, tabValue, isRequestInProgress]);

  const fetchReports = async (isMounted = true) => {
    if (!isMounted) return;
    
    setLoading(true);
    try {
      let endpoint = `${REPORT_URL}`;
      
      if (tabValue === 1) {
        endpoint = `${REPORT_URL}/status/PENDING`;
      } else if (tabValue === 2) {
        endpoint = `${REPORT_URL}/status/REVIEWED`;
      } else if (tabValue === 3) {
        endpoint = `${REPORT_URL}/status/RESOLVED`;
      }
      
      try {
        console.log('Fetching admin reports...');
        const response = await axios.get(endpoint, {
          headers: authHeader(),
          timeout: 5000 // 5 second timeout
        });
        
        // Prevent state updates if component unmounted
        if (!isMounted) return;
        
        // Normalize data to match ReportVideoCard expectations
        const normalizedReports = response.data.map(report => ({
          ...report,
          reason: report.reason,
          videoId: report.videoId, 
          title: report.title || 'Untitled Report',
          thumbnailUrl: report.thumbnailUrl || null,
          channelTitle: report.channelTitle || '',
          createdAt: report.createdAt || new Date().toISOString(),
          status: report.status || 'PENDING'
        }));
        
        console.log('Normalized reports:', normalizedReports);
        setReports(normalizedReports);
        setLoading(false);
        setDataFetched(true);
        setIsRequestInProgress(false);
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Prevent state updates if component unmounted
        if (!isMounted) return;
        
        // If API not available, return mock data
        if (apiError.response && apiError.response.status === 404) {
          console.log('Providing mock data for admin reports');
          // Generate mock data based on tab
          let mockReports = [
            {
              id: 1,
              videoId: 'dQw4w9WgXcQ',
              title: 'Rick Astley - Never Gonna Give You Up',
              reason: 'inappropriate_content',
              description: 'This video contains inappropriate content',
              thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
              channelTitle: 'Rick Astley',
              createdAt: new Date().toISOString(),
              status: 'PENDING'
            },
            {
              id: 2,
              videoId: '9bZkp7q19f0',
              title: 'PSY - GANGNAM STYLE',
              reason: 'spam_misleading',
              description: 'This video contains misleading information',
              thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
              channelTitle: 'PSY',
              createdAt: new Date().toISOString(),
              status: 'REVIEWED'
            },
            {
              id: 3,
              videoId: 'kJQP7kiw5Fk',
              title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
              reason: 'harmful_dangerous_content',
              description: 'This video contains harmful content',
              thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
              channelTitle: 'Luis Fonsi',
              createdAt: new Date().toISOString(),
              status: 'RESOLVED'
            }
          ];
          
          // Filter by status based on tab
          if (tabValue === 1) {
            mockReports = mockReports.filter(report => report.status === 'PENDING');
          } else if (tabValue === 2) {
            mockReports = mockReports.filter(report => report.status === 'REVIEWED');
          } else if (tabValue === 3) {
            mockReports = mockReports.filter(report => report.status === 'RESOLVED');
          }
          
          if (!isMounted) return;
          setReports(mockReports);
          setLoading(false);
          setDataFetched(true);
          setIsRequestInProgress(false);
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      
      if (!isMounted) return;
      
      if (err.response && err.response.status === 404) {
        // API endpoint doesn't exist yet
        setApiAvailable(false);
        setError('The report feature is currently unavailable on the server.');
      } else {
        setError('Failed to load reports. Please try again later.');
      }
      setLoading(false);
      setDataFetched(true);
      setIsRequestInProgress(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await axios.put(
        `${REPORT_URL}/${reportId}/status?status=${newStatus}`,
        {},
        { headers: authHeader() }
      );
      
      // Update the local state to reflect the change
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
    } catch (err) {
      console.error('Error updating report status:', err);
      setError('Failed to update report status. Please try again.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    history.goBack();
  };
  
  const handleRetry = () => {
    setDataFetched(false);
    setError('');
  };

  if (loading) {
    return (
      <AdminReportsContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      </AdminReportsContainer>
    );
  }

  if (!apiAvailable) {
    return (
      <AdminReportsContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
        <HeaderContainer>
          <StyledIcon />
          <Typography variant="h4" component="h1">
            Report Management
          </Typography>
        </HeaderContainer>
        
        <ErrorContainer>
          <Typography variant="h6">Service Unavailable</Typography>
          <Typography>
            The report management feature is currently unavailable. The backend API for this feature has not been deployed yet.
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
      </AdminReportsContainer>
    );
  }

  return (
    <AdminReportsContainer showFullSidebar={showFullSidebar} isSidebarDrawerOpen={isSidebarDrawerOpen}>
      <HeaderContainer>
        <StyledIcon />
        <Typography variant="h4" component="h1">
          Report Management
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

      <TabsContainer>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Reports" />
          <Tab label="Pending" />
          <Tab label="Reviewed" />
          <Tab label="Resolved" />
        </Tabs>
      </TabsContainer>

      {!error && reports.length === 0 ? (
        <EmptyContainer>
          <Typography variant="h6">
            No reports found
          </Typography>
          <Typography variant="body1" color="textSecondary" style={{ marginTop: 8 }}>
            There are no reports in this category
          </Typography>
        </EmptyContainer>
      ) : (
        <>
          <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
            Total reports: {reports.length}
          </Typography>
          
          {reports.map(report => (
            <ReportVideoCard 
              key={report.id} 
              report={report} 
              isAdmin={true}
              onStatusChange={handleStatusChange}
            />
          ))}
        </>
      )}
    </AdminReportsContainer>
  );
};

const AdminReportsContainer = styled.div`
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

const StyledIcon = styled(SupervisorAccountIcon)`
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

const TabsContainer = styled(Paper)`
  margin-bottom: 24px;
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

export default AdminReportsPage; 