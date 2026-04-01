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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.Entity.EventMedia;
import com.example.Response.ResponceBean;
import com.example.Service.EventMediaService;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/event-media")
@Tag(name = "Event Media Management", description = "APIs for managing event media files")
public class EventMediaController {
    
    @Autowired
    private EventMediaService eventMediaService;

    @Autowired
    private ObjectMapper objectMapper;
    
    @GetMapping
    @Operation(summary = "Get all event media", description = "Retrieve all event media files")
    public ResponseEntity<ResponceBean<List<EventMedia>>> getAllEventMedia() {
        List<EventMedia> mediaList = eventMediaService.getAllEventMedia();
        return ResponseEntity.ok(ResponceBean.success("Event media retrieved successfully", mediaList));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get event media by ID", description = "Retrieve specific event media by ID")
    public ResponseEntity<ResponceBean<EventMedia>> getEventMediaById(@PathVariable Integer id) {
        Optional<EventMedia> eventMedia = eventMediaService.getEventMediaById(id);
        if (eventMedia.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Event media retrieved successfully", eventMedia.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Event media not found"));
    }
    
    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get media by event", description = "Retrieve media files by event ID")
    public ResponseEntity<ResponceBean<List<EventMedia>>> getEventMediaByEvent(@PathVariable Integer eventId) {
        List<EventMedia> mediaList = eventMediaService.getEventMediaByEventId(eventId);
        return ResponseEntity.ok(ResponceBean.success("Event media retrieved successfully", mediaList));
    }
    
    @GetMapping("/type/{fileType}")
    @Operation(summary = "Get media by file type", description = "Retrieve media files by file type")
    public ResponseEntity<ResponceBean<List<EventMedia>>> getEventMediaByFileType(@PathVariable EventMedia.MediaType fileType) {
        List<EventMedia> mediaList = eventMediaService.getEventMediaByFileType(fileType);
        return ResponseEntity.ok(ResponceBean.success("Event media retrieved successfully", mediaList));
    }
    
    @GetMapping("/event/{eventId}/type/{fileType}")
    @Operation(summary = "Get media by event and file type", description = "Retrieve media files by event ID and file type")
    public ResponseEntity<ResponceBean<List<EventMedia>>> getEventMediaByEventAndType(
            @PathVariable Integer eventId, 
            @PathVariable EventMedia.MediaType fileType) {
        List<EventMedia> mediaList = eventMediaService.getEventMediaByEventIdAndFileType(eventId, fileType);
        return ResponseEntity.ok(ResponceBean.success("Event media retrieved successfully", mediaList));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search media by filename", description = "Search media files by filename containing keyword")
    public ResponseEntity<ResponceBean<List<EventMedia>>> searchEventMediaByFileName(@RequestParam String fileName) {
        List<EventMedia> mediaList = eventMediaService.searchEventMediaByFileName(fileName);
        return ResponseEntity.ok(ResponceBean.success("Event media found", mediaList));
    }
    
    @GetMapping("/max-size/{maxSize}")
    @Operation(summary = "Get media by max size", description = "Retrieve media files with size less than or equal to max size")
    public ResponseEntity<ResponceBean<List<EventMedia>>> getEventMediaByMaxSize(@PathVariable Long maxSize) {
        List<EventMedia> mediaList = eventMediaService.getEventMediaByMaxSize(maxSize);
        return ResponseEntity.ok(ResponceBean.success("Event media retrieved successfully", mediaList));
    }
    
    @PostMapping
    @Operation(summary = "Upload event media", description = "Upload new event media file")
    public ResponseEntity<ResponceBean<EventMedia>> uploadEventMedia(@RequestBody EventMedia eventMedia) {
        EventMedia savedEventMedia = eventMediaService.saveEventMedia(eventMedia);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Event media uploaded successfully", savedEventMedia));
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload media file", description = "Upload media file and persist URL")
    public ResponseEntity<ResponceBean<EventMedia>> uploadMediaFile(
            @RequestParam Integer eventId,
            @RequestParam EventMedia.MediaType mediaType,
            @RequestParam("file") MultipartFile file) {
        EventMedia uploaded = eventMediaService.uploadMedia(eventId, mediaType, file);
        if (uploaded == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Unable to upload media. Check event and file payload."));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Media file uploaded successfully", uploaded));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update event media", description = "Update event media details")
    public ResponseEntity<ResponceBean<EventMedia>> updateEventMedia(@PathVariable Integer id, @RequestBody EventMedia eventMediaDetails) {
        EventMedia updatedEventMedia = eventMediaService.updateEventMedia(id, eventMediaDetails);
        if (updatedEventMedia != null) {
            return ResponseEntity.ok(ResponceBean.success("Event media updated successfully", updatedEventMedia));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Event media not found"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch event media", description = "Partially update event media")
    public ResponseEntity<ResponceBean<EventMedia>> patchEventMedia(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> updates) {
        Optional<EventMedia> existing = eventMediaService.getEventMediaById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Event media not found"));
        }
        try {
            updates.remove("mediaId");
            updates.remove("uploadedAt");
            EventMedia patched = objectMapper.updateValue(existing.get(), updates);
            EventMedia saved = eventMediaService.saveEventMedia(patched);
            return ResponseEntity.ok(ResponceBean.success("Event media patched successfully", saved));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete event media", description = "Delete event media file")
    public ResponseEntity<ResponceBean<String>> deleteEventMedia(@PathVariable Integer id) {
        Optional<EventMedia> eventMedia = eventMediaService.getEventMediaById(id);
        if (eventMedia.isPresent()) {
            eventMediaService.deleteEventMedia(id);
            return ResponseEntity.ok(ResponceBean.success("Event media deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Event media not found"));
    }
}