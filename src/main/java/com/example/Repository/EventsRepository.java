package com.example.Repository;

import com.example.Entity.Events;
import com.example.Entity.Committee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventsRepository extends JpaRepository<Events, Integer> {
    
    List<Events> findByCommittee(Committee committee);
    
    List<Events> findByStatus(Events.EventStatus status);
    
    @Query("SELECT e FROM Events e WHERE e.committee.committeeId = :committeeId ORDER BY e.eventDate ASC")
    List<Events> findByCommitteeIdOrderByEventDate(@Param("committeeId") Integer committeeId);
    
    @Query("SELECT e FROM Events e WHERE e.eventName LIKE %:eventName%")
    List<Events> findByEventNameContaining(@Param("eventName") String eventName);
    
    @Query("SELECT e FROM Events e WHERE e.eventDate BETWEEN :startDate AND :endDate")
    List<Events> findByEventDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT e FROM Events e WHERE e.location LIKE %:location%")
    List<Events> findByLocationContaining(@Param("location") String location);
}