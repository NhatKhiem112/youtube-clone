import React from 'react'
import styled from 'styled-components/macro'
import IconButton from '@material-ui/core/IconButton'
import Avatar from '@material-ui/core/Avatar'
import { useAuth } from '../../../../context/AuthContext'
import { TWO_COL_MIN_WIDTH } from '../../../../utils/utils'

const AvatarIconButton = ({ setAnchorAvatarButton, isLoggedIn }) => {
  // Lấy thông tin từ context nhưng ưu tiên prop isLoggedIn (nếu có)
  const { currentUser } = useAuth();

  const handleClick = (event) => {
    // Đảm bảo chỉ mở menu khi đăng nhập
    if (isLoggedIn) {
      setAnchorAvatarButton(event.currentTarget);
    } else {
      // Nếu chưa đăng nhập, dẫn đến trang login
      window.location.href = '/login';
    }
  }

  const getInitials = () => {
    // Chỉ lấy chữ cái đầu của username
    if (isLoggedIn && currentUser && currentUser.username) {
      return currentUser.username.charAt(0).toUpperCase();
    }
    // Mặc định nếu chưa đăng nhập
    return '?';
  }

  const imgSrc = isLoggedIn && currentUser && currentUser.imageUrl ? currentUser.imageUrl : null;

  return (
    <StyledIconButton
      aria-label={isLoggedIn ? 'account of current user' : 'sign in'}
      aria-controls='menu-appbar'
      aria-haspopup='true'
      onClick={handleClick}
      color='inherit'
    >
      <StyledAvatar alt={isLoggedIn ? currentUser?.username : 'Sign in'} src={imgSrc}>
        {!imgSrc && getInitials()}
      </StyledAvatar>
    </StyledIconButton>
  )
}

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
