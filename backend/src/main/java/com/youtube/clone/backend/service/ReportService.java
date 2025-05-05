package com.youtube.clone.backend.service;

import com.youtube.clone.backend.model.Report;
import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.payload.request.ReportRequest;
import com.youtube.clone.backend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;
    
    public Report createReport(User user, ReportRequest reportRequest) {
        // Check if user has already reported this video
        Optional<Report> existingReport = reportRepository.findByUserAndVideoId(user, reportRequest.getVideoId());
        
        if (existingReport.isPresent()) {
            // Update existing report
            Report report = existingReport.get();
            report.setReason(reportRequest.getReason());
            report.setReasonField(reportRequest.getReason());
            report.setDescription(reportRequest.getDescription() != null ? reportRequest.getDescription() : "");
            if (reportRequest.getTitle() != null) {
                report.setTitle(reportRequest.getTitle());
            } else {
                report.setTitle("Report");
            }
            return reportRepository.save(report);
        } else {
            // Create new report
            Report newReport = new Report(
                user,
                reportRequest.getVideoId(),
                reportRequest.getReason(),
                reportRequest.getDescription() != null ? reportRequest.getDescription() : ""
            );
            if (reportRequest.getTitle() != null) {
                newReport.setTitle(reportRequest.getTitle());
            } else {
                newReport.setTitle("Report");
            }
            newReport.setReasonField(reportRequest.getReason());
            return reportRepository.save(newReport);
        }
    }
    
    public List<Report> getUserReports(User user) {
        return reportRepository.findByUser(user);
    }
    
    public List<Report> getVideoReports(String videoId) {
        return reportRepository.findByVideoId(videoId);
    }
    
    public List<Report> getPendingReports() {
        return reportRepository.findByStatus("PENDING");
    }
    
    public List<Report> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public Report updateReportStatus(Long reportId, String status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));
                
        report.setStatus(status);
        return reportRepository.save(report);
    }
    
    public void deleteReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));
        
        reportRepository.delete(report);
    }
} 