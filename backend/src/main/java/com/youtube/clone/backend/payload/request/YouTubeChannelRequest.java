package com.youtube.clone.backend.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YouTubeChannelRequest {
    private String channelName;
    private String channelThumbnailUrl;
    private Long subscriberCount;
} 