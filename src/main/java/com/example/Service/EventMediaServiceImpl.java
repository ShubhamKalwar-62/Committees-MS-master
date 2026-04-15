package com.example.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.Entity.EventMedia;
import com.example.Entity.Events;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.EventMediaRepository;
import com.example.Repository.EventsRepository;

@Service
public class EventMediaServiceImpl implements EventMediaService {

    @Autowired
    private EventMediaRepository eventMediaRepository;

    @Autowired
    private EventsRepository eventsRepository;

    @Value("${app.file-upload-dir:uploads}")
    private String uploadDir;

    @Override
    public List<EventMedia> getAllEventMedia() {
        return eventMediaRepository.findAll();
    }

    @Override
    public Optional<EventMedia> getEventMediaById(Integer id) {
        return eventMediaRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public List<EventMedia> getEventMediaByEvent(Events event) {
        return eventMediaRepository.findByEvent(event);
    }

    @Override
    public List<EventMedia> getEventMediaByEventId(Integer eventId) {
        return eventMediaRepository.findByEventId(eventId);
    }

    @Override
    public List<EventMedia> getEventMediaByFileType(EventMedia.MediaType fileType) {
        return eventMediaRepository.findByFileType(fileType);
    }

    @Override
    public List<EventMedia> getEventMediaByEventIdAndFileType(Integer eventId, EventMedia.MediaType fileType) {
        return eventMediaRepository.findByEventIdAndFileType(eventId, fileType);
    }

    @Override
    public List<EventMedia> searchEventMediaByFileName(String fileName) {
        return eventMediaRepository.findByFileNameContaining(fileName);
    }

    @Override
    public List<EventMedia> getEventMediaByMaxSize(Long maxSize) {
        return eventMediaRepository.findByFileSizeLessThanEqual(maxSize);
    }

    @Override
    public EventMedia saveEventMedia(EventMedia eventMedia) {
        return eventMediaRepository.save(Objects.requireNonNull(eventMedia, "event media must not be null"));
    }

    @Override
    public EventMedia uploadMedia(Integer eventId, EventMedia.MediaType mediaType, MultipartFile file) {
        Events event = eventsRepository.findById(Objects.requireNonNull(eventId, "eventId must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        try {
            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(basePath);

            String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
            String storedName = UUID.randomUUID() + "_" + originalName;
            Path targetPath = basePath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            EventMedia media = new EventMedia();
            media.setEvent(event);
            media.setFilePath("/uploads/" + storedName);
            media.setFileName(originalName);
            media.setFileType(Objects.requireNonNull(mediaType, "mediaType must not be null"));
            media.setFileSize(file.getSize());
            return eventMediaRepository.save(media);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to upload media file", e);
        }
    }

    @Override
    public void deleteEventMedia(Integer id) {
        eventMediaRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public EventMedia updateEventMedia(Integer id, EventMedia eventMediaDetails) {
        Optional<EventMedia> existingEventMedia = eventMediaRepository.findById(Objects.requireNonNull(id, "id must not be null"));
        if (existingEventMedia.isPresent()) {
            EventMedia eventMedia = existingEventMedia.get();
            eventMedia.setFileName(eventMediaDetails.getFileName());
            eventMedia.setFilePath(eventMediaDetails.getFilePath());
            eventMedia.setFileType(eventMediaDetails.getFileType());
            eventMedia.setFileSize(eventMediaDetails.getFileSize());
            return eventMediaRepository.save(eventMedia);
        }
        throw new ResourceNotFoundException("Event media not found with id: " + id);
    }
}
