import React from 'react'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Dialog from '@material-ui/core/Dialog'
import Divider from '@material-ui/core/Divider'
import { moreButtonMenuArray } from './moreButtonMenuArray'

export const MobileModal = ({ isModalOpen, handleModalClose, isSearchPage, onReportClick }) => {
  const handleItemClick = (text) => {
    if (text === 'Report') {
      onReportClick && onReportClick();
    }
    handleModalClose();
  };

  const renderIcon = (Icon) => (
    <ListItemIcon style={{ minWidth: 36 }}>
      <Icon fontSize="small" style={{ color: 'rgb(96, 96, 96)' }} />
    </ListItemIcon>
  )

  const renderListItem = ({ Icon, text }, index) => (
    <ListItem key={index} button onClick={() => handleItemClick(text)}>
      {renderIcon(Icon)}
      <ListItemText
        primary={
          <Typography variant="subtitle2" style={{ fontSize: '0.875rem' }}>
            {text}
          </Typography>
        }
      />
    </ListItem>
  )

  return (
    <Dialog
      fullWidth
      open={isModalOpen}
      onClose={handleModalClose}
      PaperProps={{ style: { borderRadius: '1rem', margin: '1rem' } }}
    >
      <List disablePadding>
        {moreButtonMenuArray.slice(0, 3).map(renderListItem)}
        <Divider style={{ margin: '8px 0' }} />
        {moreButtonMenuArray.slice(3).map(renderListItem)}
      </List>
    </Dialog>
  )
}
