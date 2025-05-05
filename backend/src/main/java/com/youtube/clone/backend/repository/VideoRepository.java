package com.youtube.clone.backend.repository;

import com.youtube.clone.backend.model.Video;
import com.youtube.clone.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByUserOrderByCreatedAtDesc(User user);
    
    List<Video> findByStatusOrderByCreatedAtDesc(String status);
    
    @Query("SELECT v FROM Video v WHERE v.status = 'PUBLIC' ORDER BY v.createdAt DESC")
    List<Video> findAllPublicVideos();
    
    @Query("SELECT v FROM Video v WHERE v.status = 'PUBLIC' ORDER BY v.viewCount DESC")
    List<Video> findTrendingVideos();
    
    @Query("SELECT v FROM Video v WHERE v.status = 'PUBLIC' AND v.title LIKE %:keyword% OR v.description LIKE %:keyword%")
    List<Video> searchVideos(String keyword);
} 