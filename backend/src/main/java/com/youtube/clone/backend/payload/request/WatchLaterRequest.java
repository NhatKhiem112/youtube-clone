package com.youtube.clone.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchLaterRequest {
    @NotBlank
    private String videoId;
    
    @NotBlank
    private String title;
    
    private String description;
    
    private String thumbnailUrl;
    
    private String channelTitle;
} 