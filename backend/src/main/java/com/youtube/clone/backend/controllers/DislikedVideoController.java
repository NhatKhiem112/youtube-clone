package com.youtube.clone.backend.controllers;

import com.youtube.clone.backend.payload.request.DislikeVideoRequest;
import com.youtube.clone.backend.payload.response.DislikedVideoResponse;
import com.youtube.clone.backend.payload.response.MessageResponse;
import com.youtube.clone.backend.service.DislikedVideoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600, allowedHeaders = "*")
@RestController
@RequestMapping("/videos/dislikes")
public class DislikedVideoController {

    @Autowired
    private DislikedVideoService dislikedVideoService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<DislikedVideoResponse>> getDislikedVideos(@AuthenticationPrincipal UserDetails userDetails) {
        List<DislikedVideoResponse> dislikedVideos = dislikedVideoService.getDislikedVideos(userDetails.getUsername());
        return ResponseEntity.ok(dislikedVideos);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> dislikeVideo(@AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DislikeVideoRequest dislikeVideoRequest) {
        try {
            DislikedVideoResponse dislikedVideo = dislikedVideoService.dislikeVideo(userDetails.getUsername(), dislikeVideoRequest);
            return ResponseEntity.ok(dislikedVideo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{videoId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> undislikeVideo(@AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String videoId) {
        try {
            dislikedVideoService.undislikeVideo(userDetails.getUsername(), videoId);
            return ResponseEntity.ok(new MessageResponse("Video undisliked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/{videoId}/check")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> checkIfVideoDisliked(@AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String videoId) {
        boolean isDisliked = dislikedVideoService.isVideoDisliked(userDetails.getUsername(), videoId);
        return ResponseEntity.ok(isDisliked);
    }
} 