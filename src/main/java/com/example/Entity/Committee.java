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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "committee")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Committee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "committee_id")
    private Integer committeeId;
    
    @NotBlank(message = "Committee name is required")
    @Column(name = "committee_name", nullable = false)
    private String committeeName;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "login_id", nullable = false)
    @JsonIgnoreProperties({"password", "user", "committees", "createdAt", "updatedAt"})
    private Login login;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "head_id")
    @JsonIgnoreProperties({"announcements", "eventParticipations", "eventFeedbacks", "assignedTasks", "createdTasks", "attendanceRecords", "markedAttendanceRecords", "createdAt", "updatedAt"})
    private Users head;
    
    @Column(name = "faculty_incharge_name")
    private String facultyInchargeName;
    
    @Column(name = "faculty_position")
    private String facultyPosition;
    
    @Column(name = "committee_info", columnDefinition = "TEXT")
    private String committeeInfo;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "committee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Roles> roles;
    
    @OneToMany(mappedBy = "committee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Announcements> announcements;
    
    @OneToMany(mappedBy = "committee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Events> events;
    
    @OneToMany(mappedBy = "committee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Task> tasks;
    
    // Constructors
    public Committee() {}
    
    public Committee(String committeeName, Login login, String facultyInchargeName, String facultyPosition, String committeeInfo) {
        this.committeeName = committeeName;
        this.login = login;
        this.facultyInchargeName = facultyInchargeName;
        this.facultyPosition = facultyPosition;
        this.committeeInfo = committeeInfo;
    }
    
    // Getters and Setters
    public Integer getCommitteeId() {
        return committeeId;
    }
    
    public void setCommitteeId(Integer committeeId) {
        this.committeeId = committeeId;
    }
    
    public String getCommitteeName() {
        return committeeName;
    }
    
    public void setCommitteeName(String committeeName) {
        this.committeeName = committeeName;
    }
    
    public Login getLogin() {
        return login;
    }
    
    public void setLogin(Login login) {
        this.login = login;
    }
    
    public String getFacultyInchargeName() {
        return facultyInchargeName;
    }
    
    public void setFacultyInchargeName(String facultyInchargeName) {
        this.facultyInchargeName = facultyInchargeName;
    }

    public Users getHead() {
        return head;
    }

    public void setHead(Users head) {
        this.head = head;
    }
    
    public String getFacultyPosition() {
        return facultyPosition;
    }
    
    public void setFacultyPosition(String facultyPosition) {
        this.facultyPosition = facultyPosition;
    }
    
    public String getCommitteeInfo() {
        return committeeInfo;
    }
    
    public void setCommitteeInfo(String committeeInfo) {
        this.committeeInfo = committeeInfo;
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
    
    public List<Roles> getRoles() {
        return roles;
    }
    
    public void setRoles(List<Roles> roles) {
        this.roles = roles;
    }
    
    public List<Announcements> getAnnouncements() {
        return announcements;
    }
    
    public void setAnnouncements(List<Announcements> announcements) {
        this.announcements = announcements;
    }
    
    public List<Events> getEvents() {
        return events;
    }
    
    public void setEvents(List<Events> events) {
        this.events = events;
    }
    
    public List<Task> getTasks() {
        return tasks;
    }
    
    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }
}