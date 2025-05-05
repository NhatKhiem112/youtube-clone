import React, { useState, useRef } from 'react'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { StyledIconButton } from './VideoCard'
import { useIsMobileView } from '../../utils/utils'
import { MobileModal } from './MobileModal'
import { DesktopPopper } from './DesktopPopper'
import ReportModal from './ReportModal'
import { Snackbar, Box, Typography } from '@material-ui/core'

export const MoreButton = ({ isSearchPage, video }) => {
  const isMobileView = useIsMobileView()
  // states for Modal in mobile view
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleModalClose = () => setIsModalOpen(false)

  // states for popup menu in desktop view
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const anchorRef = useRef(null)

  // state for report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  
  // state for feature not available message
  const [showFeatureNotAvailable, setShowFeatureNotAvailable] = useState(false)

  const handlePopupClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }
    setIsPopupOpen(false)
  }

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault()
      setIsPopupOpen(false)
    }
  }

  // what is triggered onClick depends on the view
  const handleMoreIconClick = () => {
    if (isMobileView) {
      setIsModalOpen(true)
    } else {
      // toggle if desktop view
      setIsPopupOpen((prevOpen) => !prevOpen)
    }
  }

  const handleReportClick = () => {
    // Close the popup or modal
    setIsPopupOpen(false);
    setIsModalOpen(false);
    
    // Show feature not available message instead of opening report modal
    setShowFeatureNotAvailable(true);
    
    // The actual report modal is commented out since the backend API isn't ready
    // setIsReportModalOpen(true);
  };

  // Prepare video data for report modal
  const videoData = video ? {
    videoId: video.id,
    title: video.snippet?.title,
    channelTitle: video.snippet?.channelTitle,
    thumbnailUrl: video.snippet?.thumbnails?.medium?.url
  } : null;

  return (
    <>
      <StyledIconButton disableRipple={true}>
        <MoreVertIcon
          ref={anchorRef}
          onClick={handleMoreIconClick}
          style={{ color: 'rgb(144, 144, 144)' }}
        />

        {/* desktop view popper */}
        <DesktopPopper
          {...{ isPopupOpen, anchorRef, handlePopupClose, handleListKeyDown }}
          onReportClick={handleReportClick}
        />

        {/* mobile view modal */}
        <MobileModal 
          {...{ isModalOpen, handleModalClose, isSearchPage }} 
          onReportClick={handleReportClick}
        />
      </StyledIconButton>

      {/* Feature not available message */}
      <Snackbar
        open={showFeatureNotAvailable}
        autoHideDuration={4000}
        onClose={() => setShowFeatureNotAvailable(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box bgcolor="#323232" color="white" p={1.5} borderRadius={1}>
          <Typography>Report feature is not available yet.</Typography>
        </Box>
      </Snackbar>

      {/* Report modal - commented out until backend is ready */}
      {/* {isReportModalOpen && videoData && (
        <ReportModal
          open={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          videoData={videoData}
        />
      )} */}
    </>
  )
}
