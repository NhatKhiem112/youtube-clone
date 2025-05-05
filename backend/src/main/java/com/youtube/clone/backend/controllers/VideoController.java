package com.youtube.clone.backend.controllers;

import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.model.Video;
import com.youtube.clone.backend.payload.request.VideoUploadRequest;
import com.youtube.clone.backend.payload.response.MessageResponse;
import com.youtube.clone.backend.payload.response.VideoResponse;
import com.youtube.clone.backend.repository.UserRepository;
import com.youtube.clone.backend.repository.VideoRepository;
import com.youtube.clone.backend.security.jwt.JwtUtils;
import com.youtube.clone.backend.security.services.UserDetailsImpl;
import com.youtube.clone.backend.service.VideoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.youtube.clone.backend.model.ERole;

@CrossOrigin(origins = "*", maxAge = 3600, allowedHeaders = "*")
@RestController
@RequestMapping("/videos")
public class VideoController {
    private static final Logger logger = LoggerFactory.getLogger(VideoController.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private VideoService videoService;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("video") MultipartFile videoFile,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "status", defaultValue = "PUBLIC") String status,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            logger.info("Uploading video: {} for user: {}", title, userDetails.getUsername());
            
            VideoUploadRequest videoUploadRequest = new VideoUploadRequest();
            videoUploadRequest.setTitle(title);
            videoUploadRequest.setDescription(description);
            videoUploadRequest.setStatus(status);
            
            VideoResponse videoResponse = videoService.uploadVideo(
                    videoFile, thumbnailFile, videoUploadRequest, userDetails.getId());
            
