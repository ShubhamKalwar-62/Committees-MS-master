package com.example.Repository;

import com.example.Entity.Announcements;
import com.example.Entity.Users;
import com.example.Entity.Committee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementsRepository extends JpaRepository<Announcements, Integer> {
    
    List<Announcements> findByCommittee(Committee committee);
    
    List<Announcements> findByUser(Users user);
    
    @Query("SELECT a FROM Announcements a WHERE a.committee.committeeId = :committeeId ORDER BY a.createdAt DESC")
    List<Announcements> findByCommitteeIdOrderByCreatedAtDesc(@Param("committeeId") Integer committeeId);
    
    @Query("SELECT a FROM Announcements a WHERE a.message LIKE %:message%")
    List<Announcements> findByMessageContaining(@Param("message") String message);
    
    @Query("SELECT a FROM Announcements a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    List<Announcements> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}