package com.youtube.clone.backend.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.model.YouTubeSubscription;
import com.youtube.clone.backend.payload.request.YouTubeChannelRequest;
import com.youtube.clone.backend.payload.response.MessageResponse;
import com.youtube.clone.backend.repository.UserRepository;
import com.youtube.clone.backend.repository.YouTubeSubscriptionRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/youtube-subscriptions")
public class YouTubeSubscriptionController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private YouTubeSubscriptionRepository youtubeSubscriptionRepository;

    // Subscribe to a YouTube channel
    @PostMapping("/subscribe/{youtubeChannelId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> subscribeToYoutubeChannel(@PathVariable String youtubeChannelId, 
                                                     @RequestBody(required = false) YouTubeChannelRequest channelData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Check if already subscribed
        if (youtubeSubscriptionRepository.existsByUserAndYoutubeChannelId(user, youtubeChannelId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Already subscribed to this channel"));
        }
        
        // Create subscription
        YouTubeSubscription subscription;
        if (channelData != null) {
            subscription = new YouTubeSubscription(user, youtubeChannelId, 
                                                 channelData.getChannelName(), 
                                                 channelData.getChannelThumbnailUrl());
            subscription.setSubscriberCount(channelData.getSubscriberCount());
        } else {
            subscription = new YouTubeSubscription(user, youtubeChannelId);
        }
        
        youtubeSubscriptionRepository.save(subscription);
        
        return ResponseEntity.ok(new MessageResponse("Subscribed successfully"));
    }
    
    // Unsubscribe from a YouTube channel
    @DeleteMapping("/unsubscribe/{youtubeChannelId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> unsubscribeFromYoutubeChannel(@PathVariable String youtubeChannelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Check if not subscribed
        if (!youtubeSubscriptionRepository.existsByUserAndYoutubeChannelId(user, youtubeChannelId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Not subscribed to this channel"));
        }
        
        // Delete subscription
        youtubeSubscriptionRepository.deleteByUserAndYoutubeChannelId(user, youtubeChannelId);
        
        return ResponseEntity.ok(new MessageResponse("Unsubscribed successfully"));
    }
    
    // Get subscription status for a YouTube channel
    @GetMapping("/status/{youtubeChannelId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getYoutubeSubscriptionStatus(@PathVariable String youtubeChannelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        boolean isSubscribed = youtubeSubscriptionRepository.existsByUserAndYoutubeChannelId(user, youtubeChannelId);
        
        // Get subscriber count
        long subscriberCount = 0;
        if (isSubscribed) {
            YouTubeSubscription subscription = youtubeSubscriptionRepository.findByUserAndYoutubeChannelId(user, youtubeChannelId)
                    .orElse(null);
            if (subscription != null && subscription.getSubscriberCount() != null) {
                subscriberCount = subscription.getSubscriberCount();
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("subscribed", isSubscribed);
        response.put("subscriberCount", subscriberCount);
        
        return ResponseEntity.ok(response);
    }
    
    // Get list of subscribed YouTube channels
    @GetMapping("/my-youtube-subscriptions")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyYoutubeSubscriptions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        List<YouTubeSubscription> subscriptions = youtubeSubscriptionRepository.findByUserOrderBySubscribedAtDesc(user);
        
        List<Map<String, Object>> channels = subscriptions.stream().map(subscription -> {
            Map<String, Object> channelData = new HashMap<>();
            channelData.put("id", subscription.getYoutubeChannelId());
            channelData.put("username", subscription.getChannelName());
            channelData.put("profileImageUrl", subscription.getChannelThumbnailUrl());
            channelData.put("subscriberCount", subscription.getSubscriberCount());
            channelData.put("notificationEnabled", subscription.isNotificationEnabled());
            channelData.put("subscribedAt", subscription.getSubscribedAt());
            return channelData;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(channels);
    }
    
    // Toggle notification for a YouTube channel
    @PutMapping("/notification/{youtubeChannelId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> toggleYoutubeNotification(@PathVariable String youtubeChannelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        YouTubeSubscription subscription = youtubeSubscriptionRepository.findByUserAndYoutubeChannelId(user, youtubeChannelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        
        // Toggle notification
        boolean newNotificationState = !subscription.isNotificationEnabled();
        subscription.setNotificationEnabled(newNotificationState);
        youtubeSubscriptionRepository.save(subscription);
        
        Map<String, Object> response = new HashMap<>();
        response.put("notificationEnabled", newNotificationState);
        
        return ResponseEntity.ok(response);
    }

    // Simple test endpoint to verify controller is working
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "YouTube Subscription controller is working!");
        return ResponseEntity.ok(response);
    }
} 