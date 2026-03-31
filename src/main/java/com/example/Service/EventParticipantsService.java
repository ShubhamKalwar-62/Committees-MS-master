package com.example.Service;

import com.example.Entity.EventParticipants;
import com.example.Entity.Events;
import com.example.Entity.Users;
import com.example.Repository.EventParticipantsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventParticipantsService {
    
    @Autowired
    private EventParticipantsRepository eventParticipantsRepository;
    
    public List<EventParticipants> getAllParticipants() {
        return eventParticipantsRepository.findAll();
    }
    
    public Optional<EventParticipants> getParticipantById(Integer id) {
        return eventParticipantsRepository.findById(id);
    }
    
    public List<EventParticipants> getParticipantsByEvent(Events event) {
        return eventParticipantsRepository.findByEvent(event);
    }
    
    public List<EventParticipants> getParticipantsByUser(Users user) {
        return eventParticipantsRepository.findByUser(user);
    }
    
    public Optional<EventParticipants> getParticipantByEventAndUser(Events event, Users user) {
        return eventParticipantsRepository.findByEventAndUser(event, user);
    }
    
    public List<EventParticipants> getParticipantsByEventId(Integer eventId) {
        return eventParticipantsRepository.findByEventId(eventId);
    }
    
    public List<EventParticipants> getParticipantsByUserId(Integer userId) {
        return eventParticipantsRepository.findByUserId(userId);
    }
    
    public List<EventParticipants> getParticipantsByStatus(EventParticipants.RegistrationStatus status) {
        return eventParticipantsRepository.findByStatus(status);
    }
    
    public List<EventParticipants> getParticipantsByAttendance(Boolean attended) {
        return eventParticipantsRepository.findByAttended(attended);
    }
    
    public Long getRegisteredParticipantsCount(Integer eventId) {
        return eventParticipantsRepository.countRegisteredParticipantsByEventId(eventId);
    }
    
    public EventParticipants saveParticipant(EventParticipants participant) {
        return eventParticipantsRepository.save(participant);
    }
    
    public void deleteParticipant(Integer id) {
        eventParticipantsRepository.deleteById(id);
    }
    
    public EventParticipants updateParticipant(Integer id, EventParticipants participantDetails) {
        Optional<EventParticipants> existingParticipant = eventParticipantsRepository.findById(id);
        if (existingParticipant.isPresent()) {
            EventParticipants participant = existingParticipant.get();
            participant.setStatus(participantDetails.getStatus());
            participant.setAttended(participantDetails.getAttended());
            return eventParticipantsRepository.save(participant);
        }
        return null;
    }
}