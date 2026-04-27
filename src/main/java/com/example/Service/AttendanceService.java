package com.example.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.lang.NonNull;

import com.example.Entity.Attendance;

public interface AttendanceService {
    List<Attendance> getAllAttendance();
    List<Attendance> getAttendanceByFilters(Integer eventId, Integer userId, LocalDateTime startDate, LocalDateTime endDate);
    Optional<Attendance> getAttendanceById(@NonNull Integer id);
    Attendance markAttendance(Integer userId, Integer eventId, Attendance.AttendanceStatus status, LocalDateTime checkInTime, String remarks, Integer markedByUserId);
    List<Attendance> markAllPresent(Integer eventId, LocalDateTime checkInTime, String remarks, Integer markedByUserId);
    Attendance saveAttendance(@NonNull Attendance attendance);
    Attendance updateAttendance(@NonNull Integer id, @NonNull Attendance details);
    void deleteAttendance(@NonNull Integer id);
}
