package com.youtube.clone.backend.controllers;

import com.youtube.clone.backend.model.Subscription;
import com.youtube.clone.backend.model.User;
import com.youtube.clone.backend.payload.response.MessageResponse;
import com.youtube.clone.backend.repository.SubscriptionRepository;
import com.youtube.clone.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    // Subscribe to a channel
    @PostMapping("/subscribe/{channelId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> subscribeToChannel(@PathVariable Long channelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User subscriber = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        User channel = userRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        
        // Check if subscriber is same as channel
        if (subscriber.getId().equals(channel.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("You cannot subscribe to your own channel"));
        }
        
        // Check if already subscribed
        if (subscriptionRepository.existsBySubscriberAndChannel(subscriber, channel)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Already subscribed to this channel"));
        }
        
        // Create new subscription
        Subscription subscription = new Subscription(subscriber, channel);
        subscriptionRepository.save(subscription);
        
        // Update subscriber count
        long subscriberCount = subscriptionRepository.countByChannel(channel);
        channel.setSubscriberCount(subscriberCount);
        userRepository.save(channel);
        
        return ResponseEntity.ok(new MessageResponse("Subscribed successfully"));
    }
    
    // Unsubscribe from a channel
    @DeleteMapping("/unsubscribe/{channelId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> unsubscribeFromChannel(@PathVariable Long channelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User subscriber = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        User channel = userRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        
        // Check if not subscribed
        if (!subscriptionRepository.existsBySubscriberAndChannel(subscriber, channel)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Not subscribed to this channel"));
        }
        
        // Delete subscription
        subscriptionRepository.deleteBySubscriberAndChannel(subscriber, channel);
        
        // Update subscriber count
        long subscriberCount = subscriptionRepository.countByChannel(channel);
        channel.setSubscriberCount(subscriberCount);
        userRepository.save(channel);
        
        return ResponseEntity.ok(new MessageResponse("Unsubscribed successfully"));
    }
    
    // Get subscription status for a channel
    @GetMapping("/status/{channelId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getSubscriptionStatus(@PathVariable Long channelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User subscriber = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        User channel = userRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        
        boolean isSubscribed = subscriptionRepository.existsBySubscriberAndChannel(subscriber, channel);
        
        Map<String, Object> response = new HashMap<>();
        response.put("subscribed", isSubscribed);
        response.put("subscriberCount", channel.getSubscriberCount());
        
        return ResponseEntity.ok(response);
    }
    
    // Get list of subscribed channels
    @GetMapping("/my-subscriptions")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getMySubscriptions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User subscriber = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        List<Subscription> subscriptions = subscriptionRepository.findBySubscriberOrderBySubscribedAtDesc(subscriber);
        
        List<Map<String, Object>> channels = subscriptions.stream().map(subscription -> {
            User channel = subscription.getChannel();
            Map<String, Object> channelData = new HashMap<>();
            channelData.put("id", channel.getId());
            channelData.put("username", channel.getUsername());
            channelData.put("profileImageUrl", channel.getProfileImageUrl());
            channelData.put("subscriberCount", channel.getSubscriberCount());
            channelData.put("notificationEnabled", subscription.isNotificationEnabled());
            channelData.put("subscribedAt", subscription.getSubscribedAt());
            return channelData;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(channels);
    }
    
    // Toggle notification for a channel
    @PutMapping("/notification/{channelId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> toggleNotification(@PathVariable Long channelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        
        User subscriber = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        User channel = userRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        
        Subscription subscription = subscriptionRepository.findBySubscriberAndChannel(subscriber, channel)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        
        // Toggle notification
        boolean newNotificationState = !subscription.isNotificationEnabled();
        subscription.setNotificationEnabled(newNotificationState);
        subscriptionRepository.save(subscription);
        
        Map<String, Object> response = new HashMap<>();
        response.put("notificationEnabled", newNotificationState);
        
        return ResponseEntity.ok(response);
    }
} 