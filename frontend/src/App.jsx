import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Header from './components/Header/Header.jsx'
import MobileFooter from './components/Footer/Footer'
import Main from './components/Main/Main.jsx'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UploadVideo from './pages/UploadVideo'
import MyVideos from './pages/MyVideos'
import EditVideo from './pages/EditVideo'
import { useIsMobileView } from './utils/utils'
import { AuthProvider } from './context/AuthContext'
import './App.css'

function App() {
  const isMobileView = useIsMobileView()

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
          <Route path="/" component={Main} />
        </Switch>
        {isMobileView && <MobileFooter />}
      </div>
    </AuthProvider>
  )
}

export default App
