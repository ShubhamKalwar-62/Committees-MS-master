package com.example.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.example.Entity.Attendance;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.AttendanceRepository;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @Override
    public Optional<Attendance> getAttendanceById(@NonNull Integer id) {
        return attendanceRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public Attendance saveAttendance(@NonNull Attendance attendance) {
        return attendanceRepository.save(Objects.requireNonNull(attendance, "attendance must not be null"));
    }

    @Override
    public Attendance updateAttendance(@NonNull Integer id, @NonNull Attendance details) {
        Integer safeId = Objects.requireNonNull(id, "id must not be null");
        Attendance safeDetails = Objects.requireNonNull(details, "attendance details must not be null");
        return attendanceRepository.findById(safeId).map(existing -> {
            existing.setUser(safeDetails.getUser());
            existing.setEvent(safeDetails.getEvent());
            existing.setStatus(safeDetails.getStatus());
            existing.setCheckInTime(safeDetails.getCheckInTime());
            existing.setCheckOutTime(safeDetails.getCheckOutTime());
            existing.setAttendanceMethod(safeDetails.getAttendanceMethod());
            existing.setMarkedBy(safeDetails.getMarkedBy());
            existing.setRemarks(safeDetails.getRemarks());
            return attendanceRepository.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
    }

    @Override
    public void deleteAttendance(@NonNull Integer id) {
        attendanceRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }
}
