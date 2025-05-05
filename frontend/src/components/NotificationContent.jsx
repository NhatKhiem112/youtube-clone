import React from 'react';
import styled from 'styled-components/macro';
import { Paper } from '@material-ui/core';

const NotificationContent = styled(Paper)`
  && {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: ${props => {
      switch (props.severity) {
        case 'success':
          return '#e8f5e9';
        case 'error':
          return '#ffebee';
        case 'warning':
          return '#fff8e1';
        case 'info':
        default:
          return '#e3f2fd';
      }
    }};
    border-left: 4px solid ${props => {
      switch (props.severity) {
        case 'success':
          return '#4caf50';
        case 'error':
          return '#f44336';
        case 'warning':
          return '#ff9800';
        case 'info':
        default:
          return '#2196f3';
      }
    }};
    color: rgba(0, 0, 0, 0.87);
    min-width: 288px;
    max-width: 568px;
  }
`;

export default NotificationContent; 