package com.youtube.clone.backend.payload.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DislikedVideoResponse {
    private Long id;
    private String videoId;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String channelTitle;
    private LocalDateTime dislikedAt;
} 