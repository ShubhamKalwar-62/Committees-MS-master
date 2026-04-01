package com.example.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.Entity.Committee;
import com.example.Entity.Events;

public interface EventsService {
    List<Events> getAllEvents();
    Optional<Events> getEventById(Integer id);
    List<Events> getEventsByCommittee(Committee committee);
    List<Events> getEventsByStatus(Events.EventStatus status);
    List<Events> getEventsByCommitteeId(Integer committeeId);
    List<Events> getEventsByNameContaining(String eventName);
    List<Events> getEventsBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
    Events saveEvent(Events event);
    void deleteEvent(Integer id);
    Events updateEvent(Integer id, Events eventDetails);
}