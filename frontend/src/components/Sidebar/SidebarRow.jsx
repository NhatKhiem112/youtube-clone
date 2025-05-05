import React, { useState } from 'react'
import { Link, useLocation, useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'
import { TWO_COL_MIN_WIDTH } from '../../utils/utils'
import { Snackbar, Box, Typography, Slide } from '@material-ui/core'
import { SidebarMenuItem } from './FullWidthSidebar'
import { StyledListItemIcon } from '../../utils/utils'
import ListItemText from '@material-ui/core/ListItemText'
import { isSidebarDrawerOpenAtom } from '../../store'
import { useAtom } from 'jotai'

export const SidebarRow = ({ Icon, text, path }) => {
  const location = useLocation()
  const history = useHistory()
  const currentPath = location.pathname
  const isActive = path && currentPath === path
  const [showNotAvailable, setShowNotAvailable] = useState(false)

  // Check if the feature is available based on backend API response status
  const [featureAvailable, setFeatureAvailable] = useState(true);
  
  // Feature availability check - Reports feature is not available
  const isReportFeature = path && (path === '/reports' || path === '/admin/reports' || text === 'Report history');
  
  const handleClick = (event) => {
    if (isReportFeature) {
      event.preventDefault();
      event.stopPropagation();
      setShowNotAvailable(true);
      return false;
    }
  }

  // Use proper component and props based on feature type
  const Component = isReportFeature ? 'div' : Link;
  const componentProps = isReportFeature 
    ? { onClick: handleClick } 
    : { to: path ? path : '/', component: Link };

  return (
    <>
      <StyledElement
        as={Component}
        $isActive={isActive}
        {...componentProps}
      >
        <StyledIcon $isActive={isActive}>
          <Icon />
        </StyledIcon>
        <StyledText $isActive={isActive}>{text}</StyledText>
      </StyledElement>
      
      <Snackbar
        open={showNotAvailable}
        autoHideDuration={4000}
        onClose={() => setShowNotAvailable(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={props => <Slide {...props} direction="up" />}
      >
        <Box bgcolor="#323232" color="white" p={1.5} borderRadius={1}>
          <Typography>Report feature is temporarily unavailable.</Typography>
        </Box>
      </Snackbar>
    </>
  )
}

export const StyledElement = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 20px;
  color: ${({ $isActive }) => ($isActive ? '#f00' : 'rgb(3, 3, 3)')};
  text-decoration: none;
  cursor: pointer;
  background-color: ${({ $isActive }) => ($isActive ? 'rgba(0, 0, 0, 0.1)' : '')};

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    padding: 8px 24px;
  }
`

export const StyledIcon = styled.div`
  margin-right: 24px;
  color: ${({ $isActive }) => ($isActive ? '#f00' : 'rgb(96, 96, 96)')};
`

export const StyledText = styled.span`
  font-size: 14px;
  font-weight: ${({ $isActive }) => ($isActive ? '500' : '400')};
  flex: 1;
`
