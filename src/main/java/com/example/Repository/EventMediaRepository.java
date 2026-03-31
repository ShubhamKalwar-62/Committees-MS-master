package com.example.Repository;

import com.example.Entity.EventMedia;
import com.example.Entity.Events;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventMediaRepository extends JpaRepository<EventMedia, Integer> {
    
    List<EventMedia> findByEvent(Events event);
    
    List<EventMedia> findByFileType(EventMedia.MediaType fileType);
    
    @Query("SELECT em FROM EventMedia em WHERE em.event.eventId = :eventId")
    List<EventMedia> findByEventId(@Param("eventId") Integer eventId);
    
    @Query("SELECT em FROM EventMedia em WHERE em.fileName LIKE %:fileName%")
    List<EventMedia> findByFileNameContaining(@Param("fileName") String fileName);
    
    @Query("SELECT em FROM EventMedia em WHERE em.fileSize <= :maxSize")
    List<EventMedia> findByFileSizeLessThanEqual(@Param("maxSize") Long maxSize);
    
    @Query("SELECT em FROM EventMedia em WHERE em.event.eventId = :eventId AND em.fileType = :fileType")
    List<EventMedia> findByEventIdAndFileType(@Param("eventId") Integer eventId, @Param("fileType") EventMedia.MediaType fileType);
}