package com.youtube.clone.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "youtube_subscriptions", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id", "youtube_channel_id"})
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class YouTubeSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "youtube_channel_id", nullable = false)
    private String youtubeChannelId;
    
    @Column(name = "channel_name")
    private String channelName;
    
    @Column(name = "channel_thumbnail_url")
    private String channelThumbnailUrl;
    
    @Column(name = "subscriber_count")
    private Long subscriberCount;

    private boolean notificationEnabled = true;

    @CreationTimestamp
    private LocalDateTime subscribedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public YouTubeSubscription(User user, String youtubeChannelId) {
        this.user = user;
        this.youtubeChannelId = youtubeChannelId;
    }

    public YouTubeSubscription(User user, String youtubeChannelId, String channelName, String channelThumbnailUrl) {
        this.user = user;
        this.youtubeChannelId = youtubeChannelId;
        this.channelName = channelName;
        this.channelThumbnailUrl = channelThumbnailUrl;
    }
} 