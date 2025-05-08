import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Header from './components/Header/Header.jsx';
import MobileFooter from './components/Footer/Footer';
import Main from './components/Main/Main.jsx';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadVideo from './pages/UploadVideo';
import MyVideos from './pages/MyVideos';
import EditVideo from './pages/EditVideo';
import VideoPage from './pages/VideoPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ChannelPage from './pages/ChannelPage';
import { useIsMobileView } from './utils/utils';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  const isMobileView = useIsMobileView();

  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route exact path="/upload" component={UploadVideo} />
          <Route exact path="/my-videos" component={MyVideos} />
          <Route exact path="/your-videos" component={MyVideos} />
          <Route exact path="/edit-video/:id" component={EditVideo} />
          <Route exact path="/watch/:videoId" component={VideoPage} />
          <Route path="/watch" component={VideoPage} />
          <Route path="/subscriptions" component={SubscriptionsPage} />
          <Route path="/channel/:channelId" component={ChannelPage} />
          <Route path="/" component={Main} />
        </Switch>
        {isMobileView && <MobileFooter />}
      </div>
    </AuthProvider>
  );
}

export default App; 