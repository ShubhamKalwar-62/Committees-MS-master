package com.example.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.lang.NonNull;

import com.example.Entity.Attendance;

public interface AttendanceService {
    List<Attendance> getAllAttendance();
    Optional<Attendance> getAttendanceById(@NonNull Integer id);
    Attendance saveAttendance(@NonNull Attendance attendance);
    Attendance updateAttendance(@NonNull Integer id, @NonNull Attendance details);
    void deleteAttendance(@NonNull Integer id);
}
