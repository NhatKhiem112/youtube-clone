package com.youtube.clone.backend.payload.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoResponse {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;
    private String username;
    private String status;
    private Integer viewCount;
    private Integer likeCount;
    private Integer dislikeCount;
    private Integer duration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 