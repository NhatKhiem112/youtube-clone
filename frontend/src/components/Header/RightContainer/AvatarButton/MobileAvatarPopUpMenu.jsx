import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import { AvatarAccountInfo } from './AvatarAccountInfo'
import { AvatarMenuTop } from './AvatarMenuTop'
import { AvatarMenuMiddle } from './AvatarMenuMiddle'
import { AvatarMenuBottom } from './AvatarMenuBottom'
import { useAuth } from '../../../../context/AuthContext'
import Divider from '@material-ui/core/Divider'

const MobileAvatarPopUpMenu = ({ anchorAvatarButton, handleAvatarMenuClose, isLoggedIn }) => {
  const { currentUser } = useAuth()

  return (
    <Drawer
      anchor="left"
      open={Boolean(anchorAvatarButton)}
      onClose={handleAvatarMenuClose}
    >
      <List style={{ width: 250 }}>
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
      </List>
    </Drawer>
  )
}

export default MobileAvatarPopUpMenu
