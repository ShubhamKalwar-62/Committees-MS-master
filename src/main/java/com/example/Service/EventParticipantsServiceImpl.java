package com.example.Service;

import java.time.LocalDateTime;
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
import com.example.Repository.EventsRepository;
import com.example.Repository.UsersRepository;

@Service
public class EventParticipantsServiceImpl implements EventParticipantsService {

    @Autowired
    private EventParticipantsRepository eventParticipantsRepository;

    @Autowired
    private EventsRepository eventsRepository;

    @Autowired
    private UsersRepository usersRepository;

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
    public List<EventParticipants> getPendingRegistrations() {
        return eventParticipantsRepository.findByStatusOrderByRegisteredAtAsc(EventParticipants.RegistrationStatus.PENDING);
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
    public EventParticipants registerParticipant(Integer eventId, Integer userId) {
        Integer resolvedEventId = Objects.requireNonNull(eventId, "eventId must not be null");
        Integer resolvedUserId = Objects.requireNonNull(userId, "userId must not be null");

        Events event = eventsRepository.findById(resolvedEventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + resolvedEventId));
        Users user = usersRepository.findById(resolvedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + resolvedUserId));

        Optional<EventParticipants> existingRegistration = eventParticipantsRepository.findByEventAndUser(event, user);
        if (existingRegistration.isPresent()) {
            throw new IllegalStateException("User already registered for this event");
        }

        EventParticipants participant = new EventParticipants(event, user);
        participant.setStatus(EventParticipants.RegistrationStatus.PENDING);
        participant.setApprovedAt(null);
        participant.setAttended(false);
        return eventParticipantsRepository.save(participant);
    }

    @Override
    public EventParticipants approveRegistration(Integer id) {
        Integer resolvedId = Objects.requireNonNull(id, "id must not be null");
        EventParticipants registration = eventParticipantsRepository.findById(resolvedId)
                .orElseThrow(() -> new ResourceNotFoundException("Event registration not found with id: " + resolvedId));

        registration.setStatus(EventParticipants.RegistrationStatus.APPROVED);
        registration.setApprovedAt(LocalDateTime.now());
        return eventParticipantsRepository.save(registration);
    }

    @Override
    public EventParticipants rejectRegistration(Integer id) {
        Integer resolvedId = Objects.requireNonNull(id, "id must not be null");
        EventParticipants registration = eventParticipantsRepository.findById(resolvedId)
                .orElseThrow(() -> new ResourceNotFoundException("Event registration not found with id: " + resolvedId));

        registration.setStatus(EventParticipants.RegistrationStatus.REJECTED);
        registration.setApprovedAt(null);
        return eventParticipantsRepository.save(registration);
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
            if (participant.getStatus() == EventParticipants.RegistrationStatus.APPROVED) {
                participant.setApprovedAt(LocalDateTime.now());
            } else if (participant.getStatus() == EventParticipants.RegistrationStatus.REJECTED) {
                participant.setApprovedAt(null);
            }
            return eventParticipantsRepository.save(participant);
        }
        throw new ResourceNotFoundException("Event participant not found with id: " + id);
    }
}
