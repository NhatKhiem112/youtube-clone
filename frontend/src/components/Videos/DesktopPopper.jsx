import React from 'react'
import styled from 'styled-components/macro'
import Popper from '@material-ui/core/Popper'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import MenuList from '@material-ui/core/MenuList'
import { PopperMenuTop } from './PopperMenuTop'
import { PopperMenuBottom } from './PopperMenuBottom'

export const DesktopPopper = ({
  isPopupOpen,
  anchorRef,
  handlePopupClose,
  handleListKeyDown,
  onReportClick
}) => {
  return (
    <Popper
      open={isPopupOpen}
      anchorEl={anchorRef.current}
      transition
      placement="left"
      modifiers={{
        offset: {
          enabled: true,
          offset: '0, 8px', // horizontal, vertical offset
        },
      }}
    >
      {({ TransitionProps }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: 'center bottom',
          }}
        >
          <StyledPaper elevation={8}>
            <ClickAwayListener onClickAway={handlePopupClose}>
              <StyledMenuList
                autoFocusItem={isPopupOpen}
                id="menu-list-grow"
                onKeyDown={handleListKeyDown}
              >
                <PopperMenuTop />
                <PopperMenuBottom onReportClick={onReportClick} />
              </StyledMenuList>
            </ClickAwayListener>
          </StyledPaper>
        </Grow>
      )}
    </Popper>
  )
}

const StyledPaper = styled(Paper)`
  width: 212px;
`

const StyledMenuList = styled(MenuList)`
  padding-top: 8px;
  padding-bottom: 8px;
  max-height: 538px;
`
