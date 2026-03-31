package com.example.Repository;

import com.example.Entity.EventFeedback;
import com.example.Entity.Events;
import com.example.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventFeedbackRepository extends JpaRepository<EventFeedback, Integer> {
    
    List<EventFeedback> findByEvent(Events event);
    
    List<EventFeedback> findByUser(Users user);
    
    Optional<EventFeedback> findByEventAndUser(Events event, Users user);
    
    List<EventFeedback> findByRating(Integer rating);
    
    @Query("SELECT ef FROM EventFeedback ef WHERE ef.event.eventId = :eventId ORDER BY ef.submittedAt DESC")
    List<EventFeedback> findByEventIdOrderBySubmittedAt(@Param("eventId") Integer eventId);
    
    @Query("SELECT AVG(ef.rating) FROM EventFeedback ef WHERE ef.event.eventId = :eventId")
    Double getAverageRatingByEventId(@Param("eventId") Integer eventId);
    
    @Query("SELECT ef FROM EventFeedback ef WHERE ef.rating >= :minRating")
    List<EventFeedback> findByRatingGreaterThanEqual(@Param("minRating") Integer minRating);
    
    @Query("SELECT ef FROM EventFeedback ef WHERE ef.comments LIKE %:keyword%")
    List<EventFeedback> findByCommentsContaining(@Param("keyword") String keyword);
}