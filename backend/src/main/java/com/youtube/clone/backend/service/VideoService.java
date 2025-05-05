package com.youtube.clone.backend.service;

import com.youtube.clone.backend.model.Video;
import com.youtube.clone.backend.payload.request.VideoUploadRequest;
import com.youtube.clone.backend.payload.response.VideoResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VideoService {
    VideoResponse uploadVideo(MultipartFile videoFile, MultipartFile thumbnailFile, VideoUploadRequest videoUploadRequest, Long userId);
    
    List<VideoResponse> getAllVideos();
    
    List<VideoResponse> getUserVideos(Long userId);
    
    VideoResponse getVideoById(Long id);
    
    VideoResponse updateVideo(Long id, VideoUploadRequest videoUploadRequest);
    
    void deleteVideo(Long id);
    
    void updateVideoStatus(Long id, String status);
    
    List<VideoResponse> searchVideos(String keyword);
    
    VideoResponse convertToVideoResponse(Video video);
} 