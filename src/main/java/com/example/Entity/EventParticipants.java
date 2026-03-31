package com.example.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_participants")
public class EventParticipants {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Integer participantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Events event;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RegistrationStatus status = RegistrationStatus.REGISTERED;
    
    @CreationTimestamp
    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;
    
    @Column(name = "attended")
    private Boolean attended = false;
    
    // Enum for Registration Status
    public enum RegistrationStatus {
        REGISTERED, CONFIRMED, CANCELLED, ATTENDED
    }
    
    // Constructors
    public EventParticipants() {}
    
    public EventParticipants(Events event, Users user) {
        this.event = event;
        this.user = user;
    }
    
    // Getters and Setters
    public Integer getParticipantId() {
        return participantId;
    }
    
    public void setParticipantId(Integer participantId) {
        this.participantId = participantId;
    }
    
    public Events getEvent() {
        return event;
    }
    
    public void setEvent(Events event) {
        this.event = event;
    }
    
    public Users getUser() {
        return user;
    }
    
    public void setUser(Users user) {
        this.user = user;
    }
    
    public RegistrationStatus getStatus() {
        return status;
    }
    
    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }
    
    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }
    
    public Boolean getAttended() {
        return attended;
    }
    
    public void setAttended(Boolean attended) {
        this.attended = attended;
    }
}