package com.youtube.clone.backend.repository;

import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.model.YouTubeSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface YouTubeSubscriptionRepository extends JpaRepository<YouTubeSubscription, Long> {
    // Find all YouTube channels a user has subscribed to
    List<YouTubeSubscription> findByUserOrderBySubscribedAtDesc(User user);
    
    // Check if a user is subscribed to a YouTube channel
    boolean existsByUserAndYoutubeChannelId(User user, String youtubeChannelId);
    
    // Find a specific subscription
    Optional<YouTubeSubscription> findByUserAndYoutubeChannelId(User user, String youtubeChannelId);
    
    // Count how many users have subscribed to a specific YouTube channel
    long countByYoutubeChannelId(String youtubeChannelId);
    
    // Delete a subscription
    @Transactional
    void deleteByUserAndYoutubeChannelId(User user, String youtubeChannelId);
    
    // Tìm danh sách đăng ký theo ID kênh YouTube
    List<YouTubeSubscription> findByYoutubeChannelId(String youtubeChannelId);
} 