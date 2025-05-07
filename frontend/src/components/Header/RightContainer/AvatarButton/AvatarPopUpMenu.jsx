import React, { useEffect, useState, useCallback, useRef } from 'react'
import styled from 'styled-components/macro'
import Popover from '@material-ui/core/Popover'
import Divider from '@material-ui/core/Divider'
import { AvatarAccountInfo } from './AvatarAccountInfo'
import { AvatarMenuTop } from './AvatarMenuTop'
import { AvatarMenuMiddle } from './AvatarMenuMiddle'
import { AvatarMenuBottom } from './AvatarMenuBottom'
import { useAuth } from '../../../../context/AuthContext'
import avatarMenuData from './avatarMenuData'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import Menu from '@material-ui/core/Menu'

// Debug logging
const DEBUG = true;
const logPopup = (...args) => DEBUG && console.log('%c[AVATAR-POPUP]', 'background: #e91e63; color: #fff', ...args);

export function AvatarPopUpMenu({ anchorAvatarButton, handleAvatarMenuClose, isLoggedIn }) {
  const history = useHistory();
  const { logout, currentUser } = useAuth();
  const isLoggedInProp = isLoggedIn;
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(isLoggedIn);
  const checkIntervalRef = useRef(null);

  logPopup(`Rendering popup menu: isLoggedInProp=${isLoggedInProp}, localIsLoggedIn=${localIsLoggedIn}, currentUser=${currentUser ? 'exists' : 'null'}`);

  // Kiểm tra trạng thái đăng nhập cục bộ (chỉ cho debugging)
  React.useEffect(() => {
    const userInStorage = !!localStorage.getItem('user');
    console.log(`PopUpMenu - Login status: Props=${isLoggedIn}, Storage=${userInStorage}`);
    
    // Nếu localStorage có user nhưng isLoggedIn là false, có thể cần xóa localStorage
    if (userInStorage && !isLoggedIn) {
      console.warn("⚠️ Inconsistent login state detected - localStorage has user but isLoggedIn is false");
    }
  }, [isLoggedIn]);

  // Kiểm tra trạng thái đăng nhập từ nhiều nguồn
  const checkLoginStatus = useCallback(() => {
    logPopup('Checking login status from multiple sources');
    const userInStorage = !!localStorage.getItem('user');
    const userInContext = !!currentUser;
    const previousState = localIsLoggedIn;
    
    // Nếu có sự khác biệt, ưu tiên trạng thái từ localStorage
    if (userInStorage !== previousState) {
      logPopup(`Login status mismatch: localStorage=${userInStorage}, context=${userInContext}, current=${previousState}`);
      setLocalIsLoggedIn(userInStorage);
    }
  }, [currentUser, localIsLoggedIn]);

  // Lắng nghe sự kiện storage và logout
  useEffect(() => {
    logPopup('Setting up event listeners for storage and logout');
    
    const handleStorageChange = () => {
      logPopup('Storage event detected, checking login status');
      checkLoginStatus();
    };
    
    const handleLogoutEvent = () => {
      logPopup('Logout event detected, updating local state');
      setLocalIsLoggedIn(false);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogoutEvent);
    
    // Kiểm tra định kỳ mỗi 5 giây
    checkIntervalRef.current = setInterval(() => {
      const inStorage = !!localStorage.getItem('user');
      if (inStorage !== localIsLoggedIn) {
        logPopup(`Periodic check found login state change: ${localIsLoggedIn} -> ${inStorage}`);
        setLocalIsLoggedIn(inStorage);
      }
    }, 5000);
    
    return () => {
      logPopup('Cleaning up event listeners and interval');
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogoutEvent);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkLoginStatus, localIsLoggedIn]);

  // Cập nhật từ props isLoggedIn
  useEffect(() => {
    logPopup(`isLoggedIn prop changed: ${isLoggedInProp}`);
    setLocalIsLoggedIn(isLoggedInProp);
  }, [isLoggedInProp]);

  const isMenuOpen = Boolean(anchorAvatarButton);
  logPopup(`Menu open state: ${isMenuOpen}`);

  // Xử lý đóng menu
  const handleMenuClose = () => {
    logPopup('Closing menu');
    handleAvatarMenuClose(null);
  };

  // Xử lý click vào các mục menu
  const handleMenuItemClick = (item) => {
    logPopup(`Menu item clicked: ${item.title}`);
    
    if (item.onClick) {
      // Gọi hàm xử lý riêng nếu có
      item.onClick({ history, logout });
    } else if (item.path) {
      // Điều hướng đến path
      history.push(item.path);
    }
    
    handleMenuClose();
  };

  // Lấy danh sách menu phù hợp với trạng thái đăng nhập
  const menuItems = avatarMenuData.filter((item) => {
    if (item.requiresAuth && !localIsLoggedIn) return false;
    if (item.noAuth && localIsLoggedIn) return false;
    return true;
  });

  logPopup(`Filtered menu items: ${menuItems.length} items`);

  return (
    <StyledMenu
      id="avatar-menu"
      anchorEl={anchorAvatarButton}
      keepMounted
      open={isMenuOpen}
      onClose={handleMenuClose}
      getContentAnchorEl={null}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {menuItems.map((item) => (
        <StyledMenuItem
          key={item.id}
          onClick={() => handleMenuItemClick(item)}
          divider={item.divider}
        >
          {item.icon && <MenuItemIcon>{item.icon}</MenuItemIcon>}
          <MenuItemText>{item.title}</MenuItemText>
        </StyledMenuItem>
      ))}
    </StyledMenu>
  )
}

AvatarPopUpMenu.propTypes = {
  anchorAvatarButton: PropTypes.any,
  handleAvatarMenuClose: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
};

AvatarPopUpMenu.defaultProps = {
  anchorAvatarButton: null,
  isLoggedIn: false,
};

const StyledMenu = styled(Menu)`
  .MuiMenu-paper {
    width: 220px;
    max-width: 100%;
    background-color: #282828;
    color: white;
  }
`;

const StyledMenuItem = styled.div`
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  align-items: center;
  border-bottom: ${(props) => (props.divider ? '1px solid #383838' : 'none')};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MenuItemIcon = styled.div`
  display: flex;
  margin-right: 16px;
  align-items: center;
  color: #aaa;
`;

const MenuItemText = styled.span`
  font-size: 14px;
`;
