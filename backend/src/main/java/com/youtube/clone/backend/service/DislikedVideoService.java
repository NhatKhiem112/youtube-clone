package com.youtube.clone.backend.service;

import com.youtube.clone.backend.model.DislikedVideo;
import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.payload.request.DislikeVideoRequest;
import com.youtube.clone.backend.payload.response.DislikedVideoResponse;
import com.youtube.clone.backend.repository.DislikedVideoRepository;
import com.youtube.clone.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DislikedVideoService {

    @Autowired
    private DislikedVideoRepository dislikedVideoRepository;

    @Autowired
    private UserRepository userRepository;

    public List<DislikedVideoResponse> getDislikedVideos(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        List<DislikedVideo> dislikedVideos = dislikedVideoRepository.findByUserOrderByDislikedAtDesc(user);

        return dislikedVideos.stream()
                .map(this::mapToDislikedVideoResponse)
                .collect(Collectors.toList());
    }

    public DislikedVideoResponse dislikeVideo(String username, DislikeVideoRequest dislikeVideoRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        // Check if already disliked
        if (dislikedVideoRepository.existsByUserAndVideoId(user, dislikeVideoRequest.getVideoId())) {
            throw new RuntimeException("Video already disliked");
        }

        DislikedVideo dislikedVideo = new DislikedVideo(
                user,
                dislikeVideoRequest.getVideoId(),
                dislikeVideoRequest.getTitle(),
                dislikeVideoRequest.getDescription(),
                dislikeVideoRequest.getThumbnailUrl(),
                dislikeVideoRequest.getChannelTitle());

        dislikedVideo = dislikedVideoRepository.save(dislikedVideo);
        return mapToDislikedVideoResponse(dislikedVideo);
    }

    @Transactional
    public void undislikeVideo(String username, String videoId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        dislikedVideoRepository.deleteByUserAndVideoId(user, videoId);
    }

    public boolean isVideoDisliked(String username, String videoId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return dislikedVideoRepository.existsByUserAndVideoId(user, videoId);
    }

    private DislikedVideoResponse mapToDislikedVideoResponse(DislikedVideo dislikedVideo) {
        return new DislikedVideoResponse(
                dislikedVideo.getId(),
                dislikedVideo.getVideoId(),
                dislikedVideo.getTitle(),
                dislikedVideo.getDescription(),
                dislikedVideo.getThumbnailUrl(),
                dislikedVideo.getChannelTitle(),
                dislikedVideo.getDislikedAt());
    }
} 