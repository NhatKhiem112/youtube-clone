package com.youtube.clone.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Use suffix pattern match only when there's a file extension
        configurer.setUseSuffixPatternMatch(false);
        // Make sure paths are case-sensitive
        configurer.setUseTrailingSlashMatch(false);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Explicitly define static resource mappings
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        
        // Add other resource handlers if needed
    }
} 