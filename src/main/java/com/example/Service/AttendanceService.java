package com.example.Service;

import java.util.List;
import java.util.Optional;

import com.example.Entity.Attendance;

public interface AttendanceService {
    List<Attendance> getAllAttendance();
    Optional<Attendance> getAttendanceById(Integer id);
    Attendance saveAttendance(Attendance attendance);
    Attendance updateAttendance(Integer id, Attendance details);
    void deleteAttendance(Integer id);
}
