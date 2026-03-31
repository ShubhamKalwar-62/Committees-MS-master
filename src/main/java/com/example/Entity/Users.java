package com.example.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class Users {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "login_id", nullable = false)
    private Login login;
    
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Announcements> announcements;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CommitteeChat> committeeChats;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventParticipants> eventParticipations;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventFeedback> eventFeedbacks;
    
    @OneToMany(mappedBy = "assignedTo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Task> assignedTasks;
    
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Task> createdTasks;
    
    // Constructors
    public Users() {}
    
    public Users(Login login, String name) {
        this.login = login;
        this.name = name;
    }
    
    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public Login getLogin() {
        return login;
    }
    
    public void setLogin(Login login) {
        this.login = login;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
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
    
    public List<Announcements> getAnnouncements() {
        return announcements;
    }
    
    public void setAnnouncements(List<Announcements> announcements) {
        this.announcements = announcements;
    }
    
    public List<CommitteeChat> getCommitteeChats() {
        return committeeChats;
    }
    
    public void setCommitteeChats(List<CommitteeChat> committeeChats) {
        this.committeeChats = committeeChats;
    }
    
    public List<EventParticipants> getEventParticipations() {
        return eventParticipations;
    }
    
    public void setEventParticipations(List<EventParticipants> eventParticipations) {
        this.eventParticipations = eventParticipations;
    }
    
    public List<EventFeedback> getEventFeedbacks() {
        return eventFeedbacks;
    }
    
    public void setEventFeedbacks(List<EventFeedback> eventFeedbacks) {
        this.eventFeedbacks = eventFeedbacks;
    }
    
    public List<Task> getAssignedTasks() {
        return assignedTasks;
    }
    
    public void setAssignedTasks(List<Task> assignedTasks) {
        this.assignedTasks = assignedTasks;
    }
    
    public List<Task> getCreatedTasks() {
        return createdTasks;
    }
    
    public void setCreatedTasks(List<Task> createdTasks) {
        this.createdTasks = createdTasks;
    }
}