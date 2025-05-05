package com.youtube.clone.backend.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/all")
    public Map<String, String> allAccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Public Content.");
        return response;
    }

    @GetMapping("/watch-history-test")
    public Map<String, Object> watchHistoryTest() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This is a test endpoint for watch history API");
        response.put("endpoint", "/api/videos/history");
        response.put("methods", new String[]{"GET", "POST", "DELETE"});
        response.put("test", true);
        return response;
    }
} 