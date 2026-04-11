package com.example.Entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "event_media")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EventMedia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "media_id")
    private Integer mediaId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnoreProperties({"participants", "feedbacks", "mediaFiles", "createdAt", "updatedAt"})
    private Events event;
    
    @Column(name = "media_url", nullable = false, length = 500, insertable = false, updatable = false)
    private String fileName;
    
    @NotBlank(message = "File path is required")
    @Column(name = "media_url", nullable = false, length = 500)
    private String filePath;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    private MediaType fileType;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enum for Media Type
    public enum MediaType {
        IMAGE, VIDEO, DOCUMENT, AUDIO
    }
    
    // Constructors
    public EventMedia() {}
    
    public EventMedia(Events event, String fileName, String filePath, MediaType fileType, Long fileSize) {
        this.event = event;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }
    
    // Getters and Setters
    public Integer getMediaId() {
        return mediaId;
    }
    
    public void setMediaId(Integer mediaId) {
        this.mediaId = mediaId;
    }
    
    public Events getEvent() {
        return event;
    }
    
    public void setEvent(Events event) {
        this.event = event;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public MediaType getFileType() {
        return fileType;
    }
    
    public void setFileType(MediaType fileType) {
        this.fileType = fileType;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
    
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}