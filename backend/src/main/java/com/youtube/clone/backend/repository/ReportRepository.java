package com.youtube.clone.backend.repository;

import com.youtube.clone.backend.model.Report;
import com.youtube.clone.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByUser(User user);
    List<Report> findByVideoId(String videoId);
    List<Report> findByStatus(String status);
    
    List<Report> findAllByOrderByCreatedAtDesc();
    
    Optional<Report> findByUserAndVideoId(User user, String videoId);
    
    boolean existsByUserAndVideoId(User user, String videoId);
} 