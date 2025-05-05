package com.youtube.clone.backend.repository;

import com.youtube.clone.backend.model.WatchLaterVideo;
import com.youtube.clone.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchLaterRepository extends JpaRepository<WatchLaterVideo, Long> {
    List<WatchLaterVideo> findByUserOrderByAddedAtDesc(User user);

    Optional<WatchLaterVideo> findByUserAndVideoId(User user, String videoId);

    boolean existsByUserAndVideoId(User user, String videoId);

    void deleteByUserAndVideoId(User user, String videoId);
} 