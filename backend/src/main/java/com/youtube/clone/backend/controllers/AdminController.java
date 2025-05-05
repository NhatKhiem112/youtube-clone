package com.youtube.clone.backend.controllers;

import com.youtube.clone.backend.model.*;
import com.youtube.clone.backend.payload.request.VideoUploadRequest;
import com.youtube.clone.backend.payload.response.MessageResponse;
import com.youtube.clone.backend.payload.response.VideoResponse;
import com.youtube.clone.backend.repository.*;
import com.youtube.clone.backend.service.VideoService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.Arrays;

@CrossOrigin(origins = "*", maxAge = 3600, allowedHeaders = "*")
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private WatchedVideoRepository watchedVideoRepository;

    @Autowired
    private LikedVideoRepository likedVideoRepository;

    @Autowired
    private DislikedVideoRepository dislikedVideoRepository;

    @Autowired
    private WatchLaterRepository watchLaterRepository;

    @Autowired
    private YouTubeSubscriptionRepository youTubeSubscriptionRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private VideoService videoService;

    // Get all users (admin only)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Get user by ID (admin only)
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete user (admin only)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            // Get the user first
            User user = userRepository.findById(id).orElseThrow();
            
            try {
                System.out.println("Starting to delete user with ID: " + id);
                
                // 1. Remove user from roles (clear the many-to-many relationship)
                Set<Role> roles = user.getRoles();
                if (roles != null && !roles.isEmpty()) {
                    System.out.println("Clearing user roles: " + roles.size() + " roles found");
                    user.setRoles(new HashSet<>());
                    userRepository.save(user);
                    System.out.println("User roles cleared successfully");
                }
                
                // 2. Clear liked videos
                List<LikedVideo> likedVideos = likedVideoRepository.findByUserOrderByLikedAtDesc(user);
                if (likedVideos != null && !likedVideos.isEmpty()) {
                    System.out.println("Deleting " + likedVideos.size() + " liked videos");
                    likedVideoRepository.deleteAll(likedVideos);
                    System.out.println("Liked videos deleted successfully");
                }
                
                // 3. Clear disliked videos
                List<DislikedVideo> dislikedVideos = dislikedVideoRepository.findByUserOrderByDislikedAtDesc(user);
                if (dislikedVideos != null && !dislikedVideos.isEmpty()) {
                    System.out.println("Deleting " + dislikedVideos.size() + " disliked videos");
                    dislikedVideoRepository.deleteAll(dislikedVideos);
                    System.out.println("Disliked videos deleted successfully");
                }
                
                // 4. Clear watched videos
                List<WatchedVideo> watchedVideos = watchedVideoRepository.findByUserOrderByLastWatchedAtDesc(user);
                if (watchedVideos != null && !watchedVideos.isEmpty()) {
                    System.out.println("Deleting " + watchedVideos.size() + " watched videos");
                    watchedVideoRepository.deleteAll(watchedVideos);
                    System.out.println("Watched videos deleted successfully");
                }
                
                // 5. Clear watch later videos
                List<WatchLaterVideo> watchLaterVideos = watchLaterRepository.findByUserOrderByAddedAtDesc(user);
                if (watchLaterVideos != null && !watchLaterVideos.isEmpty()) {
                    System.out.println("Deleting " + watchLaterVideos.size() + " watch later videos");
                    watchLaterRepository.deleteAll(watchLaterVideos);
                    System.out.println("Watch later videos deleted successfully");
                }
                
                // Finally delete the user
                System.out.println("Now deleting the user entity");
                userRepository.delete(user); // Use delete() instead of deleteById() for better error reporting
                System.out.println("User deleted successfully");
                
                return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
            } catch (Exception e) {
                e.printStackTrace();
                System.err.println("Error while deleting user relationships: " + e.getMessage());
                Throwable cause = e.getCause();
                while (cause != null) {
                    System.err.println("Caused by: " + cause.getMessage());
                    cause = cause.getCause();
                }
                return ResponseEntity.badRequest().body(new MessageResponse("Error deleting user: " + e.getMessage()));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Error retrieving user: " + e.getMessage()));
        }
    }

    // Update user role (admin only)
    @PutMapping("/users/{id}/roles")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, List<String>> roleRequest) {
        Optional<User> userOptional = userRepository.findById(id);
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        List<String> roleNames = roleRequest.get("roles");
        
        if (roleNames == null || roleNames.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: No roles provided"));
        }

        Set<Role> roles = roleNames.stream()
                .map(roleName -> {
                    switch (roleName) {
                        case "ROLE_ADMIN":
                            return roleRepository.findByName(ERole.ROLE_ADMIN)
                                    .orElseThrow(() -> new RuntimeException("Error: Admin Role not found"));
                        case "ROLE_MODERATOR":
                            return roleRepository.findByName(ERole.ROLE_MODERATOR)
                                    .orElseThrow(() -> new RuntimeException("Error: Moderator Role not found"));
                        default:
                            return roleRepository.findByName(ERole.ROLE_USER)
                                    .orElseThrow(() -> new RuntimeException("Error: User Role not found"));
                    }
                })
                .collect(Collectors.toSet());

        user.setRoles(roles);
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("User roles updated successfully"));
    }

    // Get dashboard statistics
    @GetMapping("/statistics")
    public ResponseEntity<?> getDashboardStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        // Count total users
        long totalUsers = userRepository.count();
        statistics.put("totalUsers", totalUsers);
        
        // Count total videos 
        // Using the sum of all watched videos as an approximation
        long totalVideos = watchedVideoRepository.count();
        statistics.put("totalVideos", totalVideos);
        
        // Count total video views
        // Sum up all watch counts
        int totalViews = 0;
        List<WatchedVideo> allWatchedVideos = watchedVideoRepository.findAll();
        for (WatchedVideo video : allWatchedVideos) {
            totalViews += video.getWatchCount();
        }
        statistics.put("totalViews", totalViews);
        
        // New users count (placeholder)
        statistics.put("newUsersToday", 5);
        
        return ResponseEntity.ok(statistics);
    }

    // Get all videos (admin only)
    @GetMapping("/videos")
    public ResponseEntity<?> getAllVideos() {
        List<Map<String, Object>> allVideos = new ArrayList<>();
        
        // Get videos from watched videos
        List<WatchedVideo> watchedVideos = watchedVideoRepository.findAll();
        for (WatchedVideo video : watchedVideos) {
            Map<String, Object> videoMap = new HashMap<>();
            videoMap.put("id", video.getId());
            videoMap.put("videoId", video.getVideoId());
            videoMap.put("title", video.getTitle());
            videoMap.put("description", video.getDescription());
            videoMap.put("thumbnailUrl", video.getThumbnailUrl());
            videoMap.put("channelTitle", video.getChannelTitle());
            videoMap.put("username", video.getUser().getUsername());
            videoMap.put("viewCount", video.getWatchCount());
            videoMap.put("uploadDate", video.getWatchedAt().toString());
            videoMap.put("type", "WatchedVideo");
            allVideos.add(videoMap);
        }
        
        return ResponseEntity.ok(allVideos);
    }

    // Delete video (admin only)
    @DeleteMapping("/videos/{id}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        // Try to delete from all repositories
        boolean deleted = false;
        
        // Try WatchedVideo
        Optional<WatchedVideo> watchedVideo = watchedVideoRepository.findById(id);
        if (watchedVideo.isPresent()) {
            watchedVideoRepository.deleteById(id);
            deleted = true;
        }
        
        // Try LikedVideo
        if (!deleted) {
            Optional<LikedVideo> likedVideo = likedVideoRepository.findById(id);
            if (likedVideo.isPresent()) {
                likedVideoRepository.deleteById(id);
                deleted = true;
            }
        }
        
        // Try DislikedVideo
        if (!deleted) {
            Optional<DislikedVideo> dislikedVideo = dislikedVideoRepository.findById(id);
            if (dislikedVideo.isPresent()) {
                dislikedVideoRepository.deleteById(id);
                deleted = true;
            }
        }
        
        // Try WatchLaterVideo
        if (!deleted) {
            Optional<WatchLaterVideo> watchLaterVideo = watchLaterRepository.findById(id);
            if (watchLaterVideo.isPresent()) {
                watchLaterRepository.deleteById(id);
                deleted = true;
            }
        }
        
        // Try Video
        if (!deleted) {
            Optional<Video> video = videoRepository.findById(id);
            if (video.isPresent()) {
                videoService.deleteVideo(id);
                deleted = true;
            }
        }
        
        if (deleted) {
            return ResponseEntity.ok(new MessageResponse("Video deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Update video metadata (admin only)
    @PutMapping("/videos/{id}")
    public ResponseEntity<?> updateVideo(@PathVariable Long id, @RequestBody VideoUploadRequest videoUploadRequest) {
        try {
            // First check if video exists
            Optional<Video> videoOpt = videoRepository.findById(id);
            if (videoOpt.isPresent()) {
                VideoResponse updatedVideo = videoService.updateVideo(id, videoUploadRequest);
                return ResponseEntity.ok(updatedVideo);
            } else {
                // If not in main video repository, try to find in other repositories
                // This is a simplified approach - in production, you'd need more sophisticated handling
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Failed to update video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to update video: " + e.getMessage()));
        }
    }

    // Update video status (admin only)
    @PutMapping("/videos/{id}/status")
    public ResponseEntity<?> updateVideoStatus(@PathVariable Long id, @RequestBody Map<String, String> statusData) {
        try {
            String status = statusData.get("status");
            if (status == null || status.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Status is required"));
            }
            
            // Validate status
            if (!Arrays.asList("PROCESSING", "PENDING_REVIEW", "APPROVED", "REJECTED", "PUBLIC", "PRIVATE", "UNLISTED")
                    .contains(status)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid status value"));
            }
            
            // Check if video exists
            Optional<Video> videoOpt = videoRepository.findById(id);
            if (videoOpt.isPresent()) {
                videoService.updateVideoStatus(id, status);
                Video updatedVideo = videoRepository.findById(id).orElseThrow();
                return ResponseEntity.ok(videoService.convertToVideoResponse(updatedVideo));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Failed to update video status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to update video status: " + e.getMessage()));
        }
    }

    // Get a specific user's liked videos (admin only)
    @GetMapping("/users/{userId}/likes")
    public ResponseEntity<?> getUserLikes(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOptional.get();
        List<LikedVideo> likedVideos = likedVideoRepository.findByUserOrderByLikedAtDesc(user);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (LikedVideo video : likedVideos) {
            Map<String, Object> videoMap = new HashMap<>();
            videoMap.put("id", video.getId());
            videoMap.put("videoId", video.getVideoId());
            videoMap.put("videoTitle", video.getTitle());
            videoMap.put("channelName", video.getChannelTitle());
            videoMap.put("likeCount", 0); // This would need to be populated from a view count service
            videoMap.put("likedAt", video.getLikedAt());
            result.add(videoMap);
        }
        
        return ResponseEntity.ok(result);
    }
    
    // Get a specific user's watch history (admin only)
    @GetMapping("/users/{userId}/history")
    public ResponseEntity<?> getUserHistory(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOptional.get();
        List<WatchedVideo> watchedVideos = watchedVideoRepository.findByUserOrderByLastWatchedAtDesc(user);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (WatchedVideo video : watchedVideos) {
            Map<String, Object> videoMap = new HashMap<>();
            videoMap.put("id", video.getId());
            videoMap.put("videoId", video.getVideoId());
            videoMap.put("videoTitle", video.getTitle());
            videoMap.put("channelName", video.getChannelTitle());
            videoMap.put("watchDate", video.getLastWatchedAt());
            result.add(videoMap);
        }
        
        return ResponseEntity.ok(result);
    }
    
    // Get a specific user's watch later list (admin only)
    @GetMapping("/users/{userId}/watchlater")
    public ResponseEntity<?> getUserWatchLater(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOptional.get();
        List<WatchLaterVideo> watchLaterVideos = watchLaterRepository.findByUserOrderByAddedAtDesc(user);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (WatchLaterVideo video : watchLaterVideos) {
            Map<String, Object> videoMap = new HashMap<>();
            videoMap.put("id", video.getId());
            videoMap.put("videoId", video.getVideoId());
            videoMap.put("videoTitle", video.getTitle());
            videoMap.put("channelName", video.getChannelTitle());
            videoMap.put("addedAt", video.getAddedAt());
            result.add(videoMap);
        }
        
        return ResponseEntity.ok(result);
    }

    // Get user's subscriptions (admin only)
    @GetMapping("/users/{userId}/subscriptions")
    public ResponseEntity<?> getUserSubscriptions(@PathVariable Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        List<YouTubeSubscription> subscriptions = youTubeSubscriptionRepository.findByUserOrderBySubscribedAtDesc(user);
        
        List<Map<String, Object>> subscriptionsList = new ArrayList<>();
        for (YouTubeSubscription subscription : subscriptions) {
            Map<String, Object> subscriptionMap = new HashMap<>();
            subscriptionMap.put("id", subscription.getId());
            subscriptionMap.put("channelId", subscription.getYoutubeChannelId());
            subscriptionMap.put("channelName", subscription.getChannelName());
            subscriptionMap.put("channelThumbnailUrl", subscription.getChannelThumbnailUrl());
            subscriptionMap.put("subscriberCount", subscription.getSubscriberCount());
            subscriptionMap.put("subscribedAt", subscription.getSubscribedAt());
            subscriptionMap.put("notificationEnabled", subscription.isNotificationEnabled());
            subscriptionsList.add(subscriptionMap);
        }
        
        return ResponseEntity.ok(subscriptionsList);
    }
} 