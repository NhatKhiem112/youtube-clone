import AccountBoxOutlinedIcon from '@material-ui/icons/AccountBoxOutlined'
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'
import SupervisorAccountOutlinedIcon from '@material-ui/icons/SupervisorAccountOutlined'
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined'
import Brightness2OutlinedIcon from '@material-ui/icons/Brightness2Outlined'
import TranslateOutlinedIcon from '@material-ui/icons/TranslateOutlined'
import LanguageOutlinedIcon from '@material-ui/icons/LanguageOutlined'
import SecurityOutlinedIcon from '@material-ui/icons/SecurityOutlined'
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined'
import FeedbackOutlinedIcon from '@material-ui/icons/FeedbackOutlined'
import KeyboardOutlinedIcon from '@material-ui/icons/KeyboardOutlined'
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined'
import PersonOutlineIcon from '@material-ui/icons/PersonOutline'
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

// Define menu items for authenticated users
export const getAuthenticatedMenuArray = (logoutHandler) => [
  { Icon: AccountBoxOutlinedIcon, text: 'Your channel' },
  { Icon: VideoLibraryIcon, text: 'Your videos', route: '/my-videos' },
  { Icon: CloudUploadIcon, text: 'Upload video', route: '/upload' },
  { Icon: MonetizationOnOutlinedIcon, text: 'Purchase and memberships' },
  { Icon: SettingsOutlinedIcon, text: 'YouTube Studio' },
  { Icon: SupervisorAccountOutlinedIcon, text: 'Switch account', arrow: true },
  {
    Icon: ExitToAppOutlinedIcon,
    text: 'Sign out',
    onClick: (e) => {
      if (e) e.preventDefault();
      e.stopPropagation();
      console.log("⚡ DIRECT Sign out clicked");
      
      // Thực hiện ngay việc xóa localStorage
      localStorage.clear();
      localStorage.removeItem('user');
      console.log("⚡ LocalStorage cleared immediately");
      
      // Thực hiện callback từ props
      if (logoutHandler) {
        try {
          console.log("⚡ Calling provided logoutHandler");
          logoutHandler(e);
        } catch (error) {
          console.error("⚡ Error in logoutHandler:", error);
        }
      }
      
      // LUÔN thực hiện việc đăng xuất khẩn cấp
      console.log("⚡ Executing emergency logout");
      try {
        // Xóa mọi dữ liệu
        localStorage.clear();
        sessionStorage.clear();
        console.log("⚡ All storage cleared in emergency logout");
        
        // Xóa cookies
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Làm mới trang
        console.log("⚡ Force reload page");
        window.location.href = '/';
        setTimeout(() => window.location.reload(true), 100);
      } catch (error) {
        console.error("⚡ Critical error in emergency logout:", error);
        // Phương án cuối cùng
        window.location.replace('/');
      }
    }
  },
  {
    Icon: Brightness2OutlinedIcon,
    text: 'Appearance: Device theme',
    arrow: true,
  },
  { Icon: TranslateOutlinedIcon, text: 'Language: English', arrow: true },
  { Icon: LanguageOutlinedIcon, text: 'Location: United Kingdom', arrow: true },
  { Icon: SettingsOutlinedIcon, text: 'Settings' },
  { Icon: SecurityOutlinedIcon, text: 'Your data in YouTube' },
  { Icon: HelpOutlineOutlinedIcon, text: 'Help' },
  { Icon: FeedbackOutlinedIcon, text: 'Send feedback' },
  { Icon: KeyboardOutlinedIcon, text: 'Keyboard shortcuts' },
];

// Define menu items for unauthenticated users
export const getUnauthenticatedMenuArray = () => [
  {
    Icon: PersonOutlineIcon,
    text: 'Sign in',
    route: '/login'
  },
  {
    Icon: PersonAddOutlinedIcon,
    text: 'Register',
    route: '/register'
  },
  {
    Icon: Brightness2OutlinedIcon,
    text: 'Appearance: Device theme',
    arrow: true,
  },
  { Icon: TranslateOutlinedIcon, text: 'Language: English', arrow: true },
  { Icon: LanguageOutlinedIcon, text: 'Location: United Kingdom', arrow: true },
  { Icon: SettingsOutlinedIcon, text: 'Settings' },
  { Icon: HelpOutlineOutlinedIcon, text: 'Help' },
  { Icon: FeedbackOutlinedIcon, text: 'Send feedback' },
  { Icon: KeyboardOutlinedIcon, text: 'Keyboard shortcuts' },
];

// For backward compatibility
export const menuArray = getAuthenticatedMenuArray();
