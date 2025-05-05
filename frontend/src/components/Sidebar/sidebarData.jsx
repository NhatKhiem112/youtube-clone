import HomeIcon from '@material-ui/icons/Home'
import ExploreOutlinedIcon from '@material-ui/icons/ExploreOutlined'
import SubscriptionsOutlinedIcon from '@material-ui/icons/SubscriptionsOutlined'
import VideoLibraryOutlinedIcon from '@material-ui/icons/VideoLibraryOutlined'
import HistoryOutlinedIcon from '@material-ui/icons/HistoryOutlined'
import ShopOutlinedIcon from '@material-ui/icons/ShopOutlined'
import QueryBuilderOutlinedIcon from '@material-ui/icons/QueryBuilderOutlined'
import WatchLaterIcon from '@material-ui/icons/WatchLater'
import PlaylistPlayOutlinedIcon from '@material-ui/icons/PlaylistPlayOutlined'
import ExpandMoreOutlinedIcon from '@material-ui/icons/ExpandMoreOutlined'
import YouTubeIcon from '@material-ui/icons/YouTube'
import VideogameAssetOutlinedIcon from '@material-ui/icons/VideogameAssetOutlined'
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna'
import SportsHandballOutlinedIcon from '@material-ui/icons/SportsHandballOutlined'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined'
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined'
import FeedbackOutlinedIcon from '@material-ui/icons/FeedbackOutlined'
import ExpandLessOutlinedIcon from '@material-ui/icons/ExpandLessOutlined'
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined'
import ThumbDownOutlinedIcon from '@material-ui/icons/ThumbDownOutlined'
import ReportIcon from '@material-ui/icons/Report'
import VideoCallOutlinedIcon from '@material-ui/icons/VideoCallOutlined'

export const sideBarShowMore = [
  { Icon: ExpandMoreOutlinedIcon, text: 'Show more' },
]

export const sideBarShowLess = [
  { Icon: ExpandLessOutlinedIcon, text: 'Show less' },
]

export const sideBarMenuRows = [
  { Icon: HomeIcon, text: 'Home' },
  { Icon: ExploreOutlinedIcon, text: 'Explore' },
  { Icon: SubscriptionsOutlinedIcon, text: 'Subscriptions', path: '/subscriptions' },
  { Icon: VideoLibraryOutlinedIcon, text: 'Library' },
  { Icon: HistoryOutlinedIcon, text: 'History', path: '/watch-history' },
  { Icon: ThumbUpOutlinedIcon, text: 'Liked Videos', path: '/liked-videos' },
  { Icon: ThumbDownOutlinedIcon, text: 'Disliked Videos', path: '/disliked-videos' },
  { Icon: WatchLaterIcon, text: 'Watch Later', path: '/watch-later' },
  { Icon: ReportIcon, text: 'Your Reports', path: '/reports' },
  { Icon: VideoCallOutlinedIcon, text: 'Your videos', path: '/your-videos' },
  { Icon: PlaylistPlayOutlinedIcon, text: 'Music' },
]

export const moreFromYouTubeRows = [
  { Icon: YouTubeIcon, text: 'YouTube Premium' },
  { Icon: VideogameAssetOutlinedIcon, text: 'Gaming' },
  { Icon: SettingsInputAntennaIcon, text: 'Live' },
  { Icon: SportsHandballOutlinedIcon, text: 'Sport' },
  { Icon: SettingsOutlinedIcon, text: 'Settings' },
  { Icon: FlagOutlinedIcon, text: 'Report history', path: '/reports' },
  { Icon: HelpOutlineOutlinedIcon, text: 'Help' },
  { Icon: FeedbackOutlinedIcon, text: 'Send feedback' },
]

// mobile footer uses the same array
export const miniSidebarRows = [
  { Icon: HomeIcon, text: 'Home' },
  { Icon: ExploreOutlinedIcon, text: 'Explore' },
  { Icon: SubscriptionsOutlinedIcon, text: 'Subscriptions', path: '/subscriptions' },
  { Icon: VideoCallOutlinedIcon, text: 'Your videos', path: '/your-videos' },
  { Icon: HistoryOutlinedIcon, text: 'History', path: '/watch-history' },
  { Icon: ThumbUpOutlinedIcon, text: 'Liked Videos', path: '/liked-videos' },
  { Icon: ThumbDownOutlinedIcon, text: 'Disliked Videos', path: '/disliked-videos' },
  { Icon: WatchLaterIcon, text: 'Watch Later', path: '/watch-later' },
  { Icon: ReportIcon, text: 'Reports', path: '/reports' },
  { Icon: VideoLibraryOutlinedIcon, text: 'Library' },
]
