import React from 'react'
import styled from 'styled-components/macro'
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction'
import { miniSidebarRows as footerColumns } from '../Sidebar/sidebarData'
import { TWO_COL_MIN_WIDTH } from '../../utils/utils'
import { Link } from 'react-router-dom'

export const FooterIcons = ({ activeItem }) => {
  return footerColumns.map(({ Icon, text, path }) => {
    const isActive = activeItem === text;
    
    if (text === 'Home' || path) {
      return (
        <StyledBottomNavigationAction
          key={text}
          label={text}
          icon={<IconWrapper isActive={isActive}><Icon /></IconWrapper>}
          component={Link}
          to={path || "/"}
          className={isActive ? 'active' : ''}
        />
      )
    } else {
      return (
        <StyledBottomNavigationAction 
          key={text} 
          label={text} 
          icon={<IconWrapper isActive={isActive}><Icon /></IconWrapper>}
          className={isActive ? 'active' : ''}
        />
      )
    }
  })
}

const IconWrapper = styled.div`
  color: ${props => props.isActive ? '#cc0000' : '#030303'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  svg {
    font-size: 22px;
    transition: all 0.3s ease;
  }
`

const StyledBottomNavigationAction = styled(BottomNavigationAction)`
  .MuiBottomNavigationAction-wrapper {
    color: #030303;
    transition: all 0.3s ease;
  }
  
  .MuiBottomNavigationAction-label {
    font-size: 11px;
    opacity: 1 !important; // to override MiniSidebar
    transition: all 0.3s ease;
    
    @media screen and (min-width: ${TWO_COL_MIN_WIDTH}px) {
      margin-top: 6px;
    }
  }
  
  &:hover {
    background-color: rgba(0,0,0,0.05);
    
    .MuiBottomNavigationAction-wrapper {
      transform: translateY(-2px);
    }
    
    ${IconWrapper} {
      color: #cc0000;
      
      svg {
        transform: scale(1.2);
      }
    }
  }
  
  &.active {
    .MuiBottomNavigationAction-wrapper {
      color: #cc0000;
    }
    
    .MuiBottomNavigationAction-label {
      font-weight: 600;
      font-size: 11px;
      color: #cc0000;
    }
    
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background-color: #cc0000;
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
  }
`
