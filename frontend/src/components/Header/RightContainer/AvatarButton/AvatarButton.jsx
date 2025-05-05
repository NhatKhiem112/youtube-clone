import React, { useState, useEffect, useCallback } from 'react'
import AvatarIconButton from './AvatarIconButton'
import AvatarMenu from './AvatarMenu'
import { useAuth } from '../../../../context/AuthContext'

const AvatarButton = () => {
  const [anchorAvatarButton, setAnchorAvatarButton] = useState(null)
  const { isLoggedIn, currentUser } = useAuth();
  
  // Trạng thái đăng nhập thực
  const [actualLoginStatus, setActualLoginStatus] = useState(() => {
    return !!localStorage.getItem('user') && !!currentUser && isLoggedIn;
  });
  
  // Kiểm tra trạng thái đăng nhập
  const checkLoginStatus = useCallback(() => {
    const storageStatus = !!localStorage.getItem('user');
    const contextStatus = !!currentUser;
    const isLoggedInStatus = isLoggedIn;
    
    // Nếu có sự khác biệt giữa các cách kiểm tra, ưu tiên trạng thái chưa đăng nhập
    const loginStatus = storageStatus && contextStatus && isLoggedInStatus;
    
    if (actualLoginStatus !== loginStatus) {
      console.log(`Login status changed: ${actualLoginStatus} -> ${loginStatus}`);
      setActualLoginStatus(loginStatus);
    }
  }, [actualLoginStatus, currentUser, isLoggedIn]);
  
  // Kiểm tra khi localStorage thay đổi
  useEffect(() => {
    const handleStorageChange = () => {
      console.log("Storage changed, checking login status");
      checkLoginStatus();
    };
    
    // Kiểm tra khi có sự kiện đăng xuất
    const handleLogout = () => {
      console.log("Logout event detected, forcefully setting login status to false");
      setActualLoginStatus(false);
      setAnchorAvatarButton(null);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogout);
    
    // Kiểm tra định kỳ
    const intervalId = setInterval(checkLoginStatus, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogout);
      clearInterval(intervalId);
    };
  }, [checkLoginStatus]);
  
  // Cập nhật khi context thay đổi
  useEffect(() => {
    checkLoginStatus();
  }, [isLoggedIn, currentUser, checkLoginStatus]);

  const handleAvatarMenuClose = () => {
    setAnchorAvatarButton(null)
  }

  return (
    <>
      <AvatarIconButton 
        setAnchorAvatarButton={setAnchorAvatarButton}
        isLoggedIn={actualLoginStatus} 
      />
      <AvatarMenu 
        anchorAvatarButton={anchorAvatarButton} 
        handleAvatarMenuClose={handleAvatarMenuClose}
        isLoggedIn={actualLoginStatus}
      />
    </>
  )
}

export default AvatarButton
