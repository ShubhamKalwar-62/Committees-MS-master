package com.example.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.Entity.Committee;
import com.example.Entity.Task;
import com.example.Entity.Users;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    
    List<Task> findByCommittee(Committee committee);
    
    List<Task> findByCreatedBy(Users createdBy);
    
    List<Task> findByAssignedTo(Users assignedTo);
    
    List<Task> findByStatus(Task.TaskStatus status);
    
    List<Task> findByPriority(Task.TaskPriority priority);
    
    @Query("SELECT t FROM Task t WHERE t.committee.committeeId = :committeeId ORDER BY t.createdAt DESC")
    List<Task> findByCommitteeIdOrderByCreatedAt(@Param("committeeId") Integer committeeId);
    
    @Query("SELECT t FROM Task t WHERE t.assignedTo.userId = :userId AND t.status = :status")
    List<Task> findByAssignedToUserIdAndStatus(@Param("userId") Integer userId, @Param("status") Task.TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.assignedTo.userId = :userId ORDER BY t.createdAt DESC")
    List<Task> findByAssignedToUserIdOrderByCreatedAtDesc(@Param("userId") Integer userId);
    
    @Query("SELECT t FROM Task t WHERE t.endDate <= :date AND t.status != 'COMPLETED'")
    List<Task> findOverdueTasks(@Param("date") LocalDateTime date);
    
    @Query("SELECT t FROM Task t WHERE t.title LIKE %:title%")
    List<Task> findByTitleContaining(@Param("title") String title);
    
    @Query("SELECT t FROM Task t WHERE t.startDate BETWEEN :startDate AND :endDate")
    List<Task> findByStartDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}