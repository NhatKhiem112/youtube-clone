package com.youtube.clone.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoUploadRequest {
    @NotBlank
    private String title;
    
    private String description;
    
    private String status = "PUBLIC"; // PUBLIC, PRIVATE, UNLISTED
} 