            return ResponseEntity.ok(videoResponse);
        } catch (Exception e) {
            logger.error("Failed to upload video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to upload video: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<VideoResponse>> getAllVideos() {
        List<VideoResponse> videos = videoService.getAllVideos();
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<VideoResponse>> getUserVideos(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<VideoResponse> videos = videoService.getUserVideos(userDetails.getId());
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VideoResponse> getVideoById(@PathVariable Long id) {
        VideoResponse video = videoService.getVideoById(id);
        return ResponseEntity.ok(video);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateVideo(
            @PathVariable Long id,
            @RequestBody VideoUploadRequest videoUploadRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            // Check if user owns the video or is admin
            User user = userRepository.findById(userDetails.getId()).orElseThrow();
            VideoResponse video = videoService.getVideoById(id);
            
            if (!video.getUsername().equals(userDetails.getUsername()) && 
                !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("You don't have permission to update this video"));
            }
            
            VideoResponse updatedVideo = videoService.updateVideo(id, videoUploadRequest);
            return ResponseEntity.ok(updatedVideo);
        } catch (Exception e) {
            logger.error("Failed to update video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to update video: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/thumbnail")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateThumbnail(
            @PathVariable Long id,
            @RequestParam("thumbnail") MultipartFile thumbnailFile,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            // Check if user owns the video or is admin
            User user = userRepository.findById(userDetails.getId()).orElseThrow();
            Video video = videoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Video not found"));
            
            if (!video.getUser().getId().equals(userDetails.getId()) && 
                !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("You don't have permission to update this video"));
            }
            
            // Generate unique filename for thumbnail
            String thumbnailFileName = UUID.randomUUID().toString() + "_" + thumbnailFile.getOriginalFilename();
            Path thumbnailPath = Paths.get(uploadDir + thumbnailFileName);
            
            // Save new thumbnail
            Files.copy(thumbnailFile.getInputStream(), thumbnailPath);
            
            // Delete old thumbnail if exists
            if (video.getThumbnailUrl() != null && !video.getThumbnailUrl().isEmpty()) {
                String oldThumbnailFilename = video.getThumbnailUrl().substring(video.getThumbnailUrl().lastIndexOf("/") + 1);
                try {
                    Files.deleteIfExists(Paths.get(uploadDir + oldThumbnailFilename));
                } catch (IOException e) {
                    logger.warn("Could not delete old thumbnail: {}", e.getMessage());
                }
            }
            
            // Update video with new thumbnail URL
            video.setThumbnailUrl("/videos/thumbnail/" + thumbnailFileName);
            Video updatedVideo = videoRepository.save(video);
            
            return ResponseEntity.ok(videoService.convertToVideoResponse(updatedVideo));
        } catch (Exception e) {
            logger.error("Failed to update thumbnail", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to update thumbnail: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteVideo(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        try {
            // Check if user owns the video or is admin
            User user = userRepository.findById(userDetails.getId()).orElseThrow();
            VideoResponse video = videoService.getVideoById(id);
            
            if (!video.getUsername().equals(userDetails.getUsername()) && 
                !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("You don't have permission to delete this video"));
            }
            
            videoService.deleteVideo(id);
            return ResponseEntity.ok(new MessageResponse("Video deleted successfully"));
        } catch (Exception e) {
            logger.error("Failed to delete video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to delete video: " + e.getMessage()));
        }
    }

    @GetMapping("/stream/{fileName}")
    public ResponseEntity<Resource> streamVideo(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir + fileName);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"");
                
                // Set content type based on file extension
                if (fileName.endsWith(".mp4")) {
                    headers.setContentType(MediaType.parseMediaType("video/mp4"));
                } else if (fileName.endsWith(".webm")) {
                    headers.setContentType(MediaType.parseMediaType("video/webm"));
                } else {
                    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                }
                
                return ResponseEntity.ok()
                        .headers(headers)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            logger.error("Failed to stream video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/thumbnail/{fileName}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir + fileName);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"");
                
                // Set content type based on file extension
                if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                    headers.setContentType(MediaType.IMAGE_JPEG);
                } else if (fileName.endsWith(".png")) {
                    headers.setContentType(MediaType.IMAGE_PNG);
                } else {
                    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                }
                
                return ResponseEntity.ok()
                        .headers(headers)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            logger.error("Failed to get thumbnail", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<VideoResponse>> searchVideos(@RequestParam String keyword) {
        List<VideoResponse> videos = videoService.searchVideos(keyword);
        return ResponseEntity.ok(videos);
    }

    // Get moderation status
    @GetMapping("/{id}/moderation")
    public ResponseEntity<?> getModerationStatus(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        try {
            // Validate user
            String username = jwtUtils.getUserNameFromJwtToken(token.replace("Bearer ", ""));
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Unauthorized"));
            }
            
            // Get user
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get video
            Optional<Video> videoOpt = videoRepository.findById(id);
            if (!videoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Video video = videoOpt.get();
            
            // Check ownership
            if (!video.getUser().getId().equals(user.getId()) && 
                !user.getRoles().stream().anyMatch(role -> role.getName() == ERole.ROLE_ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Not owner of this video"));
            }
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("status", video.getStatus());
            response.put("updatedAt", video.getUpdatedAt());
            
            // Add reviewer info if available
            if (video.getReviewedBy() != null) {
                response.put("reviewedBy", video.getReviewedBy());
            }
            
            // Add rejection comment if available
            if (video.getRejectionReason() != null) {
                response.put("comment", video.getRejectionReason());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting moderation status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to get moderation status: " + e.getMessage()));
        }
    }
    
    // Resubmit a video for review
    @PostMapping("/{id}/resubmit")
    public ResponseEntity<?> resubmitForReview(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        try {
            // Validate user
            String username = jwtUtils.getUserNameFromJwtToken(token.replace("Bearer ", ""));
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Unauthorized"));
            }
            
            // Get user
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get video
            Optional<Video> videoOpt = videoRepository.findById(id);
            if (!videoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Video video = videoOpt.get();
            
            // Check ownership
            if (!video.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Not owner of this video"));
            }
            
            // Check if video was rejected or can be resubmitted
            if (!video.getStatus().equals("REJECTED")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Video is not in REJECTED state"));
            }
            
            // Update to pending review
            video.setStatus("PENDING_REVIEW");
            video.setRejectionReason(null); // Clear previous rejection reason
            video.setReviewedBy(null); // Clear previous reviewer
            video.setUpdatedAt(LocalDateTime.now());
            
            videoRepository.save(video);
            
            VideoResponse videoResponse = videoService.convertToVideoResponse(video);
            return ResponseEntity.ok(videoResponse);
        } catch (Exception e) {
            logger.error("Error resubmitting video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to resubmit video: " + e.getMessage()));
        }
    }
} 