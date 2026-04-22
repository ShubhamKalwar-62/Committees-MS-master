package com.example.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.Entity.EventParticipants;
import com.example.Entity.Events;
import com.example.Entity.Users;

@Repository
public interface EventParticipantsRepository extends JpaRepository<EventParticipants, Integer> {
    
    List<EventParticipants> findByEvent(Events event);
    
    List<EventParticipants> findByUser(Users user);
    
    Optional<EventParticipants> findByEventAndUser(Events event, Users user);
    
    List<EventParticipants> findByStatus(EventParticipants.RegistrationStatus status);

    List<EventParticipants> findByStatusOrderByRegisteredAtAsc(EventParticipants.RegistrationStatus status);
    
    @Query("SELECT ep FROM EventParticipants ep WHERE ep.event.eventId = :eventId")
    List<EventParticipants> findByEventId(@Param("eventId") Integer eventId);
    
    @Query("SELECT ep FROM EventParticipants ep WHERE ep.user.userId = :userId")
    List<EventParticipants> findByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(ep) FROM EventParticipants ep WHERE ep.event.eventId = :eventId AND ep.status = 'APPROVED'")
    Long countRegisteredParticipantsByEventId(@Param("eventId") Integer eventId);
    
    List<EventParticipants> findByAttended(Boolean attended);
}