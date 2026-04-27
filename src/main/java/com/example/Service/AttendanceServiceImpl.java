package com.example.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.example.Entity.Attendance;
import com.example.Entity.Events;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.AttendanceRepository;
import com.example.Repository.EventsRepository;
import com.example.Repository.UsersRepository;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EventsRepository eventsRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .sorted(attendanceSortComparator())
                .collect(Collectors.toList());
    }

    @Override
    public List<Attendance> getAttendanceByFilters(Integer eventId, Integer userId, LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime normalizedStart = startDate;
        LocalDateTime normalizedEnd = endDate;

        if (normalizedStart != null && normalizedEnd != null && normalizedStart.isAfter(normalizedEnd)) {
            LocalDateTime temp = normalizedStart;
            normalizedStart = normalizedEnd;
            normalizedEnd = temp;
        }

        final LocalDateTime start = normalizedStart;
        final LocalDateTime end = normalizedEnd;

        return attendanceRepository.findAll().stream()
                .filter(record -> eventId == null
                        || (record.getEvent() != null && Objects.equals(record.getEvent().getEventId(), eventId)))
            .filter(record -> userId == null
                || (record.getUser() != null && Objects.equals(record.getUser().getUserId(), userId)))
                .filter(record -> {
                    LocalDateTime checkInTime = record.getCheckInTime();
                    if (checkInTime == null) {
                        return start == null && end == null;
                    }
                    if (start != null && checkInTime.isBefore(start)) {
                        return false;
                    }
                    if (end != null && checkInTime.isAfter(end)) {
                        return false;
                    }
                    return true;
                })
                .sorted(attendanceSortComparator())
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Attendance> getAttendanceById(@NonNull Integer id) {
        return attendanceRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public Attendance markAttendance(Integer userId, Integer eventId, Attendance.AttendanceStatus status,
            LocalDateTime checkInTime, String remarks, Integer markedByUserId) {
        Integer safeUserId = Objects.requireNonNull(userId, "userId must not be null");
        Integer safeEventId = Objects.requireNonNull(eventId, "eventId must not be null");

        Users user = usersRepository.findById(safeUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + safeUserId));
        Events event = eventsRepository.findById(safeEventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + safeEventId));

        Attendance attendance = attendanceRepository
                .findTopByUserUserIdAndEventEventIdOrderByCreatedAtDesc(safeUserId, safeEventId)
                .orElseGet(Attendance::new);

        attendance.setUser(user);
        attendance.setEvent(event);
        attendance.setStatus(status != null ? status : Attendance.AttendanceStatus.PRESENT);
        attendance.setAttendanceMethod(Attendance.AttendanceMethod.MANUAL);
        attendance.setRemarks(remarks);

        if (checkInTime != null) {
            attendance.setCheckInTime(checkInTime);
        } else if (attendance.getCheckInTime() == null) {
            attendance.setCheckInTime(LocalDateTime.now());
        }

        if (markedByUserId != null) {
            Users marker = usersRepository.findById(markedByUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Marked-by user not found with id: " + markedByUserId));
            attendance.setMarkedBy(marker);
        }

        return attendanceRepository.save(attendance);
    }

    @Override
    public List<Attendance> markAllPresent(Integer eventId, LocalDateTime checkInTime, String remarks,
            Integer markedByUserId) {
        Integer safeEventId = Objects.requireNonNull(eventId, "eventId must not be null");

        Events event = eventsRepository.findById(safeEventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + safeEventId));

        Users marker = null;
        if (markedByUserId != null) {
            marker = usersRepository.findById(markedByUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Marked-by user not found with id: " + markedByUserId));
        }

        LocalDateTime effectiveCheckInTime = checkInTime != null ? checkInTime : LocalDateTime.now();
        List<Attendance> results = new ArrayList<>();

        for (Users user : usersRepository.findAllWithLogin()) {
            Integer currentUserId = user.getUserId();
            if (currentUserId == null || !isStudentUser(user)) {
                continue;
            }

            Attendance attendance = attendanceRepository
                    .findTopByUserUserIdAndEventEventIdOrderByCreatedAtDesc(currentUserId, safeEventId)
                    .orElseGet(Attendance::new);

            attendance.setUser(user);
            attendance.setEvent(event);
            attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
            attendance.setAttendanceMethod(Attendance.AttendanceMethod.MANUAL);

            if (checkInTime != null || attendance.getCheckInTime() == null) {
                attendance.setCheckInTime(effectiveCheckInTime);
            }

            if (remarks != null && !remarks.isBlank()) {
                attendance.setRemarks(remarks);
            }

            if (marker != null) {
                attendance.setMarkedBy(marker);
            }

            results.add(attendanceRepository.save(attendance));
        }

        return results.stream()
                .sorted(attendanceSortComparator())
                .collect(Collectors.toList());
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

    private Comparator<Attendance> attendanceSortComparator() {
        return Comparator.comparing(Attendance::getCheckInTime, Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed();
    }

    private boolean isStudentUser(Users user) {
        if (user == null || user.getLogin() == null) {
            return false;
        }

        String role = normalizeRole(user.getLogin().getRole());
        return "STUDENT".equals(role);
    }

    private String normalizeRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return "";
        }

        String normalized = rawRole.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            return normalized.substring(5);
        }

        return normalized;
    }
}
