package com.youtube.clone.backend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String videoId;
    
    @Column(name = "report_reason", nullable = false)
    private String reason;
    
    @Column(name = "reason", nullable = false)
    private String reasonField = "default_reason";
    
    @Column(nullable = false)
    private String title = "Report";
    
    @Column(columnDefinition = "TEXT")
    private String description = "";
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, REVIEWED, RESOLVED
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Constructor for creating a new report
    public Report(User user, String videoId, String reason, String description) {
        this.user = user;
        this.videoId = videoId;
        this.reason = reason;
        this.reasonField = reason;
        this.description = description != null ? description : "";
        this.title = "Report";
    }
} 