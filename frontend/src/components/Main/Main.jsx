import React, { useState } from 'react'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import ChipsBar from '../ChipsBar/ChipsBar'
import LandingPageVideos from '../../pages/LandingPage'
import {
  MOBILE_VIEW_HEADER_HEIGHT,
  DESKTOP_VIEW_HEADER_HEIGHT,
  TWO_COL_MIN_WIDTH,
  MINI_SIDEBAR_WIDTH
} from '../../utils/utils'
import SidebarToShow from '../Sidebar/SidebarToShow'
import SearchPage from '../../pages/SearchPage'
import VideoPage from '../../pages/VideoPage'
import LikedVideosPage from '../../pages/LikedVideosPage'
import DislikedVideosPage from '../../pages/DislikedVideosPage'
import WatchLaterPage from '../../pages/WatchLaterPage'
import WatchHistoryPage from '../../pages/WatchHistoryPage'
import ReportsPage from '../../pages/ReportsPage'
import AdminReportsPage from '../../pages/AdminReportsPage'
import SubscriptionsPage from '../../pages/SubscriptionsPage'
import ScrollToTop from '../ScrollToTop'

const Main = () => {
  const [selectedChipIndex, setSelectedChipIndex] = useState(0)
  const [landingPageVideos, setLandingPageVideos] = useState([])
  const [popularVideosNextPageToken, setPopularVideosNextPageToken] =
    useState(null)
  const isInSearchResultsPage = useLocation().pathname === '/results'
  const isInVideoPage = useLocation().pathname.includes('/watch')

  return (
    <StyledMain isInSearchResultsPage={isInSearchResultsPage} isInVideoPage={isInVideoPage}>
      <ScrollToTop />
      {!isInVideoPage && <SidebarToShow />}
      <MainContentWrapper>
        <Switch>
          <Route path='/' exact>
            <ChipsBar
              {...{
                selectedChipIndex,
                setSelectedChipIndex,
                setLandingPageVideos,
                setPopularVideosNextPageToken,
              }}
            />
            <LandingPageVideos
              {...{
                selectedChipIndex,
                setSelectedChipIndex,
                landingPageVideos,
                setLandingPageVideos,
                popularVideosNextPageToken,
                setPopularVideosNextPageToken,
              }}
            />
          </Route>
          <Route path='/results'>
            <SearchPage />
          </Route>
          <Route path='/watch/:videoId'>
            <VideoPage />
          </Route>
          <Route path='/liked-videos'>
            <LikedVideosPage />
          </Route>
          <Route path='/disliked-videos'>
            <DislikedVideosPage />
          </Route>
          <Route path='/watch-later'>
            <WatchLaterPage />
          </Route>
          <Route path='/watch-history'>
            <WatchHistoryPage />
          </Route>
          <Route path='/subscriptions'>
            <SubscriptionsPage />
          </Route>
          <Route path='/reports'>
            <ReportsPage />
          </Route>
          <Route path='/admin/reports'>
            <AdminReportsPage />
          </Route>
          {/* original YouTube has a 'something went wrong' page instead of redirecting back to the homepage */}
          <Route path='*'>
            <Redirect to='/' />
          </Route>
        </Switch>
      </MainContentWrapper>
    </StyledMain>
  )
}

export default Main

const MainContentWrapper = styled.div`
  width: 100%;
  padding-top: 16px;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    margin-left: ${MINI_SIDEBAR_WIDTH}px;
    width: calc(100% - ${MINI_SIDEBAR_WIDTH}px);
    overflow-x: hidden;
    padding-right: 8px;
    padding-top: 20px;
  }
`

const StyledMain = styled.div`
  padding-top: ${({ isInSearchResultsPage, isInVideoPage }) =>
    isInSearchResultsPage || isInVideoPage ? 0 : MOBILE_VIEW_HEADER_HEIGHT}px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
  
  @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
    padding-top: ${({ isInSearchResultsPage, isInVideoPage }) =>
    isInSearchResultsPage || isInVideoPage ? 0 : DESKTOP_VIEW_HEADER_HEIGHT}px;
    /* Removed padding-left since it's now handled by MainContentWrapper */
  }
`