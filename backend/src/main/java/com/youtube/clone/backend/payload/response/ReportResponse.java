package com.youtube.clone.backend.payload.response;

import java.time.LocalDateTime;

import com.youtube.clone.backend.model.Report;

import lombok.Data;

@Data
public class ReportResponse {
    private Long id;
    private String videoId;
    private String reason;
    private String description;
    private String title;
    private String status;
    private Long userId;
    private String username; // Optional, if you want to include username
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ReportResponse fromEntity(Report report) {
        ReportResponse response = new ReportResponse();
        response.setId(report.getId());
        response.setVideoId(report.getVideoId());
        response.setReason(report.getReason());
        response.setDescription(report.getDescription());
        response.setTitle(report.getTitle());
        response.setStatus(report.getStatus());
        response.setUserId(report.getUser().getId());
        
        // Optionally set username if needed
        if (report.getUser() != null) {
            response.setUsername(report.getUser().getUsername());
        }
        
        response.setCreatedAt(report.getCreatedAt());
        response.setUpdatedAt(report.getUpdatedAt());
        
        return response;
    }
} 