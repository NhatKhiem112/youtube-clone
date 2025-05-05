package com.youtube.clone.backend.controllers;

import com.youtube.clone.backend.payload.request.WatchLaterRequest;
import com.youtube.clone.backend.payload.response.MessageResponse;
import com.youtube.clone.backend.payload.response.WatchLaterResponse;
import com.youtube.clone.backend.service.WatchLaterService;
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
@RequestMapping("/videos/watchlater")
public class WatchLaterController {

    @Autowired
    private WatchLaterService watchLaterService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<WatchLaterResponse>> getWatchLaterVideos(@AuthenticationPrincipal UserDetails userDetails) {
        List<WatchLaterResponse> watchLaterVideos = watchLaterService.getWatchLaterVideos(userDetails.getUsername());
        return ResponseEntity.ok(watchLaterVideos);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addToWatchLater(@AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WatchLaterRequest watchLaterRequest) {
        try {
            WatchLaterResponse watchLaterVideo = watchLaterService.addToWatchLater(userDetails.getUsername(), watchLaterRequest);
            return ResponseEntity.ok(watchLaterVideo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{videoId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> removeFromWatchLater(@AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String videoId) {
        try {
            watchLaterService.removeFromWatchLater(userDetails.getUsername(), videoId);
            return ResponseEntity.ok(new MessageResponse("Video removed from Watch Later successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/{videoId}/check")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> checkIfVideoInWatchLater(@AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String videoId) {
        boolean isInWatchLater = watchLaterService.isVideoInWatchLater(userDetails.getUsername(), videoId);
        return ResponseEntity.ok(isInWatchLater);
    }

    /* Commented out to avoid conflict with UserVideoController
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getWatchLaterVideosByUserId(@PathVariable Long userId) {
        try {
            List<WatchLaterResponse> watchLaterVideos = watchLaterService.getWatchLaterVideosByUserId(userId);
            return ResponseEntity.ok(watchLaterVideos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
    */
} 