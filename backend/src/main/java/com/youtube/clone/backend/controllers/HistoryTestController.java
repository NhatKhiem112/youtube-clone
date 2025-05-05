package com.youtube.clone.backend.controllers;

import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.model.WatchedVideo;
import com.youtube.clone.backend.repository.UserRepository;
import com.youtube.clone.backend.repository.WatchedVideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/test/history")
public class HistoryTestController {

    @Autowired
    private WatchedVideoRepository watchedVideoRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        return ResponseEntity.ok(Collections.singletonMap("status", "History API is operational"));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addTestVideo(@RequestParam Long userId, @RequestBody Map<String, String> videoData) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "User not found"));
            }

            User user = userOpt.get();
            String videoId = videoData.get("videoId");
            String title = videoData.get("title");
            String description = videoData.get("description");
            String thumbnailUrl = videoData.get("thumbnailUrl");
            String channelTitle = videoData.get("channelTitle");

            // Kiểm tra xem video đã tồn tại trong lịch sử chưa
            Optional<WatchedVideo> existingVideo = watchedVideoRepository.findByUserAndVideoId(user, videoId);

            if (existingVideo.isPresent()) {
                // Nếu đã tồn tại, cập nhật lần xem gần nhất và tăng số lần xem
                WatchedVideo watchedVideo = existingVideo.get();
                watchedVideo.setLastWatchedAt(LocalDateTime.now());
                watchedVideo.setWatchCount(watchedVideo.getWatchCount() + 1);
                // Cập nhật thông tin video nếu có thay đổi
                watchedVideo.setTitle(title);
                watchedVideo.setDescription(description);
                watchedVideo.setThumbnailUrl(thumbnailUrl);
                watchedVideo.setChannelTitle(channelTitle);
                
                return ResponseEntity.ok(watchedVideoRepository.save(watchedVideo));
            } else {
                // Nếu chưa tồn tại, thêm mới vào lịch sử
                WatchedVideo watchedVideo = new WatchedVideo(
                        user, videoId, title, description, thumbnailUrl, channelTitle);
                
                return ResponseEntity.ok(watchedVideoRepository.save(watchedVideo));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getHistoryList(@RequestParam Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "User not found"));
            }

            User user = userOpt.get();
            List<WatchedVideo> watchedVideos = watchedVideoRepository.findByUserOrderByLastWatchedAtDesc(user);
            return ResponseEntity.ok(watchedVideos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
} 