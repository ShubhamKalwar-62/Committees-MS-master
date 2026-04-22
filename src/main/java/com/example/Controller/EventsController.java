package com.example.Controller;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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

import com.example.Entity.Committee;
import com.example.Entity.EventCategory;
import com.example.Entity.Events;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.CommitteeRepository;
import com.example.Repository.EventCategoryRepository;
import com.example.Response.ResponceBean;
import com.example.Service.EventsService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Event Management", description = "APIs for managing events")
public class EventsController {
    
    @Autowired
    private EventsService eventsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CommitteeRepository committeeRepository;

    @Autowired
    private EventCategoryRepository eventCategoryRepository;
    
    @GetMapping
    @Operation(summary = "Get all events", description = "Retrieve all events")
    public ResponseEntity<ResponceBean<List<Events>>> getAllEvents() {
        List<Events> events = eventsService.getAllEvents();
        return ResponseEntity.ok(ResponceBean.success("Events retrieved successfully", events));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get event by ID", description = "Retrieve a specific event by ID")
    public ResponseEntity<ResponceBean<Events>> getEventById(@PathVariable Integer id) {
        Optional<Events> event = eventsService.getEventById(id);
        if (event.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Event retrieved successfully", event.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Event not found"));
    }
    
    @GetMapping("/committee/{committeeId}")
    @Operation(summary = "Get events by committee", description = "Retrieve events by committee ID")
    public ResponseEntity<ResponceBean<List<Events>>> getEventsByCommittee(@PathVariable Integer committeeId) {
        List<Events> events = eventsService.getEventsByCommitteeId(committeeId);
        return ResponseEntity.ok(ResponceBean.success("Events retrieved successfully", events));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get events by status", description = "Retrieve events by status")
    public ResponseEntity<ResponceBean<List<Events>>> getEventsByStatus(@PathVariable Events.EventStatus status) {
        List<Events> events = eventsService.getEventsByStatus(status);
        return ResponseEntity.ok(ResponceBean.success("Events retrieved successfully", events));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search events by name", description = "Search events by name containing keyword")
    public ResponseEntity<ResponceBean<List<Events>>> searchEventsByName(@RequestParam String name) {
        List<Events> events = eventsService.getEventsByNameContaining(name);
        return ResponseEntity.ok(ResponceBean.success("Events found", events));
    }
    
    @GetMapping("/date-range")
    @Operation(summary = "Get events by date range", description = "Retrieve events between start and end dates")
    public ResponseEntity<ResponceBean<List<Events>>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Events> events = eventsService.getEventsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(ResponceBean.success("Events retrieved successfully", events));
    }
    
    @PostMapping
    @Operation(summary = "Create new event", description = "Create a new event")
    public ResponseEntity<ResponceBean<Events>> createEvent(@RequestBody EventCreateRequest request) {
        try {
            Integer committeeId = request.resolveCommitteeId();
            if (committeeId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponceBean.error("committeeId is required"));
            }

            Committee committee = committeeRepository.findById(committeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Committee not found with id: " + committeeId));

            EventCategory category = null;
            Integer categoryId = request.resolveCategoryId();
            if (categoryId != null) {
                category = eventCategoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResourceNotFoundException("Event category not found with id: " + categoryId));
            }

            if (request.getEventName() == null || request.getEventName().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponceBean.error("eventName is required"));
            }

            Events event = new Events();
            event.setEventName(request.getEventName().trim());
            event.setDescription(request.getDescription());
            event.setEventDate(parseEventDate(request.getEventDate()));
            event.setLocation(request.resolveLocation());
            event.setStatus(parseEventStatus(request.getStatus()));
            event.setMaxParticipants(request.getMaxParticipants());
            event.setCommittee(committee);
            event.setCategory(category);

            Events savedEvent = eventsService.saveEvent(event);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ResponceBean.success("Event created successfully", savedEvent));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid event payload", ex.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update event", description = "Update an existing event")
    public ResponseEntity<ResponceBean<Events>> updateEvent(@PathVariable Integer id, @RequestBody Events eventDetails) {
        Events updatedEvent = eventsService.updateEvent(id, eventDetails);
        if (updatedEvent != null) {
            return ResponseEntity.ok(ResponceBean.success("Event updated successfully", updatedEvent));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Event not found"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch event", description = "Partially update an event")
    public ResponseEntity<ResponceBean<Events>> patchEvent(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> updates) {
        Optional<Events> existing = eventsService.getEventById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Event not found"));
        }
        try {
            updates.remove("eventId");
            updates.remove("createdAt");
            Events patched = objectMapper.updateValue(existing.get(), updates);
            Events saved = eventsService.saveEvent(patched);
            return ResponseEntity.ok(ResponceBean.success("Event patched successfully", saved));
        } catch (IllegalArgumentException | JsonProcessingException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete event", description = "Delete an event")
    public ResponseEntity<ResponceBean<String>> deleteEvent(@PathVariable Integer id) {
        Optional<Events> event = eventsService.getEventById(id);
        if (event.isPresent()) {
            eventsService.deleteEvent(id);
            return ResponseEntity.ok(ResponceBean.success("Event deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Event not found"));
    }

    private LocalDateTime parseEventDate(String rawDate) {
        if (rawDate == null || rawDate.isBlank()) {
            return null;
        }

        String value = rawDate.trim();
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
        } catch (DateTimeParseException ignored) {
        }

        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        try {
            return ZonedDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        throw new IllegalArgumentException("eventDate must be a valid ISO datetime (e.g. 2026-04-26T20:43:00)");
    }

    private Events.EventStatus parseEventStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return Events.EventStatus.PLANNED;
        }

        try {
            return Events.EventStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("status must be one of PLANNED, ONGOING, COMPLETED, CANCELLED");
        }
    }

    public static class EventCreateRequest {
        private String eventName;
        private String description;
        private String eventDate;
        private String location;
        private String venue;
        private String status;
        private Integer maxParticipants;
        private Integer committeeId;
        private Integer categoryId;
        private CommitteeRef committee;
        private CategoryRef category;

        public String getEventName() {
            return eventName;
        }

        public void setEventName(String eventName) {
            this.eventName = eventName;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getEventDate() {
            return eventDate;
        }

        public void setEventDate(String eventDate) {
            this.eventDate = eventDate;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getVenue() {
            return venue;
        }

        public void setVenue(String venue) {
            this.venue = venue;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getMaxParticipants() {
            return maxParticipants;
        }

        public void setMaxParticipants(Integer maxParticipants) {
            this.maxParticipants = maxParticipants;
        }

        public Integer getCommitteeId() {
            return committeeId;
        }

        public void setCommitteeId(Integer committeeId) {
            this.committeeId = committeeId;
        }

        public Integer getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Integer categoryId) {
            this.categoryId = categoryId;
        }

        public CommitteeRef getCommittee() {
            return committee;
        }

        public void setCommittee(CommitteeRef committee) {
            this.committee = committee;
        }

        public CategoryRef getCategory() {
            return category;
        }

        public void setCategory(CategoryRef category) {
            this.category = category;
        }

        public Integer resolveCommitteeId() {
            if (committeeId != null) {
                return committeeId;
            }
            return committee != null ? committee.getCommitteeId() : null;
        }

        public Integer resolveCategoryId() {
            if (categoryId != null) {
                return categoryId;
            }
            return category != null ? category.getCategoryId() : null;
        }

        public String resolveLocation() {
            if (location != null && !location.isBlank()) {
                return location;
            }
            return venue;
        }
    }

    public static class CommitteeRef {
        private Integer committeeId;

        public Integer getCommitteeId() {
            return committeeId;
        }

        public void setCommitteeId(Integer committeeId) {
            this.committeeId = committeeId;
        }
    }

    public static class CategoryRef {
        private Integer categoryId;

        public Integer getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Integer categoryId) {
            this.categoryId = categoryId;
        }
    }
}