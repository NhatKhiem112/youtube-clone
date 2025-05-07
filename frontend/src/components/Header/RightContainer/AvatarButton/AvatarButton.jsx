import React, { useState, useEffect, useCallback } from 'react'
import AvatarIconButton from './AvatarIconButton'
import AvatarMenu from './AvatarMenu'
import { useAuth } from '../../../../context/AuthContext'

// Debug logging
const DEBUG = true;
const logAvatarBtn = (...args) => DEBUG && console.log('%c[AVATAR-BUTTON]', 'background: #009688; color: #fff', ...args);

const AvatarButton = () => {
  const [anchorAvatarButton, setAnchorAvatarButton] = useState(null)
  const { isLoggedIn, currentUser } = useAuth();
  
  // Trạng thái đăng nhập thực
  const [actualLoginStatus, setActualLoginStatus] = useState(() => {
    const initialStatus = !!localStorage.getItem('user') && !!currentUser && isLoggedIn;
    logAvatarBtn(`Khởi tạo với trạng thái đăng nhập: ${initialStatus ? 'đã đăng nhập' : 'chưa đăng nhập'}`);
    return initialStatus;
  });
  
  // Kiểm tra trạng thái đăng nhập - chỉ log khi có thay đổi
  const checkLoginStatus = useCallback(() => {
    const storageStatus = !!localStorage.getItem('user');
    const contextStatus = !!currentUser;
    const isLoggedInStatus = isLoggedIn;
    
    // Nếu có sự khác biệt giữa các cách kiểm tra, ưu tiên trạng thái chưa đăng nhập
    const loginStatus = storageStatus && contextStatus && isLoggedInStatus;
    
    if (actualLoginStatus !== loginStatus) {
      logAvatarBtn(`Kiểm tra đăng nhập: localStorage=${storageStatus}, context=${contextStatus}, isLoggedIn=${isLoggedInStatus}`);
      logAvatarBtn(`Trạng thái đăng nhập thay đổi: ${actualLoginStatus} -> ${loginStatus}`);
      setActualLoginStatus(loginStatus);
    }
  }, [actualLoginStatus, currentUser, isLoggedIn]);
  
  // Thiết lập event listeners và kiểm tra lần đầu
  useEffect(() => {
    logAvatarBtn('Thiết lập event listeners');
    
    const handleStorageChange = () => {
      logAvatarBtn("Phát hiện sự kiện storage thay đổi");
      checkLoginStatus();
    };
    
    // Kiểm tra khi có sự kiện đăng xuất
    const handleLogout = () => {
      logAvatarBtn("Phát hiện sự kiện đăng xuất, cập nhật trạng thái");
      setActualLoginStatus(false);
      setAnchorAvatarButton(null);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogout);
    
    // Kiểm tra lần đầu
    checkLoginStatus();
    
    return () => {
      logAvatarBtn('Dọn dẹp event listeners');
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogout);
    };
  }, [checkLoginStatus]);
  
  // Cập nhật khi context thay đổi
  useEffect(() => {
    checkLoginStatus();
  }, [isLoggedIn, currentUser, checkLoginStatus]);

  const handleAvatarMenuClose = () => {
    logAvatarBtn('Đóng menu avatar');
    setAnchorAvatarButton(null);
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
