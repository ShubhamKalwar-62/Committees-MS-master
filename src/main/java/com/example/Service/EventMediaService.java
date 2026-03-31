package com.example.Service;

import com.example.Entity.EventMedia;
import com.example.Entity.Events;
import com.example.Repository.EventMediaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventMediaService {
    
    @Autowired
    private EventMediaRepository eventMediaRepository;
    
    public List<EventMedia> getAllEventMedia() {
        return eventMediaRepository.findAll();
    }
    
    public Optional<EventMedia> getEventMediaById(Integer id) {
        return eventMediaRepository.findById(id);
    }
    
    public List<EventMedia> getEventMediaByEvent(Events event) {
        return eventMediaRepository.findByEvent(event);
    }
    
    public List<EventMedia> getEventMediaByEventId(Integer eventId) {
        return eventMediaRepository.findByEventId(eventId);
    }
    
    public List<EventMedia> getEventMediaByFileType(EventMedia.MediaType fileType) {
        return eventMediaRepository.findByFileType(fileType);
    }
    
    public List<EventMedia> getEventMediaByEventIdAndFileType(Integer eventId, EventMedia.MediaType fileType) {
        return eventMediaRepository.findByEventIdAndFileType(eventId, fileType);
    }
    
    public List<EventMedia> searchEventMediaByFileName(String fileName) {
        return eventMediaRepository.findByFileNameContaining(fileName);
    }
    
    public List<EventMedia> getEventMediaByMaxSize(Long maxSize) {
        return eventMediaRepository.findByFileSizeLessThanEqual(maxSize);
    }
    
    public EventMedia saveEventMedia(EventMedia eventMedia) {
        return eventMediaRepository.save(eventMedia);
    }
    
    public void deleteEventMedia(Integer id) {
        eventMediaRepository.deleteById(id);
    }
    
    public EventMedia updateEventMedia(Integer id, EventMedia eventMediaDetails) {
        Optional<EventMedia> existingEventMedia = eventMediaRepository.findById(id);
        if (existingEventMedia.isPresent()) {
            EventMedia eventMedia = existingEventMedia.get();
            eventMedia.setFileName(eventMediaDetails.getFileName());
            eventMedia.setFilePath(eventMediaDetails.getFilePath());
            eventMedia.setFileType(eventMediaDetails.getFileType());
            eventMedia.setFileSize(eventMediaDetails.getFileSize());
            return eventMediaRepository.save(eventMedia);
        }
        return null;
    }
}