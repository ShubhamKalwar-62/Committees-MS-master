package com.example.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.EventFeedback;
import com.example.Response.ResponceBean;
import com.example.Service.EventFeedbackService;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/event-feedback")
@Tag(name = "Event Feedback Management", description = "APIs for managing event feedback and ratings")
public class EventFeedbackController {
    
    @Autowired
    private EventFeedbackService eventFeedbackService;

    @Autowired
    private ObjectMapper objectMapper;
    
    @GetMapping
    @Operation(summary = "Get all feedback", description = "Retrieve all event feedback")
    public ResponseEntity<ResponceBean<List<EventFeedback>>> getAllFeedback() {
        List<EventFeedback> feedbackList = eventFeedbackService.getAllFeedback();
        return ResponseEntity.ok(ResponceBean.success("Feedback retrieved successfully", feedbackList));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get feedback by ID", description = "Retrieve specific feedback by ID")
    public ResponseEntity<ResponceBean<EventFeedback>> getFeedbackById(@PathVariable Integer id) {
        Optional<EventFeedback> feedback = eventFeedbackService.getFeedbackById(id);
        if (feedback.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Feedback retrieved successfully", feedback.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Feedback not found"));
    }
    
    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get feedback by event", description = "Retrieve feedback by event ID")
    public ResponseEntity<ResponceBean<List<EventFeedback>>> getFeedbackByEvent(@PathVariable Integer eventId) {
        List<EventFeedback> feedbackList = eventFeedbackService.getFeedbackByEventId(eventId);
        return ResponseEntity.ok(ResponceBean.success("Feedback retrieved successfully", feedbackList));
    }
    
    @GetMapping("/event/{eventId}/average-rating")
    @Operation(summary = "Get average rating for event", description = "Get average rating for a specific event")
    public ResponseEntity<ResponceBean<Double>> getAverageRating(@PathVariable Integer eventId) {
        Double averageRating = eventFeedbackService.getAverageRatingForEvent(eventId);
        return ResponseEntity.ok(ResponceBean.success("Average rating retrieved successfully", averageRating));
    }
    
    @GetMapping("/rating/{rating}")
    @Operation(summary = "Get feedback by rating", description = "Retrieve feedback by specific rating")
    public ResponseEntity<ResponceBean<List<EventFeedback>>> getFeedbackByRating(@PathVariable Integer rating) {
        List<EventFeedback> feedbackList = eventFeedbackService.getFeedbackByRating(rating);
        return ResponseEntity.ok(ResponceBean.success("Feedback retrieved successfully", feedbackList));
    }
    
    @GetMapping("/min-rating/{minRating}")
    @Operation(summary = "Get feedback by minimum rating", description = "Retrieve feedback with rating greater than or equal to minimum")
    public ResponseEntity<ResponceBean<List<EventFeedback>>> getFeedbackByMinRating(@PathVariable Integer minRating) {
        List<EventFeedback> feedbackList = eventFeedbackService.getFeedbackByMinRating(minRating);
        return ResponseEntity.ok(ResponceBean.success("Feedback retrieved successfully", feedbackList));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search feedback by comments", description = "Search feedback by comments containing keyword")
    public ResponseEntity<ResponceBean<List<EventFeedback>>> searchFeedbackByComments(@RequestParam String keyword) {
        List<EventFeedback> feedbackList = eventFeedbackService.searchFeedbackByComments(keyword);
        return ResponseEntity.ok(ResponceBean.success("Feedback found", feedbackList));
    }
    
    @PostMapping
    @Operation(summary = "Submit feedback", description = "Submit new event feedback")
    public ResponseEntity<ResponceBean<EventFeedback>> submitFeedback(@RequestBody EventFeedback feedback) {
        EventFeedback savedFeedback = eventFeedbackService.saveFeedback(feedback);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Feedback submitted successfully", savedFeedback));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update feedback", description = "Update existing feedback")
    public ResponseEntity<ResponceBean<EventFeedback>> updateFeedback(@PathVariable Integer id, @RequestBody EventFeedback feedbackDetails) {
        EventFeedback updatedFeedback = eventFeedbackService.updateFeedback(id, feedbackDetails);
        if (updatedFeedback != null) {
            return ResponseEntity.ok(ResponceBean.success("Feedback updated successfully", updatedFeedback));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Feedback not found"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch feedback", description = "Partially update feedback")
    public ResponseEntity<ResponceBean<EventFeedback>> patchFeedback(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> updates) {
        Optional<EventFeedback> existing = eventFeedbackService.getFeedbackById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Feedback not found"));
        }
        try {
            updates.remove("feedbackId");
            updates.remove("submittedAt");
            EventFeedback patched = objectMapper.updateValue(existing.get(), updates);
            EventFeedback saved = eventFeedbackService.saveFeedback(patched);
            return ResponseEntity.ok(ResponceBean.success("Feedback patched successfully", saved));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete feedback", description = "Delete event feedback")
    public ResponseEntity<ResponceBean<String>> deleteFeedback(@PathVariable Integer id) {
        Optional<EventFeedback> feedback = eventFeedbackService.getFeedbackById(id);
        if (feedback.isPresent()) {
            eventFeedbackService.deleteFeedback(id);
            return ResponseEntity.ok(ResponceBean.success("Feedback deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Feedback not found"));
    }
}