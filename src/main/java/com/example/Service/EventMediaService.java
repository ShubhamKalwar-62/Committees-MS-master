package com.example.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.example.Entity.EventMedia;
import com.example.Entity.Events;

public interface EventMediaService {
    List<EventMedia> getAllEventMedia();
    Optional<EventMedia> getEventMediaById(Integer id);
    List<EventMedia> getEventMediaByEvent(Events event);
    List<EventMedia> getEventMediaByEventId(Integer eventId);
    List<EventMedia> getEventMediaByFileType(EventMedia.MediaType fileType);
    List<EventMedia> getEventMediaByEventIdAndFileType(Integer eventId, EventMedia.MediaType fileType);
    List<EventMedia> searchEventMediaByFileName(String fileName);
    List<EventMedia> getEventMediaByMaxSize(Long maxSize);
    EventMedia saveEventMedia(EventMedia eventMedia);
    EventMedia uploadMedia(Integer eventId, EventMedia.MediaType mediaType, MultipartFile file);
    void deleteEventMedia(Integer id);
    EventMedia updateEventMedia(Integer id, EventMedia eventMediaDetails);
}