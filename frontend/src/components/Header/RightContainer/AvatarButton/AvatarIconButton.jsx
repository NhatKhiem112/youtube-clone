import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components/macro'
import IconButton from '@material-ui/core/IconButton'
import Avatar from '@material-ui/core/Avatar'
import { useAuth } from '../../../../context/AuthContext'
import { TWO_COL_MIN_WIDTH } from '../../../../utils/utils'
import { useMediaQuery } from '@material-ui/core';

// Debug logging
const DEBUG = true;
const logAvatar = (...args) => DEBUG && console.log('%c[AVATAR-ICON]', 'background: #6a0dad; color: #fff', ...args);

const AvatarIconButton = ({ setAnchorAvatarButton, isLoggedIn }) => {
  const history = useHistory();
  const { currentUser } = useAuth();
  const [loggedInState, setLoggedInState] = useState(isLoggedIn);
  const isTwoColumnLayout = useMediaQuery(`(min-width:${TWO_COL_MIN_WIDTH}px)`);

  logAvatar(`Rendering with isLoggedIn=${isLoggedIn}, loggedInState=${loggedInState}`);

  const handleStorageChange = useCallback(() => {
    logAvatar('Storage change event detected');
    const userData = localStorage.getItem('user');
    const newLoggedInState = !!userData;
    
    if (newLoggedInState !== loggedInState) {
      logAvatar(`Login state changed: ${loggedInState} -> ${newLoggedInState}`);
      setLoggedInState(newLoggedInState);
    }
  }, [loggedInState]);

  const handleLogoutEvent = useCallback(() => {
    logAvatar('Logout event detected');
    setLoggedInState(false);
  }, []);

  useEffect(() => {
    logAvatar('Adding event listeners for storage and logout');
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogoutEvent);
    
    return () => {
      logAvatar('Removing event listeners');
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, [handleStorageChange, handleLogoutEvent]);

  useEffect(() => {
    logAvatar(`isLoggedIn prop changed: ${isLoggedIn}`);
    setLoggedInState(isLoggedIn);
  }, [isLoggedIn]);

  const handleClick = (event) => {
    logAvatar(`Avatar clicked, loggedInState=${loggedInState}`);
    
    if (loggedInState) {
      setAnchorAvatarButton(event.currentTarget);
    } else {
      logAvatar('User not logged in, redirecting to login page');
      history.push('/login');
    }
  }

  const getInitials = () => {
    // Chỉ lấy chữ cái đầu của username
    if (loggedInState && currentUser && currentUser.username) {
      return currentUser.username.charAt(0).toUpperCase();
    }
    // Mặc định nếu chưa đăng nhập
    return '?';
  }

  const imgSrc = loggedInState && currentUser && currentUser.imageUrl ? currentUser.imageUrl : null;

  return (
    <StyledIconButton
      aria-label={loggedInState ? 'account of current user' : 'sign in'}
      aria-controls='menu-appbar'
      aria-haspopup='true'
      onClick={handleClick}
      color='inherit'
    >
      <StyledAvatar alt={loggedInState ? currentUser?.username : 'Sign in'} src={imgSrc}>
        {!imgSrc && getInitials()}
      </StyledAvatar>
    </StyledIconButton>
  )
}

AvatarIconButton.propTypes = {
  setAnchorAvatarButton: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
};

AvatarIconButton.defaultProps = {
  isLoggedIn: false,
};

export default AvatarIconButton

const StyledIconButton = styled(IconButton)`
  && {
    border: 1px solid #3ea6ff;
    color: #3ea6ff;
    border-radius: 2px;
    text-transform: none;
    padding: 5px 11px;
    font-size: 14px;
    font-weight: 500;
    
    &:hover {
      background-color: rgba(62, 166, 255, 0.1);
    }
    
    .MuiButton-startIcon {
      margin-right: 6px;
    }
    
    .MuiSvgIcon-root {
      font-size: 20px;
    }
  }
`;

const StyledAvatar = styled(Avatar)`
  && {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
    background-color: #ef6c00;
    color: white;
    
    @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
      width: 32px;
      height: 32px;
    }
  }
`
