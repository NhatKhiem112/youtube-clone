import React from 'react';
import styled from 'styled-components/macro';

const DislikeButtonContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 16px;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

export default DislikeButtonContainer;
