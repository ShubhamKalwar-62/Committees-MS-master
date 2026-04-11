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
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Users {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "login_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"password", "user", "committees", "createdAt", "updatedAt"})
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
    @JsonIgnore
    private List<Announcements> announcements;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<EventParticipants> eventParticipations;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<EventFeedback> eventFeedbacks;
    
    @OneToMany(mappedBy = "assignedTo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Task> assignedTasks;
    
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Task> createdTasks;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Attendance> attendanceRecords;

    @OneToMany(mappedBy = "markedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Attendance> markedAttendanceRecords;
    
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

    public List<Attendance> getAttendanceRecords() {
        return attendanceRecords;
    }

    public void setAttendanceRecords(List<Attendance> attendanceRecords) {
        this.attendanceRecords = attendanceRecords;
    }

    public List<Attendance> getMarkedAttendanceRecords() {
        return markedAttendanceRecords;
    }

    public void setMarkedAttendanceRecords(List<Attendance> markedAttendanceRecords) {
        this.markedAttendanceRecords = markedAttendanceRecords;
    }
}