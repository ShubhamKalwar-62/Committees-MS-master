package com.example.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.EventParticipants;
import com.example.Entity.Events;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.EventParticipantsRepository;

@Service
public class EventParticipantsServiceImpl implements EventParticipantsService {

    @Autowired
    private EventParticipantsRepository eventParticipantsRepository;

    @Override
    public List<EventParticipants> getAllParticipants() {
        return eventParticipantsRepository.findAll();
    }

    @Override
    public Optional<EventParticipants> getParticipantById(Integer id) {
        return eventParticipantsRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public List<EventParticipants> getParticipantsByEvent(Events event) {
        return eventParticipantsRepository.findByEvent(event);
    }

    @Override
    public List<EventParticipants> getParticipantsByUser(Users user) {
        return eventParticipantsRepository.findByUser(user);
    }

    @Override
    public Optional<EventParticipants> getParticipantByEventAndUser(Events event, Users user) {
        return eventParticipantsRepository.findByEventAndUser(event, user);
    }

    @Override
    public List<EventParticipants> getParticipantsByEventId(Integer eventId) {
        return eventParticipantsRepository.findByEventId(eventId);
    }

    @Override
    public List<EventParticipants> getParticipantsByUserId(Integer userId) {
        return eventParticipantsRepository.findByUserId(userId);
    }

    @Override
    public List<EventParticipants> getParticipantsByStatus(EventParticipants.RegistrationStatus status) {
        return eventParticipantsRepository.findByStatus(status);
    }

    @Override
    public List<EventParticipants> getParticipantsByAttendance(Boolean attended) {
        return eventParticipantsRepository.findByAttended(attended);
    }

    @Override
    public Long getRegisteredParticipantsCount(Integer eventId) {
        return eventParticipantsRepository.countRegisteredParticipantsByEventId(eventId);
    }

    @Override
    public EventParticipants saveParticipant(EventParticipants participant) {
        return eventParticipantsRepository.save(Objects.requireNonNull(participant, "participant must not be null"));
    }

    @Override
    public void deleteParticipant(Integer id) {
        eventParticipantsRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public EventParticipants updateParticipant(Integer id, EventParticipants participantDetails) {
        Optional<EventParticipants> existingParticipant = eventParticipantsRepository.findById(Objects.requireNonNull(id, "id must not be null"));
        if (existingParticipant.isPresent()) {
            EventParticipants participant = existingParticipant.get();
            participant.setStatus(participantDetails.getStatus());
            participant.setAttended(participantDetails.getAttended());
            return eventParticipantsRepository.save(participant);
        }
        throw new ResourceNotFoundException("Event participant not found with id: " + id);
    }
}
