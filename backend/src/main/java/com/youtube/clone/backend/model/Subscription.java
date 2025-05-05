package com.youtube.clone.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"subscriber_id", "channel_id"})
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscriber_id", nullable = false)
    private User subscriber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private User channel;

    private boolean notificationEnabled = true;

    @CreationTimestamp
    private LocalDateTime subscribedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Subscription(User subscriber, User channel) {
        this.subscriber = subscriber;
        this.channel = channel;
    }

    public Subscription(User subscriber, User channel, boolean notificationEnabled) {
        this.subscriber = subscriber;
        this.channel = channel;
        this.notificationEnabled = notificationEnabled;
    }
} 