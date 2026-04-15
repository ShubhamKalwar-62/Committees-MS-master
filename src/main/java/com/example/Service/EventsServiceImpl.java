package com.example.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.Committee;
import com.example.Entity.Events;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.EventsRepository;

@Service
public class EventsServiceImpl implements EventsService {

    @Autowired
    private EventsRepository eventsRepository;

    @Override
    public List<Events> getAllEvents() {
        return eventsRepository.findAll();
    }

    @Override
    public Optional<Events> getEventById(Integer id) {
        return eventsRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public List<Events> getEventsByCommittee(Committee committee) {
        return eventsRepository.findByCommittee(committee);
    }

    @Override
    public List<Events> getEventsByStatus(Events.EventStatus status) {
        return eventsRepository.findByStatus(status);
    }

    @Override
    public List<Events> getEventsByCommitteeId(Integer committeeId) {
        return eventsRepository.findByCommitteeIdOrderByEventDate(committeeId);
    }

    @Override
    public List<Events> getEventsByNameContaining(String eventName) {
        return eventsRepository.findByEventNameContaining(eventName);
    }

    @Override
    public List<Events> getEventsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return eventsRepository.findByEventDateBetween(startDate, endDate);
    }

    @Override
    public Events saveEvent(Events event) {
        return eventsRepository.save(Objects.requireNonNull(event, "event must not be null"));
    }

    @Override
    public void deleteEvent(Integer id) {
        eventsRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public Events updateEvent(Integer id, Events eventDetails) {
        Optional<Events> existingEvent = eventsRepository.findById(Objects.requireNonNull(id, "id must not be null"));
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
        throw new ResourceNotFoundException("Event not found with id: " + id);
    }
}
