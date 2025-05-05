import React, { useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import Avatar from '@material-ui/core/Avatar'
import { FooterIcons as MiniSidebarIcons } from '../Footer/FooterIcons'
import { MINI_SIDEBAR_WIDTH, DESKTOP_VIEW_HEADER_HEIGHT } from '../../utils/utils'
import subscriptionService from '../../services/subscription.service'
import AuthService from '../../services/auth.service'

const MiniSidebar = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setIsLoggedIn(true);
      loadSubscriptions();
    }
    
    // Lấy đường dẫn hiện tại để highlight menu item
    const path = window.location.pathname;
    if (path.includes('/your-videos')) {
      setActiveItem('Your videos');
    } else if (path.includes('/subscriptions')) {
      setActiveItem('Subscriptions');
    } else if (path.includes('/watch-history')) {
      setActiveItem('History');
    } else if (path === '/') {
      setActiveItem('Home');
    }
  }, []);
  
  const loadSubscriptions = async () => {
    try {
      const response = await subscriptionService.getMySubscriptions();
      setSubscriptions(response.data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };
  
  return (
    <MiniSidebarContainer>
      <div className="inner_container">
        <MiniSidebarIcons activeItem={activeItem} />
        
        {isLoggedIn && subscriptions.length > 0 && (
          <SubscriptionsContainer>
            {subscriptions.slice(0, 5).map(channel => (
              <SubscriptionLink key={channel.id} to={`/channel/${channel.id}`}>
                <ChannelAvatar 
                  src={channel.profileImageUrl}
                  alt={channel.username}
                >
                  {!channel.profileImageUrl && channel.username.charAt(0).toUpperCase()}
                </ChannelAvatar>
                <ChannelName>{channel.username}</ChannelName>
              </SubscriptionLink>
            ))}
          </SubscriptionsContainer>
        )}
      </div>
    </MiniSidebarContainer>
  )
}

export default MiniSidebar

const MiniSidebarContainer = styled(BottomNavigation)`
  && {
    // to override default height:56px which also mess up flex-box
    height: 100%;
    width: ${MINI_SIDEBAR_WIDTH}px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    position: fixed;
    top: ${DESKTOP_VIEW_HEADER_HEIGHT}px;
    left: 0;
    z-index: 10;
    background-color: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    
    // Sửa không đè lên nội dung
    ~ div {
      margin-left: ${MINI_SIDEBAR_WIDTH}px;
    }
    
    // Tạo hiệu ứng gradient ở cạnh
    &:after {
      content: '';
      position: absolute;
      top: 0;
      right: -5px;
      width: 5px;
      height: 100%;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.05), transparent);
    }
    
    .MuiBottomNavigationAction-label {
      font-size: 10px;
      transition: all 0.3s ease;
    }
    
    // Thêm hiệu ứng hover cho toàn bộ sidebar
    &:hover {
      .MuiBottomNavigationAction-root {
        transition: all 0.3s ease;
      }
    }
  }
`

const SubscriptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:before {
    content: 'Subscriptions';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    padding: 0 8px;
    font-size: 9px;
    color: #606060;
    font-weight: 500;
    text-transform: uppercase;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`

const SubscriptionLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: scale(1.05);
  }
  
  &:after {
    content: '';
    position: absolute;
    left: 4px;
    top: 50%;
    transform: translateY(-50%) scale(0);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #cc0000;
    transition: transform 0.2s ease;
  }
  
  &:hover:after {
    transform: translateY(-50%) scale(1);
  }
`

const ChannelAvatar = styled(Avatar)`
  && {
    width: 24px;
    height: 24px;
    font-size: 12px;
    margin-bottom: 6px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    
    ${SubscriptionLink}:hover & {
      border-color: #cc0000;
      box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
    }
  }
`

const ChannelName = styled.span`
  font-size: 10px;
  text-align: center;
  max-width: 70px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
  
  ${SubscriptionLink}:hover & {
    color: #cc0000;
    font-weight: 500;
  }
`
