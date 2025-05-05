import React from 'react'
import styled from 'styled-components/macro'
import SubscribeButtonComponent from '../SubscribeButton'

export const ChannelSubscribeButton = ({ channelId, channelUsername }) => {
  return (
    <SubscribeButtonContainer>
      <SubscribeButtonComponent 
        channelId={channelId}
        channelUsername={channelUsername}
        size="small"
      />
    </SubscribeButtonContainer>
  )
}

const SubscribeButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
`
