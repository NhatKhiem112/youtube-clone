package com.youtube.clone.backend.repository;

import com.youtube.clone.backend.model.Subscription;
import com.youtube.clone.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    // Find all channels a user has subscribed to
    List<Subscription> findBySubscriberOrderBySubscribedAtDesc(User subscriber);
    
    // Find all subscribers of a channel
    List<Subscription> findByChannelOrderBySubscribedAtDesc(User channel);
    
    // Check if a user is subscribed to a channel
    boolean existsBySubscriberAndChannel(User subscriber, User channel);
    
    // Find a specific subscription
    Optional<Subscription> findBySubscriberAndChannel(User subscriber, User channel);
    
    // Count subscribers for a channel
    long countByChannel(User channel);
    
    // Delete a subscription
    void deleteBySubscriberAndChannel(User subscriber, User channel);
} 