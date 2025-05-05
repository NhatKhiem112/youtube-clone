package com.youtube.clone.backend.controllers;

import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.model.WatchedVideo;
import com.youtube.clone.backend.repository.UserRepository;
import com.youtube.clone.backend.repository.WatchedVideoRepository;
import com.youtube.clone.backend.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import jakarta.annotation.PostConstruct;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/videos/history")
public class WatchedVideoController {
    
    private static final Logger logger = LoggerFactory.getLogger(WatchedVideoController.class);

    @Autowired
    private WatchedVideoRepository watchedVideoRepository;

    @Autowired
    private UserRepository userRepository;
    
    @PostConstruct
    public void init() {
        logger.info("WatchedVideoController initialized at path: /videos/history");
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Test endpoint accessed");
        return ResponseEntity.ok("WatchedVideo Controller is working!");
    }

    @GetMapping("")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<WatchedVideo>> getWatchHistory() {
        logger.info("Getting watch history");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<WatchedVideo> watchedVideos = watchedVideoRepository.findByUserOrderByLastWatchedAtDesc(user);
        logger.info("Returning {} watch history items", watchedVideos.size());

        return ResponseEntity.ok(watchedVideos);
    }

    @PostMapping("")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> addToWatchHistory(@RequestBody Map<String, String> videoData) {
        try {
            logger.info("Adding to watch history: {}", videoData.get("videoId"));
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

            String videoId = videoData.get("videoId");
            String title = videoData.get("title");
            String description = videoData.get("description");
            String thumbnailUrl = videoData.get("thumbnailUrl");
            String channelTitle = videoData.get("channelTitle");

            logger.info("Adding to watch history: {} for user {}", videoId, user.getUsername());

            // Check if video exists in watch history
            Optional<WatchedVideo> existingVideo = watchedVideoRepository.findByUserAndVideoId(user, videoId);

            if (existingVideo.isPresent()) {
                // If exists, update last watched time and increase view count
                WatchedVideo watchedVideo = existingVideo.get();
                watchedVideo.setLastWatchedAt(LocalDateTime.now());
                watchedVideo.setWatchCount(watchedVideo.getWatchCount() + 1);
                // Update video info if changed
                watchedVideo.setTitle(title);
                watchedVideo.setDescription(description);
                watchedVideo.setThumbnailUrl(thumbnailUrl);
                watchedVideo.setChannelTitle(channelTitle);
                
                logger.info("Updated existing watch history entry");
                return ResponseEntity.ok(watchedVideoRepository.save(watchedVideo));
            } else {
                // If not exists, add to history
                WatchedVideo watchedVideo = new WatchedVideo(
                        user, videoId, title, description, thumbnailUrl, channelTitle);
                
                logger.info("Created new watch history entry");
                return ResponseEntity.ok(watchedVideoRepository.save(watchedVideo));
            }
        } catch (Exception e) {
            logger.error("Error adding to watch history", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{videoId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> removeFromWatchHistory(@PathVariable String videoId) {
        logger.info("Removing from watch history: {}", videoId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Optional<WatchedVideo> watchedVideo = watchedVideoRepository.findByUserAndVideoId(user, videoId);
        if (watchedVideo.isPresent()) {
            watchedVideoRepository.delete(watchedVideo.get());
            logger.info("Removed from watch history");
            return ResponseEntity.ok().build();
        } else {
            logger.info("Video not found in watch history");
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> clearWatchHistory() {
        logger.info("Clearing watch history");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        List<WatchedVideo> watchedVideos = watchedVideoRepository.findByUserOrderByLastWatchedAtDesc(user);
        watchedVideoRepository.deleteAll(watchedVideos);
        logger.info("Cleared {} items from watch history", watchedVideos.size());

        return ResponseEntity.ok().build();
    }

    @RequestMapping(value = "", method = RequestMethod.DELETE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllFromWatchHistory() {
        logger.info("DELETE request received for clearing all watch history");
        return clearWatchHistory();
    }

    @PutMapping("")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateWatchHistory(@RequestBody Map<String, String> videoData) {
        logger.info("PUT request received for updating watch history: {}", videoData.get("videoId"));
        return addToWatchHistory(videoData);
    }

    @GetMapping("/{videoId}/check")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Boolean> isVideoInWatchHistory(@PathVariable String videoId) {
        logger.info("Checking if video is in watch history: {}", videoId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        boolean exists = watchedVideoRepository.existsByUserAndVideoId(user, videoId);
        logger.info("Video exists in watch history: {}", exists);
        return ResponseEntity.ok(exists);
    }

    /* Commented out to avoid conflict with UserVideoController
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WatchedVideo>> getUserWatchHistory(@PathVariable Long userId) {
        logger.info("Getting watch history for user ID: {}", userId);
        
        User user = userRepository.findById(userId).orElseThrow(() -> 
            new RuntimeException("User not found with ID: " + userId));
            
        List<WatchedVideo> watchedVideos = watchedVideoRepository.findByUserOrderByLastWatchedAtDesc(user);
        logger.info("Returning {} watch history items for user ID: {}", watchedVideos.size(), userId);
        
        return ResponseEntity.ok(watchedVideos);
    }
    */
} 