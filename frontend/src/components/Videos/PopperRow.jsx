import React from 'react'
import styled from 'styled-components/macro'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

export const PopperRow = ({ Icon, text, onClick }) => {
  return (
    <StyledMenuItem onClick={onClick}>
      <StyledListItemIcon>
        <Icon fontSize="small" />
      </StyledListItemIcon>
      <StyledListItemText primary={text} />
    </StyledMenuItem>
  )
}

const StyledMenuItem = styled(MenuItem)`
  padding: 0 16px;
  min-height: 40px;
  cursor: pointer;
`

const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 32px;
  margin-right: 16px;
  color: rgb(96, 96, 96);
`

const StyledListItemText = styled(ListItemText)`
  margin: 0;
  color: rgb(3, 3, 3);
  font-size: 14px;
`
