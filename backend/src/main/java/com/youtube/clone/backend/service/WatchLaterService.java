package com.youtube.clone.backend.service;

import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.model.WatchLaterVideo;
import com.youtube.clone.backend.payload.request.WatchLaterRequest;
import com.youtube.clone.backend.payload.response.WatchLaterResponse;
import com.youtube.clone.backend.repository.UserRepository;
import com.youtube.clone.backend.repository.WatchLaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchLaterService {

    @Autowired
    private WatchLaterRepository watchLaterRepository;

    @Autowired
    private UserRepository userRepository;

    public List<WatchLaterResponse> getWatchLaterVideos(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return watchLaterRepository.findByUserOrderByAddedAtDesc(user)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WatchLaterResponse addToWatchLater(String username, WatchLaterRequest watchLaterRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if video already exists in watch later
        if (watchLaterRepository.existsByUserAndVideoId(user, watchLaterRequest.getVideoId())) {
            throw new RuntimeException("Video already in Watch Later");
        }

        WatchLaterVideo watchLaterVideo = new WatchLaterVideo(
                user,
                watchLaterRequest.getVideoId(),
                watchLaterRequest.getTitle(),
                watchLaterRequest.getDescription(),
                watchLaterRequest.getThumbnailUrl(),
                watchLaterRequest.getChannelTitle()
        );

        WatchLaterVideo savedVideo = watchLaterRepository.save(watchLaterVideo);
        return convertToResponse(savedVideo);
    }

    @Transactional
    public void removeFromWatchLater(String username, String videoId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!watchLaterRepository.existsByUserAndVideoId(user, videoId)) {
            throw new RuntimeException("Video not found in Watch Later");
        }

        watchLaterRepository.deleteByUserAndVideoId(user, videoId);
    }

    public boolean isVideoInWatchLater(String username, String videoId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return watchLaterRepository.existsByUserAndVideoId(user, videoId);
    }

    private WatchLaterResponse convertToResponse(WatchLaterVideo watchLaterVideo) {
        return new WatchLaterResponse(
                watchLaterVideo.getId(),
                watchLaterVideo.getVideoId(),
                watchLaterVideo.getTitle(),
                watchLaterVideo.getDescription(),
                watchLaterVideo.getThumbnailUrl(),
                watchLaterVideo.getChannelTitle(),
                watchLaterVideo.getAddedAt()
        );
    }

    public List<WatchLaterResponse> getWatchLaterVideosByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        return watchLaterRepository.findByUserOrderByAddedAtDesc(user)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
} 