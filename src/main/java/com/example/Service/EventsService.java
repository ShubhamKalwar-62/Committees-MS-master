package com.example.Service;

import com.example.Entity.Events;
import com.example.Entity.Committee;
import com.example.Repository.EventsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventsService {
    
    @Autowired
    private EventsRepository eventsRepository;
    
    public List<Events> getAllEvents() {
        return eventsRepository.findAll();
    }
    
    public Optional<Events> getEventById(Integer id) {
        return eventsRepository.findById(id);
    }
    
    public List<Events> getEventsByCommittee(Committee committee) {
        return eventsRepository.findByCommittee(committee);
    }
    
    public List<Events> getEventsByStatus(Events.EventStatus status) {
        return eventsRepository.findByStatus(status);
    }
    
    public List<Events> getEventsByCommitteeId(Integer committeeId) {
        return eventsRepository.findByCommitteeIdOrderByEventDate(committeeId);
    }
    
    public List<Events> getEventsByNameContaining(String eventName) {
        return eventsRepository.findByEventNameContaining(eventName);
    }
    
    public List<Events> getEventsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return eventsRepository.findByEventDateBetween(startDate, endDate);
    }
    
    public Events saveEvent(Events event) {
        return eventsRepository.save(event);
    }
    
    public void deleteEvent(Integer id) {
        eventsRepository.deleteById(id);
    }
    
    public Events updateEvent(Integer id, Events eventDetails) {
        Optional<Events> existingEvent = eventsRepository.findById(id);
        if (existingEvent.isPresent()) {
            Events event = existingEvent.get();
            event.setEventName(eventDetails.getEventName());
            event.setDescription(eventDetails.getDescription());
            event.setEventDate(eventDetails.getEventDate());
            event.setLocation(eventDetails.getLocation());
            event.setStatus(eventDetails.getStatus());
            event.setMaxParticipants(eventDetails.getMaxParticipants());
            return eventsRepository.save(event);
        }
        return null;
    }
}