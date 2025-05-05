import React from 'react';
import styled from 'styled-components/macro';

const DislikeText = styled.span`
  margin-left: 4px;
  font-size: 14px;
  color: ${props => props.$isActive ? '#3ea6ff' : 'inherit'};
`;

export default DislikeText; 