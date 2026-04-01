package com.example.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.Entity.EventMedia;
import com.example.Response.ResponceBean;
import com.example.Service.EventMediaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/media")
@Tag(name = "Media Upload", description = "APIs for uploading event media")
public class MediaUploadController {

    @Autowired
    private EventMediaService eventMediaService;

    @PostMapping("/upload")
    @Operation(summary = "Upload media", description = "Upload event media file")
    public ResponseEntity<ResponceBean<EventMedia>> uploadMedia(
            @RequestParam Integer eventId,
            @RequestParam EventMedia.MediaType mediaType,
            @RequestParam("file") MultipartFile file) {

        EventMedia uploaded = eventMediaService.uploadMedia(eventId, mediaType, file);
        if (uploaded == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Unable to upload media. Check event and file payload."));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Media uploaded successfully", uploaded));
    }
}
