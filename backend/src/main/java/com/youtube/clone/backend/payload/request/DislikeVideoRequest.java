package com.youtube.clone.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DislikeVideoRequest {
    @NotBlank
    private String videoId;

    @NotBlank
    private String title;

    private String description;

    private String thumbnailUrl;

    private String channelTitle;
} 