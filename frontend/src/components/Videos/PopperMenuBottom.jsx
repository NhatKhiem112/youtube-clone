import React from 'react'
import { moreButtonMenuArray } from './moreButtonMenuArray'
import { PopperRow } from './PopperRow'
import Divider from '@material-ui/core/Divider'

export const PopperMenuBottom = ({ onReportClick }) => {
  const handleItemClick = (text) => {
    if (text === 'Report') {
      onReportClick && onReportClick();
    }
  };

  return (
    <>
      <Divider style={{ margin: '8px 0' }} />
      {moreButtonMenuArray.map(({ Icon, text }, index) => (
        <PopperRow 
          key={index} 
          {...{ Icon, text }}
          onClick={() => handleItemClick(text)}
        />
      ))}
    </>
  )
}
