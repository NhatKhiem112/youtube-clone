import React from 'react'
import MobileAvatarPopUpMenu from './MobileAvatarPopUpMenu'
import { AvatarPopUpMenu } from './AvatarPopUpMenu'
import { useIsMobileView } from '../../../../utils/utils'

const AvatarMenu = ({ anchorAvatarButton, handleAvatarMenuClose, isLoggedIn }) => {
  const isMobileView = useIsMobileView()

  if (isMobileView) {
    return (
      <MobileAvatarPopUpMenu
        anchorAvatarButton={anchorAvatarButton}
        handleAvatarMenuClose={handleAvatarMenuClose}
        isLoggedIn={isLoggedIn}
      />
    )
  }
  
  return (
    <AvatarPopUpMenu 
      anchorAvatarButton={anchorAvatarButton}
      handleAvatarMenuClose={handleAvatarMenuClose}
      isLoggedIn={isLoggedIn}
    />
  )
}

export default AvatarMenu
