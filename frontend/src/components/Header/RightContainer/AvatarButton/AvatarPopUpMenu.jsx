import React, { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import Popover from '@material-ui/core/Popover'
import Divider from '@material-ui/core/Divider'
import { AvatarAccountInfo } from './AvatarAccountInfo'
import { AvatarMenuTop } from './AvatarMenuTop'
import { AvatarMenuMiddle } from './AvatarMenuMiddle'
import { AvatarMenuBottom } from './AvatarMenuBottom'
import { useAuth } from '../../../../context/AuthContext'

export function AvatarPopUpMenu({ anchorAvatarButton, handleAvatarMenuClose, isLoggedIn }) {
  // Sử dụng props isLoggedIn làm nguồn chính xác nhất
  const { currentUser } = useAuth();
  
  // Kiểm tra trạng thái đăng nhập cục bộ (chỉ cho debugging)
  React.useEffect(() => {
    const userInStorage = !!localStorage.getItem('user');
    console.log(`PopUpMenu - Login status: Props=${isLoggedIn}, Storage=${userInStorage}`);
    
    // Nếu localStorage có user nhưng isLoggedIn là false, có thể cần xóa localStorage
    if (userInStorage && !isLoggedIn) {
      console.warn("⚠️ Inconsistent login state detected - localStorage has user but isLoggedIn is false");
    }
  }, [isLoggedIn]);

  return (
    <StyledAvatarMenu
      anchorEl={anchorAvatarButton}
      open={Boolean(anchorAvatarButton)}
      onClose={handleAvatarMenuClose}
    >
      {isLoggedIn ? (
        <>
          <AvatarAccountInfo onClick={handleAvatarMenuClose} user={currentUser} />
          <Divider />
          <AvatarMenuTop onClick={handleAvatarMenuClose} />
          <Divider />
          <AvatarMenuMiddle onClick={handleAvatarMenuClose} />
          <Divider />
          <AvatarMenuBottom onClick={handleAvatarMenuClose} />
        </>
      ) : (
        <>
          <AvatarMenuTop onClick={handleAvatarMenuClose} isUnauthenticated={true} />
          <Divider />
          <AvatarMenuBottom onClick={handleAvatarMenuClose} />
        </>
      )}
    </StyledAvatarMenu>
  )
}
const StyledAvatarMenu = styled(({ className, ...props }) => (
  <Popover
    {...props}
    classes={{ paper: className }}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    marginThreshold={0}
    transitionDuration={0}
    getContentAnchorEl={null}
    PaperProps={{ square: true }}
    elevation={0}
  />
))`
  border: 1px solid #d3d4d5;
  border-top: 0;
  border-radius: 0;
  // not sure how to set the height to avoid Popover snapping to the top of window when the screen size is small
  width: 300px;
  opacity: 1;
  z-index: 1300;

  .MuiTypography-body1 {
    font-size: 14px;
  }
`
