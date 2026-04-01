package com.example.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
    public Optional<Attendance> getAttendanceById(Integer id) {
        return attendanceRepository.findById(id);
    }

    @Override
    public Attendance saveAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance updateAttendance(Integer id, Attendance details) {
        return attendanceRepository.findById(id).map(existing -> {
            existing.setUser(details.getUser());
            existing.setEvent(details.getEvent());
            existing.setStatus(details.getStatus());
            existing.setCheckInTime(details.getCheckInTime());
            existing.setCheckOutTime(details.getCheckOutTime());
            existing.setAttendanceMethod(details.getAttendanceMethod());
            existing.setMarkedBy(details.getMarkedBy());
            existing.setRemarks(details.getRemarks());
            return attendanceRepository.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
    }

    @Override
    public void deleteAttendance(Integer id) {
        attendanceRepository.deleteById(id);
    }
}
