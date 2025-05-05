package com.youtube.clone.backend.service;

import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.model.Video;
import com.youtube.clone.backend.payload.request.VideoUploadRequest;
import com.youtube.clone.backend.payload.response.VideoResponse;
import com.youtube.clone.backend.repository.UserRepository;
import com.youtube.clone.backend.repository.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VideoServiceImpl implements VideoService {
    private static final Logger logger = LoggerFactory.getLogger(VideoServiceImpl.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public VideoResponse uploadVideo(MultipartFile videoFile, MultipartFile thumbnailFile, 
                                     VideoUploadRequest videoUploadRequest, Long userId) {
        try {
            // Create upload directory if it doesn't exist
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Get user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Generate unique filenames
            String videoFileName = UUID.randomUUID().toString() + "_" + videoFile.getOriginalFilename();
            String thumbnailFileName = null;
            
            if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
                thumbnailFileName = UUID.randomUUID().toString() + "_" + thumbnailFile.getOriginalFilename();
            }

            // Save files to disk
            Path videoPath = Paths.get(uploadDir + videoFileName);
            Files.copy(videoFile.getInputStream(), videoPath);
            
            String thumbnailUrl = null;
            if (thumbnailFileName != null) {
                Path thumbnailPath = Paths.get(uploadDir + thumbnailFileName);
                Files.copy(thumbnailFile.getInputStream(), thumbnailPath);
                thumbnailUrl = "/videos/thumbnail/" + thumbnailFileName;
            }

            // Create video entity
            Video video = new Video(
                videoUploadRequest.getTitle(),
                videoUploadRequest.getDescription(),
                "/videos/stream/" + videoFileName,
                thumbnailUrl,
                videoFileName,
                videoFile.getContentType(),
                videoFile.getSize(),
                user
            );
            
            video.setStatus(videoUploadRequest.getStatus());
            
            // Save video to database
            Video savedVideo = videoRepository.save(video);
            
            // Convert to response
            return convertToVideoResponse(savedVideo);
        } catch (IOException e) {
            logger.error("Failed to upload video", e);
            throw new RuntimeException("Failed to upload video: " + e.getMessage());
        }
    }

    @Override
    public List<VideoResponse> getAllVideos() {
        return videoRepository.findAllPublicVideos().stream()
                .map(this::convertToVideoResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VideoResponse> getUserVideos(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return videoRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::convertToVideoResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VideoResponse getVideoById(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        return convertToVideoResponse(video);
    }

    @Override
    public VideoResponse updateVideo(Long id, VideoUploadRequest videoUploadRequest) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        video.setTitle(videoUploadRequest.getTitle());
        video.setDescription(videoUploadRequest.getDescription());
        video.setStatus(videoUploadRequest.getStatus());
        
        Video updatedVideo = videoRepository.save(video);
        
        return convertToVideoResponse(updatedVideo);
    }

    @Override
    public void deleteVideo(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        // Delete video file
        try {
            Files.deleteIfExists(Paths.get(uploadDir + video.getVideoFileName()));
            
            // Delete thumbnail if exists
            if (video.getThumbnailUrl() != null) {
                String thumbnailFileName = video.getThumbnailUrl().substring(video.getThumbnailUrl().lastIndexOf("/") + 1);
                Files.deleteIfExists(Paths.get(uploadDir + thumbnailFileName));
            }
        } catch (IOException e) {
            logger.error("Failed to delete video file", e);
        }
        
        videoRepository.delete(video);
    }

    @Override
    public void updateVideoStatus(Long id, String status) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        video.setStatus(status);
        videoRepository.save(video);
    }

    @Override
    public List<VideoResponse> searchVideos(String keyword) {
        return videoRepository.searchVideos(keyword).stream()
                .map(this::convertToVideoResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public VideoResponse convertToVideoResponse(Video video) {
        VideoResponse response = new VideoResponse();
        response.setId(video.getId());
        response.setTitle(video.getTitle());
        response.setDescription(video.getDescription());
        response.setVideoUrl(video.getVideoUrl());
        response.setThumbnailUrl(video.getThumbnailUrl());
        response.setUsername(video.getUser().getUsername());
        response.setStatus(video.getStatus());
        response.setViewCount(video.getViewCount());
        response.setLikeCount(video.getLikeCount());
        response.setDislikeCount(video.getDislikeCount());
        response.setDuration(video.getDuration());
        response.setCreatedAt(video.getCreatedAt());
        response.setUpdatedAt(video.getUpdatedAt());
        return response;
    }
} 