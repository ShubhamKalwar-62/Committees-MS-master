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
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.EventParticipants;
import com.example.Response.ResponceBean;
import com.example.Service.EventParticipantsService;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/event-participants")
@Tag(name = "Event Participants Management", description = "APIs for managing event participants and registrations")
public class EventParticipantsController {
    
    @Autowired
    private EventParticipantsService eventParticipantsService;

    @Autowired
    private ObjectMapper objectMapper;
    
    @GetMapping
    @Operation(summary = "Get all participants", description = "Retrieve all event participants")
    public ResponseEntity<ResponceBean<List<EventParticipants>>> getAllParticipants() {
        List<EventParticipants> participants = eventParticipantsService.getAllParticipants();
        return ResponseEntity.ok(ResponceBean.success("Participants retrieved successfully", participants));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get participant by ID", description = "Retrieve a specific participant by ID")
    public ResponseEntity<ResponceBean<EventParticipants>> getParticipantById(@PathVariable Integer id) {
        Optional<EventParticipants> participant = eventParticipantsService.getParticipantById(id);
        if (participant.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Participant retrieved successfully", participant.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Participant not found"));
    }
    
    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get participants by event", description = "Retrieve participants by event ID")
    public ResponseEntity<ResponceBean<List<EventParticipants>>> getParticipantsByEvent(@PathVariable Integer eventId) {
        List<EventParticipants> participants = eventParticipantsService.getParticipantsByEventId(eventId);
        return ResponseEntity.ok(ResponceBean.success("Participants retrieved successfully", participants));
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get participants by user", description = "Retrieve participants by user ID")
    public ResponseEntity<ResponceBean<List<EventParticipants>>> getParticipantsByUser(@PathVariable Integer userId) {
        List<EventParticipants> participants = eventParticipantsService.getParticipantsByUserId(userId);
        return ResponseEntity.ok(ResponceBean.success("Participants retrieved successfully", participants));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get participants by status", description = "Retrieve participants by registration status")
    public ResponseEntity<ResponceBean<List<EventParticipants>>> getParticipantsByStatus(@PathVariable EventParticipants.RegistrationStatus status) {
        List<EventParticipants> participants = eventParticipantsService.getParticipantsByStatus(status);
        return ResponseEntity.ok(ResponceBean.success("Participants retrieved successfully", participants));
    }
    
    @GetMapping("/attendance/{attended}")
    @Operation(summary = "Get participants by attendance", description = "Retrieve participants by attendance status")
    public ResponseEntity<ResponceBean<List<EventParticipants>>> getParticipantsByAttendance(@PathVariable Boolean attended) {
        List<EventParticipants> participants = eventParticipantsService.getParticipantsByAttendance(attended);
        return ResponseEntity.ok(ResponceBean.success("Participants retrieved successfully", participants));
    }
    
    @GetMapping("/event/{eventId}/count")
    @Operation(summary = "Get registered participants count", description = "Get count of registered participants for an event")
    public ResponseEntity<ResponceBean<Long>> getRegisteredParticipantsCount(@PathVariable Integer eventId) {
        Long count = eventParticipantsService.getRegisteredParticipantsCount(eventId);
        return ResponseEntity.ok(ResponceBean.success("Participants count retrieved successfully", count));
    }
    
    @PostMapping
    @Operation(summary = "Register participant", description = "Register a new participant for an event")
    public ResponseEntity<ResponceBean<EventParticipants>> registerParticipant(@RequestBody EventParticipants participant) {
        EventParticipants savedParticipant = eventParticipantsService.saveParticipant(participant);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Participant registered successfully", savedParticipant));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update participant", description = "Update participant registration details")
    public ResponseEntity<ResponceBean<EventParticipants>> updateParticipant(@PathVariable Integer id, @RequestBody EventParticipants participantDetails) {
        EventParticipants updatedParticipant = eventParticipantsService.updateParticipant(id, participantDetails);
        if (updatedParticipant != null) {
            return ResponseEntity.ok(ResponceBean.success("Participant updated successfully", updatedParticipant));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Participant not found"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch participant", description = "Partially update participant registration")
    public ResponseEntity<ResponceBean<EventParticipants>> patchParticipant(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> updates) {
        Optional<EventParticipants> existing = eventParticipantsService.getParticipantById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Participant not found"));
        }
        try {
            updates.remove("participantId");
            updates.remove("registeredAt");
            EventParticipants patched = objectMapper.updateValue(existing.get(), updates);
            EventParticipants saved = eventParticipantsService.saveParticipant(patched);
            return ResponseEntity.ok(ResponceBean.success("Participant patched successfully", saved));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel registration", description = "Cancel participant registration")
    public ResponseEntity<ResponceBean<String>> cancelRegistration(@PathVariable Integer id) {
        Optional<EventParticipants> participant = eventParticipantsService.getParticipantById(id);
        if (participant.isPresent()) {
            eventParticipantsService.deleteParticipant(id);
            return ResponseEntity.ok(ResponceBean.success("Registration cancelled successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Participant not found"));
    }
}