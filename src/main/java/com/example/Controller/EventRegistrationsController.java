package com.example.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.EventParticipants;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.UsersRepository;
import com.example.Response.ResponceBean;
import com.example.Service.EventParticipantsService;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/registrations")
@Tag(name = "Event Registrations", description = "APIs for event registration actions")
public class EventRegistrationsController {

    @Autowired
    private EventParticipantsService eventParticipantsService;

    @Autowired
    private UsersRepository usersRepository;

    @PostMapping
    @Operation(summary = "Register user for event", description = "Create an event registration with user_id and event_id")
    public ResponseEntity<ResponceBean<EventParticipants>> register(@RequestBody RegistrationRequest request) {
        if (request.getEventId() == null || request.getEventId() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid registration payload", "event_id is required and must be a positive integer"));
        }

        Integer resolvedUserId = request.getUserId();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getName() != null
                && !"anonymousUser".equalsIgnoreCase(authentication.getName())) {
            Users requester = usersRepository.findByEmail(authentication.getName()).orElse(null);
            if (requester != null && isStudent(authentication)) {
                if (resolvedUserId != null && !resolvedUserId.equals(requester.getUserId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ResponceBean.error("Students can only register themselves"));
                }
                resolvedUserId = requester.getUserId();
            }
        }

        if (resolvedUserId == null || resolvedUserId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid registration payload", "user_id is required and must be a positive integer"));
        }

        try {
            EventParticipants saved = eventParticipantsService.registerParticipant(request.getEventId(), resolvedUserId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ResponceBean.success("Participant registered successfully", saved));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ResponceBean.error("Registration already exists", ex.getMessage()));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponceBean.error(ex.getMessage()));
        }
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending registrations", description = "Retrieve all pending event registrations for approval")
    public ResponseEntity<ResponceBean<List<EventParticipants>>> getPendingRegistrations() {
        List<EventParticipants> registrations = eventParticipantsService.getPendingRegistrations();
        return ResponseEntity.ok(ResponceBean.success("Pending registrations retrieved successfully", registrations));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve registration", description = "Approve a pending registration and set approved timestamp")
    public ResponseEntity<ResponceBean<EventParticipants>> approveRegistration(@PathVariable Integer id) {
        try {
            EventParticipants updated = eventParticipantsService.approveRegistration(id);
            return ResponseEntity.ok(ResponceBean.success("Registration approved successfully", updated));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponceBean.error(ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Reject registration", description = "Reject a pending registration")
    public ResponseEntity<ResponceBean<EventParticipants>> rejectRegistration(@PathVariable Integer id) {
        try {
            EventParticipants updated = eventParticipantsService.rejectRegistration(id);
            return ResponseEntity.ok(ResponceBean.success("Registration rejected successfully", updated));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponceBean.error(ex.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user registrations", description = "Retrieve all registrations for a specific user")
    public ResponseEntity<ResponceBean<List<EventParticipants>>> getRegistrationsForUser(@PathVariable Integer userId) {
        if (userId == null || userId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid user identifier", "userId must be a positive integer"));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getName() != null
                && !"anonymousUser".equalsIgnoreCase(authentication.getName())
                && isStudent(authentication)) {
            Users requester = usersRepository.findByEmail(authentication.getName()).orElse(null);
            if (requester == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponceBean.error("Authenticated user record not found"));
            }

            if (!userId.equals(requester.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ResponceBean.error("Students can only view their own registrations"));
            }
        }

        List<EventParticipants> registrations = eventParticipantsService.getParticipantsByUserId(userId);
        return ResponseEntity.ok(ResponceBean.success("Registrations retrieved successfully", registrations));
    }

    public static class RegistrationRequest {
        @JsonProperty("user_id")
        @JsonAlias({ "userId" })
        private Integer userId;

        @JsonProperty("event_id")
        @JsonAlias({ "eventId" })
        private Integer eventId;

        public Integer getUserId() {
            return userId;
        }

        public void setUserId(Integer userId) {
            this.userId = userId;
        }

        public Integer getEventId() {
            return eventId;
        }

        public void setEventId(Integer eventId) {
            this.eventId = eventId;
        }
    }

    private boolean isStudent(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_STUDENT".equalsIgnoreCase(authority.getAuthority()));
    }
}
