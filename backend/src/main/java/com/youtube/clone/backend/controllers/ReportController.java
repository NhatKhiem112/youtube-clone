package com.youtube.clone.backend.controllers;

import com.youtube.clone.backend.model.Report;
import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.payload.request.ReportRequest;
import com.youtube.clone.backend.payload.response.MessageResponse;
import com.youtube.clone.backend.payload.response.ReportResponse;
import com.youtube.clone.backend.security.services.UserDetailsImpl;
import com.youtube.clone.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * Create a new report for a video
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createReport(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ReportRequest reportRequest) {
        
        User user = new User();
        user.setId(userDetails.getId());
        
        Report report = reportService.createReport(user, reportRequest);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Report submitted successfully");
        response.put("reportId", report.getId());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get reports submitted by the current user
     */
    @GetMapping("/my-reports")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyReports(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = new User();
        user.setId(userDetails.getId());
        
        List<Report> reports = reportService.getUserReports(user);
        List<ReportResponse> responseList = reports.stream()
            .map(ReportResponse::fromEntity)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responseList);
    }

    /**
     * Get all reports (admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllReports() {
        List<Report> reports = reportService.getAllReports();
        List<ReportResponse> responseList = reports.stream()
            .map(ReportResponse::fromEntity)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responseList);
    }

    /**
     * Get reports for a specific video (admin only)
     */
    @GetMapping("/video/{videoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getVideoReports(@PathVariable String videoId) {
        List<Report> reports = reportService.getVideoReports(videoId);
        List<ReportResponse> responseList = reports.stream()
            .map(ReportResponse::fromEntity)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responseList);
    }

    /**
     * Get pending reports (admin only)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingReports() {
        List<Report> reports = reportService.getPendingReports();
        List<ReportResponse> responseList = reports.stream()
            .map(ReportResponse::fromEntity)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responseList);
    }

    /**
     * Update report status (admin only)
     */
    @PutMapping("/{reportId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable Long reportId,
            @RequestParam String status) {
        
        if (!status.equals("PENDING") && !status.equals("REVIEWED") && !status.equals("RESOLVED")) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Status must be PENDING, REVIEWED, or RESOLVED"));
        }
        
        Report report = reportService.updateReportStatus(reportId, status);
        ReportResponse responseDto = ReportResponse.fromEntity(report);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Report status updated successfully");
        response.put("report", responseDto);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a report (admin only)
     */
    @DeleteMapping("/{reportId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId) {
        try {
            reportService.deleteReport(reportId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Report successfully deleted");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
} 