import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import styled from 'styled-components/macro'
import ListItemText from '@material-ui/core/ListItemText'
import { StyledMenuItem, StyledListItemIcon } from '../../../../utils/utils'
import { useHistory } from 'react-router-dom'

export const MenuRow = ({ Icon, text, arrow, onClick, route }) => {
  const history = useHistory()
  
  const handleClick = (e) => {
    console.log("MenuRow clicked:", text);
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    } else if (route) {
      history.push(route);
    }
  }
  
  return (
    <MenuItem onClick={handleClick}>
      <StyledListItemIcon>
        <Icon fontSize="small" />
      </StyledListItemIcon>
      <ListItemText primary={text} />
      {arrow && <ChevronRightIcon style={{ fontSize: '20px' }} />}
    </MenuItem>
  )
}
const MenuItem = styled(StyledMenuItem)`
  && {
    padding-top: 0;
    padding-bottom: 0;
    z-index: 1350;
    cursor: pointer;
    pointer-events: auto;
    position: relative;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
`
