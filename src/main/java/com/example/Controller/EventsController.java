package com.example.Controller;

import com.example.Entity.Events;
import com.example.Response.ResponceBean;
import com.example.Service.EventsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Event Management", description = "APIs for managing events")
public class EventsController {
    
    @Autowired
    private EventsService eventsService;
    
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
    public ResponseEntity<ResponceBean<Events>> createEvent(@RequestBody Events event) {
        Events savedEvent = eventsService.saveEvent(event);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Event created successfully", savedEvent));
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
}