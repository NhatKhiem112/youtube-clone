package com.youtube.clone.backend.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = {"com.youtube.clone.backend.controllers"})
public class ControllerConfig {
    // This class ensures that all controllers are properly scanned and mapped
} 