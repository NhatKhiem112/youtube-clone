package com.youtube.clone.backend.controllers;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/test/historycheck")
public class TestWatchHistoryController {
    
    private static final Logger logger = LoggerFactory.getLogger(TestWatchHistoryController.class);

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkStatus() {
        logger.info("Testing watch history status");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Watch History API is available");
        response.put("service", "watch-history");
        response.put("version", "1.0");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/endpoints")
    public ResponseEntity<Map<String, Object>> listEndpoints() {
        logger.info("Listing watch history endpoints");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("endpoints", new String[] {
            "GET /api/videos/history - Get watch history",
            "POST /api/videos/history - Add to watch history",
            "DELETE /api/videos/history/{videoId} - Remove from watch history",
            "DELETE /api/videos/history/clear - Clear watch history",
            "GET /api/videos/history/{videoId}/check - Check if video is in watch history"
        });
        
        return ResponseEntity.ok(response);
    }
} 