package com.example.Entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "events")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Events {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Integer eventId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "committee_id", nullable = false)
    @JsonIgnoreProperties({"roles", "announcements", "events", "tasks", "login", "head", "createdAt", "updatedAt"})
    private Committee committee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"events", "createdAt", "updatedAt"})
    private EventCategory category;
    
    @NotBlank(message = "Event name is required")
    @Column(name = "event_name", nullable = false, length = 100)
    private String eventName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "event_date")
    private LocalDateTime eventDate;
    
    @Column(name = "venue", length = 200)
    private String location;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EventStatus status = EventStatus.PLANNED;
    
    @Column(name = "max_participants")
    private Integer maxParticipants;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // One-to-Many relationships
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<EventParticipants> participants;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<EventFeedback> feedbacks;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<EventMedia> mediaFiles;
    
    // Enum for Event Status
    public enum EventStatus {
        PLANNED, ONGOING, COMPLETED, CANCELLED
    }
    
    // Constructors
    public Events() {}
    
    public Events(Committee committee, String eventName, String description, LocalDateTime eventDate) {
        this.committee = committee;
        this.eventName = eventName;
        this.description = description;
        this.eventDate = eventDate;
    }
    
    // Getters and Setters
    public Integer getEventId() {
        return eventId;
    }
    
    public void setEventId(Integer eventId) {
        this.eventId = eventId;
    }
    
    public Committee getCommittee() {
        return committee;
    }
    
    public void setCommittee(Committee committee) {
        this.committee = committee;
    }

    public EventCategory getCategory() {
        return category;
    }

    public void setCategory(EventCategory category) {
        this.category = category;
    }
    
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
    
    public LocalDateTime getEventDate() {
        return eventDate;
    }
    
    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }

    public String getVenue() {
        return location;
    }

    public void setVenue(String venue) {
        this.location = venue;
    }
    
    public EventStatus getStatus() {
        return status;
    }
    
    public void setStatus(EventStatus status) {
        this.status = status;
    }
    
    public Integer getMaxParticipants() {
        return maxParticipants;
    }
    
    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<EventParticipants> getParticipants() {
        return participants;
    }
    
    public void setParticipants(List<EventParticipants> participants) {
        this.participants = participants;
    }
    
    public List<EventFeedback> getFeedbacks() {
        return feedbacks;
    }
    
    public void setFeedbacks(List<EventFeedback> feedbacks) {
        this.feedbacks = feedbacks;
    }
    
    public List<EventMedia> getMediaFiles() {
        return mediaFiles;
    }
    
    public void setMediaFiles(List<EventMedia> mediaFiles) {
        this.mediaFiles = mediaFiles;
    }
}