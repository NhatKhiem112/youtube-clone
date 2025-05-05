import React from 'react';
import styled from 'styled-components/macro';
import { Button } from '@material-ui/core';

const StyledButton = styled(Button)`
  && {
    text-transform: none;
    padding: 8px 16px;
    font-weight: 500;
    color: ${props => props.$primary ? '#ffffff' : '#606060'};
    background-color: ${props => props.$primary ? '#3ea6ff' : 'transparent'};
    border-radius: 2px;
    margin-left: 8px;
    
    &:hover {
      background-color: ${props => props.$primary ? '#4db5ff' : 'rgba(0, 0, 0, 0.05)'};
    }
  }
`;

const DialogButton = ({ children, $primary, ...props }) => {
  return (
    <StyledButton 
      $primary={$primary}
      variant={$primary ? "contained" : "text"}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default DialogButton; 