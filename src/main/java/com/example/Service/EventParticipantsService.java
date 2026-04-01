package com.example.Service;

import java.util.List;
import java.util.Optional;

import com.example.Entity.EventParticipants;
import com.example.Entity.Events;
import com.example.Entity.Users;

public interface EventParticipantsService {
    List<EventParticipants> getAllParticipants();
    Optional<EventParticipants> getParticipantById(Integer id);
    List<EventParticipants> getParticipantsByEvent(Events event);
    List<EventParticipants> getParticipantsByUser(Users user);
    Optional<EventParticipants> getParticipantByEventAndUser(Events event, Users user);
    List<EventParticipants> getParticipantsByEventId(Integer eventId);
    List<EventParticipants> getParticipantsByUserId(Integer userId);
    List<EventParticipants> getParticipantsByStatus(EventParticipants.RegistrationStatus status);
    List<EventParticipants> getParticipantsByAttendance(Boolean attended);
    Long getRegisteredParticipantsCount(Integer eventId);
    EventParticipants saveParticipant(EventParticipants participant);
    void deleteParticipant(Integer id);
    EventParticipants updateParticipant(Integer id, EventParticipants participantDetails);
}