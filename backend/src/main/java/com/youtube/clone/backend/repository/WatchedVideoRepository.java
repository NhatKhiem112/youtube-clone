package com.youtube.clone.backend.repository;

import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.model.WatchedVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchedVideoRepository extends JpaRepository<WatchedVideo, Long> {
    List<WatchedVideo> findByUserOrderByLastWatchedAtDesc(User user);
    Optional<WatchedVideo> findByUserAndVideoId(User user, String videoId);
    void deleteByUserAndVideoId(User user, String videoId);
    boolean existsByUserAndVideoId(User user, String videoId);
} 