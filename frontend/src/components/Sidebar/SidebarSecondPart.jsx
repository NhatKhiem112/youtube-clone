import React, { useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import { ShowMoreRow } from './ShowMoreRow'
import { ShowLessRow } from './ShowLessRow'
import { isSidebarDrawerOpenAtom } from '../../store'
import { useAtom } from 'jotai'
import subscriptionService from '../../services/subscription.service'
import AuthService from '../../services/auth.service'
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive'
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff'

const SubHeading = styled(Typography)`
  && {
    font-size: 14px;
    font-weight: 500;
    padding: 8px 24px;
    color: #606060;
  }
`

const SidebarMenuItem = styled(MenuItem)`
  && {
    padding: 0 24px;
  }

  .MuiListItemIcon-root {
    margin-right: 24px;
    color: rgb(3, 3, 3);
  }
  .MuiTypography-body1 {
    font-size: 14px;
    color: #030303;
  }
`

const StyledSubHeading = styled(SubHeading)`
  && {
    color: #cc0000;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
`

const SubscriptionsSection = styled.div`
  position: relative;
  padding: 8px 0;
  margin: 8px 0;
  background: linear-gradient(to bottom, rgba(239, 239, 239, 0.3), transparent);
  border-radius: 8px;
`

const StyledSidebarMenuItem = styled(SidebarMenuItem)`
  && {
    border-left: 3px solid transparent;
    transition: all 0.2s ease;
    margin: 4px 0;
    position: relative;
    overflow: hidden;
    border-radius: 0 8px 8px 0;
    
    &:hover {
      background-color: rgba(204, 0, 0, 0.05);
      border-left-color: #cc0000;
    }
    
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, rgba(204, 0, 0, 0.1), transparent);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: -1;
    }
    
    &:hover:before {
      transform: translateX(0);
    }
  }
`

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`

const StyledListItemAvatar = styled(ListItemAvatar)`
  && {
    min-width: 0;
    margin-right: 24px;
  }
`

const StyledAvatar = styled(Avatar)`
  && {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
    background-color: #ef6c00;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    
    ${StyledSidebarMenuItem}:hover & {
      transform: scale(1.1);
      border-color: #cc0000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
`

const StyledListItemText = styled(ListItemText)`
  && {
    .MuiTypography-body1 {
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s ease;
    }
    
    ${StyledSidebarMenuItem}:hover .MuiTypography-body1 {
      color: #cc0000;
      font-weight: 500;
    }
  }
`

const NotificationIcon = styled.span`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #cc0000;
  opacity: 0.7;
  
  ${StyledSidebarMenuItem}:hover & {
    opacity: 1;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0;
`

const EmptyMessage = styled.div`
  padding: 0 24px 16px;
  font-size: 14px;
  color: #606060;
  font-style: italic;
  text-align: center;
  margin-top: 8px;
`

const SubscriptionItem = ({ channel }) => {
  const [, setIsSidebarDrawerOpen] = useAtom(isSidebarDrawerOpenAtom)
  
  return (
    <StyledLink to={`/channel/${channel.id}`} onClick={() => setIsSidebarDrawerOpen(false)}>
      <StyledSidebarMenuItem>
        <StyledListItemAvatar>
          <StyledAvatar src={channel.profileImageUrl || ""} alt={channel.username}>
            {!channel.profileImageUrl && channel.username ? channel.username.charAt(0).toUpperCase() : "C"}
          </StyledAvatar>
        </StyledListItemAvatar>
        <StyledListItemText primary={channel.username} />
        {channel.notificationEnabled && (
          <NotificationIcon>
            <NotificationsActiveIcon fontSize="small" />
          </NotificationIcon>
        )}
      </StyledSidebarMenuItem>
    </StyledLink>
  )
}

export const SidebarSecondPart = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (currentUser) {
      setIsLoggedIn(true)
      loadSubscriptions()
    } else {
      setLoading(false)
    }
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await subscriptionService.getMySubscriptions()
      setSubscriptions(response.data || [])
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const expandMenu = () => {
    setIsExpanded(true)
  }
  
  const collapseMenu = () => {
    setIsExpanded(false)
  }
  
  const displayedItems = isExpanded 
    ? subscriptions 
    : subscriptions.slice(0, 3)
  
  const hasMoreItems = subscriptions.length > 3

  return (
    <SubscriptionsSection>
      <StyledSubHeading>SUBSCRIPTIONS</StyledSubHeading>
      
      {loading ? (
        <LoadingContainer>
          <CircularProgress size={20} />
        </LoadingContainer>
      ) : subscriptions.length > 0 ? (
        <>
          {displayedItems.map((subscription) => (
            <SubscriptionItem 
              key={subscription.id} 
              channel={subscription} 
            />
          ))}
          
          {hasMoreItems && (
            isExpanded ? (
              <ShowLessRow onClick={collapseMenu} />
            ) : (
              <ShowMoreRow onClick={expandMenu} />
            )
          )}
        </>
      ) : (
        <EmptyMessage>No subscriptions yet</EmptyMessage>
      )}
    </SubscriptionsSection>
  )
}
