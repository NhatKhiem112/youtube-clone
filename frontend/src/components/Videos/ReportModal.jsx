import { useState } from 'react';
import VideoService from '../../services/video.service';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Typography,
    Box,
    Snackbar
} from '@material-ui/core';
import FlagIcon from '@material-ui/icons/Flag';

const reportReasons = [
    'Sexual content',
    'Violent or repulsive content',
    'Hateful or abusive content',
    'Harmful or dangerous acts',
    'Child abuse',
    'Promotes terrorism',
    'Spam or misleading',
    'Infringes my rights',
    'Other'
];

const ReportModal = ({ open, onClose, videoData }) => {
    const [reportReason, setReportReason] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!reportReason) {
            setError('Please select a reason for reporting');
            return;
        }

        setLoading(true);
        try {
            await VideoService.reportVideo(videoData, reportReason, additionalInfo);
            setSuccess(true);
            setLoading(false);
            
            // Reset form
            setReportReason('');
            setAdditionalInfo('');
            
            // Close after delay to show success message
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 1500);
        } catch (err) {
            console.error('Error reporting video:', err);
            if (err.response && err.response.status === 409) {
                setError('You have already reported this video');
            } else {
                setError('An error occurred while reporting the video');
            }
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setError('');
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <FlagIcon style={{ color: '#f44336', marginRight: 8 }} />
                        Report Video
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box mb={2} mt={1}>
                        <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                            {videoData?.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {videoData?.channelTitle}
                        </Typography>
                    </Box>
                    
                    <FormControl fullWidth style={{ marginBottom: 24 }}>
                        <InputLabel id="report-reason-label">Reason for reporting</InputLabel>
                        <Select
                            labelId="report-reason-label"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        >
                            {reportReasons.map((reason) => (
                                <MenuItem key={reason} value={reason}>
                                    {reason}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <TextField
                        label="Additional information (optional)"
                        multiline
                        rows={4}
                        fullWidth
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="Please provide any additional details that will help us understand the issue"
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="secondary"
                        disabled={loading || !reportReason}
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </DialogActions>
                
                {success && (
                    <Box p={2} bgcolor="#4caf50" color="white">
                        <Typography>Report submitted successfully</Typography>
                    </Box>
                )}
            </Dialog>
            
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box bgcolor="#f44336" color="white" p={2} borderRadius={1}>
                    <Typography>{error}</Typography>
                </Box>
            </Snackbar>
        </>
    );
};

export default ReportModal; 