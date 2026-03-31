package com.example.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {
    
    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Committees Management System API is running!");
        response.put("timestamp", LocalDateTime.now());
        response.put("swagger_ui", "http://localhost:8080/swagger-ui.html");
        response.put("api_docs", "http://localhost:8080/v3/api-docs");
        return response;
    }
    
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("application", "Committees-MS");
        return response;
    }
}