package com.example.Controller;

import java.time.LocalDateTime;
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

import com.example.Entity.Announcements;
import com.example.Exception.ResourceNotFoundException;
import com.example.Response.ResponceBean;
import com.example.Service.AnnouncementsService;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/announcements")
@Tag(name = "Announcement Management", description = "APIs for managing announcements")
public class AnnouncementsController {
    
    @Autowired
    private AnnouncementsService announcementsService;

    @Autowired
    private ObjectMapper objectMapper;
    
    @GetMapping
    @Operation(summary = "Get all announcements", description = "Retrieve all announcements")
    public ResponseEntity<ResponceBean<List<Announcements>>> getAllAnnouncements() {
        List<Announcements> announcements = announcementsService.getAllAnnouncements();
        return ResponseEntity.ok(ResponceBean.success("Announcements retrieved successfully", announcements));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get announcement by ID", description = "Retrieve a specific announcement by ID")
    public ResponseEntity<ResponceBean<Announcements>> getAnnouncementById(@PathVariable Integer id) {
        Optional<Announcements> announcement = announcementsService.getAnnouncementById(id);
        if (announcement.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Announcement retrieved successfully", announcement.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Announcement not found"));
    }
    
    @GetMapping("/committee/{committeeId}")
    @Operation(summary = "Get announcements by committee", description = "Retrieve announcements by committee ID")
    public ResponseEntity<ResponceBean<List<Announcements>>> getAnnouncementsByCommittee(@PathVariable Integer committeeId) {
        List<Announcements> announcements = announcementsService.getAnnouncementsByCommitteeId(committeeId);
        return ResponseEntity.ok(ResponceBean.success("Announcements retrieved successfully", announcements));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search announcements by message", description = "Search announcements by message containing keyword")
    public ResponseEntity<ResponceBean<List<Announcements>>> searchAnnouncementsByMessage(@RequestParam String message) {
        List<Announcements> announcements = announcementsService.searchAnnouncementsByMessage(message);
        return ResponseEntity.ok(ResponceBean.success("Announcements found", announcements));
    }
    
    @GetMapping("/date-range")
    @Operation(summary = "Get announcements by date range", description = "Retrieve announcements between start and end dates")
    public ResponseEntity<ResponceBean<List<Announcements>>> getAnnouncementsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Announcements> announcements = announcementsService.getAnnouncementsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(ResponceBean.success("Announcements retrieved successfully", announcements));
    }
    
    @PostMapping
    @Operation(summary = "Create new announcement", description = "Create a new announcement")
    public ResponseEntity<ResponceBean<Announcements>> createAnnouncement(@RequestBody Announcements announcement) {
        try {
            Announcements savedAnnouncement = announcementsService.saveAnnouncement(announcement);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ResponceBean.success("Announcement created successfully", savedAnnouncement));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid announcement payload", ex.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update announcement", description = "Update an existing announcement")
    public ResponseEntity<ResponceBean<Announcements>> updateAnnouncement(@PathVariable Integer id, @RequestBody Announcements announcementDetails) {
        Announcements updatedAnnouncement = announcementsService.updateAnnouncement(id, announcementDetails);
        if (updatedAnnouncement != null) {
            return ResponseEntity.ok(ResponceBean.success("Announcement updated successfully", updatedAnnouncement));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Announcement not found"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch announcement", description = "Partially update an announcement")
    public ResponseEntity<ResponceBean<Announcements>> patchAnnouncement(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> updates) {
        Optional<Announcements> existing = announcementsService.getAnnouncementById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Announcement not found"));
        }
        try {
            updates.remove("announcementId");
            updates.remove("createdAt");
            Announcements patched = objectMapper.updateValue(existing.get(), updates);
            Announcements saved = announcementsService.saveAnnouncement(patched);
            return ResponseEntity.ok(ResponceBean.success("Announcement patched successfully", saved));
        } catch (IllegalArgumentException | JsonMappingException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark announcement as read", description = "Mark a specific announcement as read")
    public ResponseEntity<ResponceBean<Announcements>> markAnnouncementAsRead(@PathVariable Integer id) {
        try {
            Announcements updatedAnnouncement = announcementsService.markAnnouncementAsRead(id);
            return ResponseEntity.ok(ResponceBean.success("Announcement marked as read", updatedAnnouncement));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error(ex.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete announcement", description = "Delete an announcement")
    public ResponseEntity<ResponceBean<String>> deleteAnnouncement(@PathVariable Integer id) {
        Optional<Announcements> announcement = announcementsService.getAnnouncementById(id);
        if (announcement.isPresent()) {
            announcementsService.deleteAnnouncement(id);
            return ResponseEntity.ok(ResponceBean.success("Announcement deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Announcement not found"));
    }
}