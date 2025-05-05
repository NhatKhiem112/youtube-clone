import { getAuthenticatedMenuArray, getUnauthenticatedMenuArray } from './avatarMenuData';
import { MenuRow } from './MenuRow'
import { useAuth } from '../../../../context/AuthContext';
import { useHistory } from 'react-router-dom';

export const AvatarMenuTop = ({ onClick, isUnauthenticated }) => {
  const { logout } = useAuth();
  const history = useHistory();

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    console.log("🔴 Logout button clicked in AvatarMenuTop");
    
    // Đóng menu trước
    if (onClick) {
      console.log("🔴 Closing menu");
      onClick();
    }
    
    try {
      // Gọi hàm logout từ context
      console.log("🔴 Calling logout function");
      logout();
      
      // Nếu vì lý do nào đó logout từ context không hoạt động,
      // sử dụng phương án dự phòng này
      setTimeout(() => {
        if (localStorage.getItem('user')) {
          console.log("🔴 Fallback: direct logout after timeout");
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          window.location.replace('/');
        }
      }, 1000);
    } catch (error) {
      console.error("🔴 Error during logout:", error);
      // Phương án cuối cùng
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      window.location.reload();
    }
  };

  const handleNavigation = (route) => {
    if (onClick) onClick();
    history.push(route);
  };

  if (isUnauthenticated) {
    const menuItems = getUnauthenticatedMenuArray();
    return menuItems.slice(0, 2).map(({ Icon, text, route }) => {
      return (
        <MenuRow
          key={text}
          Icon={Icon}
          text={text}
          onClick={() => handleNavigation(route)}
        />
      );
    });
  }

  const menuItems = getAuthenticatedMenuArray(handleLogout);
  return menuItems.slice(0, 5).map(({ Icon, text, arrow, onClick: itemOnClick }) => {
    const handleClick = itemOnClick || onClick;
    return <MenuRow key={text} {...{ Icon, text, arrow, onClick: handleClick }} />;
  });
};
