import React from 'react'
import styled from 'styled-components/macro'
import Menu from '@material-ui/core/Menu'
import ListItemText from '@material-ui/core/ListItemText'
import { useHistory } from 'react-router-dom'
import {
  DEFAULT_FONT_SIZE,
  StyledMenuItem,
  StyledListItemIcon,
} from '../../../../utils/utils'
import { createVideoMenuItems } from './createVideoMenuItems'

const CreateVideoMenu = ({ anchorVideoButton, handleVideoMenuClose }) => {
  const history = useHistory()

  const handleMenuItemClick = (text) => {
    handleVideoMenuClose()
    
    if (text === 'Upload video') {
      history.push('/upload')
    } else if (text === 'Go live') {
      // Handle Go live functionality
      console.log('Go live clicked')
    }
  }

  return (
    <VideoMenu
      anchorEl={anchorVideoButton}
      open={Boolean(anchorVideoButton)}
      onClose={handleVideoMenuClose}
    >
      {createVideoMenuItems.map(({ Icon, text }) => {
        return (
          <StyledMenuItem key={text} onClick={() => handleMenuItemClick(text)}>
            <StyledListItemIcon>
              <Icon fontSize="small" />
            </StyledListItemIcon>
            <ListItemText primary={text} />
          </StyledMenuItem>
        )
      })}
    </VideoMenu>
  )
}

export default CreateVideoMenu

const VideoMenu = styled(({ className, ...props }) => (
  <Menu
    {...props}
    classes={{ paper: className }}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'left',
    }}
    PaperProps={{ square: true }}
    transitionDuration={0}
    elevation={0}
  />
))`
  border: 1px solid #d3d4d5;
  border-top: 0;
  /* border-radius: 0; */

  .MuiTypography-body1 {
    font-size: ${DEFAULT_FONT_SIZE}px;
  }
`
