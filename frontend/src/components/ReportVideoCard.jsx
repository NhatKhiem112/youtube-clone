import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Tooltip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import FlagIcon from '@material-ui/icons/Flag';
import { format, isValid, parseISO } from 'date-fns';

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    overflow: 'hidden'
  },
  thumbnail: {
    height: 160,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    cursor: 'pointer',
    backgroundColor: theme.palette.grey[200],
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    color: theme.palette.grey[500],
    fontStyle: 'italic'
  },
  reportBadge: {
    position: 'absolute',
    top: theme.spacing(1),
    left: theme.spacing(1),
    backgroundColor: theme.palette.error.main,
    color: 'white',
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1),
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    fontWeight: 'bold',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  chipPending: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    fontSize: '0.75rem',
    marginRight: theme.spacing(1)
  },
  chipReviewed: {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    fontSize: '0.75rem',
    marginRight: theme.spacing(1)
  },
  chipResolved: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.spacing(1),
    fontSize: '0.75rem',
    marginRight: theme.spacing(1)
  }
}));

const ReportVideoCard = ({ report, isAdmin = false, onStatusChange }) => {
  const classes = useStyles();
  const history = useHistory();
  const { videoId, title, channelTitle, thumbnailUrl, reason, description, createdAt, status } = report;

  const handleVideoClick = () => {
    history.push(`/watch/${videoId}`);
  };

  const handleStatusChange = (newStatus) => {
    if (onStatusChange && isAdmin) {
      onStatusChange(report.id, newStatus);
    }
  };

  const formattedDate = () => {
    try {
      if (!createdAt) return '';
      
      // Log the date value for debugging
      console.log('Date value for formatting:', createdAt);
      
      // Try to parse ISO date string
      const dateObj = typeof createdAt === 'string' ? parseISO(createdAt) : new Date(createdAt);
      
      // Check if date is valid using date-fns isValid
      if (!isValid(dateObj)) {
        console.error('Invalid date:', createdAt);
        return 'Invalid date';
      }
      
      return format(dateObj, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  // Debug output to see what data is coming in
  console.log('Report data:', report);

  const getStatusChipClass = (status) => {
    switch(status?.toUpperCase()) {
      case 'PENDING':
        return classes.chipPending;
      case 'REVIEWED':
        return classes.chipReviewed;
      case 'RESOLVED':
        return classes.chipResolved;
      default:
        return classes.chipPending;
    }
  };

  // Check if report contains required data
  if (!report || Object.keys(report).length === 0) {
    console.error('Empty or invalid report data:', report);
    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography color="error">
            Error: Could not load report data
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={classes.card}>
      <Grid container>
        <Grid item xs={12} sm={4} md={3}>
          <Box 
            className={classes.thumbnail}
            style={thumbnailUrl ? 
              { backgroundImage: `url(${thumbnailUrl})` } : 
              { backgroundImage: 'none' }
            }
            onClick={handleVideoClick}
          >
            {!thumbnailUrl && (
              <Typography variant="body2" className={classes.placeholderText}>
                No thumbnail available
              </Typography>
            )}
            <Box className={classes.reportBadge}>
              <FlagIcon fontSize="small" style={{ marginRight: 4 }} />
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                REPORTED
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={8} md={9}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography 
                  variant="subtitle1" 
                  className={classes.title}
                  onClick={handleVideoClick}
                >
                  {title || 'Untitled Report'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {channelTitle || 'Unknown Channel'}
                </Typography>
                
                <Box display="flex" alignItems="center" mt={1} mb={2}>
                  <span className={getStatusChipClass(status || 'PENDING')}>
                    {status || 'PENDING'}
                  </span>
                  <Typography variant="caption" color="textSecondary">
                    Reported on {formattedDate()}
                  </Typography>
                </Box>

                <Typography variant="body2" style={{ fontWeight: 500 }} gutterBottom>
                  Reason: {reason || 'No reason provided'}
                </Typography>
                
                {description && (
                  <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                    {description}
                  </Typography>
                )}
              </Box>
              
              {isAdmin && (
                <Box>
                  <Tooltip title="Mark as Reviewed">
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="primary"
                      disabled={status === 'REVIEWED' || status === 'RESOLVED'}
                      onClick={() => handleStatusChange('REVIEWED')}
                      style={{ marginRight: 8 }}
                    >
                      Review
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Mark as Resolved">
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="primary"
                      disabled={status === 'RESOLVED'}
                      onClick={() => handleStatusChange('RESOLVED')}
                    >
                      Resolve
                    </Button>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ReportVideoCard; 