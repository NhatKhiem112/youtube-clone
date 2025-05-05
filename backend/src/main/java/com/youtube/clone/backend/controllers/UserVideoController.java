package com.youtube.clone.backend.controllers;

import com.youtube.clone.backend.payload.response.LikedVideoResponse;
import com.youtube.clone.backend.payload.response.MessageResponse;
import com.youtube.clone.backend.payload.response.WatchLaterResponse;
import com.youtube.clone.backend.service.LikedVideoService;
import com.youtube.clone.backend.service.WatchLaterService;
import com.youtube.clone.backend.model.WatchedVideo;
import com.youtube.clone.backend.repository.WatchedVideoRepository;
import com.youtube.clone.backend.repository.UserRepository;
import com.youtube.clone.backend.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "*", maxAge = 3600, allowedHeaders = "*")
@RestController
@RequestMapping("")
public class UserVideoController {

    private static final Logger logger = LoggerFactory.getLogger(UserVideoController.class);

    @Autowired
    private LikedVideoService likedVideoService;
    
    @Autowired
    private WatchLaterService watchLaterService;
    
    @Autowired
    private WatchedVideoRepository watchedVideoRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/videos/liked/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getLikedVideosByUserId(@PathVariable Long userId) {
        logger.info("Getting liked videos for user ID: {}", userId);
        try {
            List<LikedVideoResponse> likedVideos = likedVideoService.getLikedVideosByUserId(userId);
            logger.info("Returning {} liked videos for user ID: {}", likedVideos.size(), userId);
            return ResponseEntity.ok(likedVideos);
        } catch (Exception e) {
            logger.error("Error getting liked videos for user ID: {}", userId, e);
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/videos/watchlater/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getWatchLaterByUserId(@PathVariable Long userId) {
        logger.info("Getting watch later videos for user ID: {}", userId);
        try {
            List<WatchLaterResponse> watchLaterVideos = watchLaterService.getWatchLaterVideosByUserId(userId);
            logger.info("Returning {} watch later videos for user ID: {}", watchLaterVideos.size(), userId);
            return ResponseEntity.ok(watchLaterVideos);
        } catch (Exception e) {
            logger.error("Error getting watch later videos for user ID: {}", userId, e);
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/videos/history/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getWatchHistoryByUserId(@PathVariable Long userId) {
        logger.info("Getting watch history for user ID: {}", userId);
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            if (!userOptional.isPresent()) {
                logger.error("User not found with ID: {}", userId);
                return ResponseEntity.notFound().build();
            }
            
            User user = userOptional.get();
            List<WatchedVideo> watchedVideos = watchedVideoRepository.findByUserOrderByLastWatchedAtDesc(user);
            logger.info("Returning {} watch history items for user ID: {}", watchedVideos.size(), userId);
            return ResponseEntity.ok(watchedVideos);
        } catch (Exception e) {
            logger.error("Error getting watch history for user ID: {}", userId, e);
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
} 