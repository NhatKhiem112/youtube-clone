package com.youtube.clone.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportRequest {
    @NotBlank
    private String videoId;
    
    @NotBlank
    private String reason;
    
    private String title = "Report";
    
    private String description;
} 