package com.example.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Entity.Attendance;
import com.example.Entity.Events;
import com.example.Entity.Users;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    List<Attendance> findByEvent(Events event);

    List<Attendance> findByEventEventId(Integer eventId);

    List<Attendance> findByUser(Users user);

    List<Attendance> findByStatus(String status);

    List<Attendance> findByCheckInTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

    Optional<Attendance> findTopByUserUserIdAndEventEventIdOrderByCreatedAtDesc(Integer userId, Integer eventId);

    long countByEventEventIdAndStatusIn(Integer eventId, Collection<Attendance.AttendanceStatus> statuses);
}
