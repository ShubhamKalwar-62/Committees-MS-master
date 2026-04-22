package com.example.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Entity.Attendance;
import com.example.Entity.EventParticipants;
import com.example.Entity.EventQrSession;
import com.example.Entity.Events;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.AttendanceRepository;
import com.example.Repository.EventParticipantsRepository;
import com.example.Repository.EventQrSessionRepository;
import com.example.Repository.EventsRepository;
import com.example.Repository.UsersRepository;

@Service
public class QrAttendanceServiceImpl implements QrAttendanceService {

    private static final int DEFAULT_SESSION_MINUTES = 5;
    private static final int DEFAULT_REFRESH_SECONDS = 45;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private EventQrSessionRepository eventQrSessionRepository;

    @Autowired
    private EventsRepository eventsRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EventParticipantsRepository eventParticipantsRepository;

    @Override
    @Transactional
    public EventQrSession startSession(Integer eventId, Integer durationMinutes) {
        Integer safeEventId = Objects.requireNonNull(eventId, "eventId must not be null");
        int effectiveMinutes = durationMinutes != null && durationMinutes > 0 ? durationMinutes : DEFAULT_SESSION_MINUTES;

        Events event = eventsRepository.findById(safeEventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + safeEventId));

        LocalDateTime now = LocalDateTime.now();
        List<EventQrSession> existingSessions = eventQrSessionRepository.findByEventEventIdOrderByCreatedAtDesc(safeEventId);
        for (EventQrSession existing : existingSessions) {
            if (isActive(existing, now)) {
                existing.setEndedAt(now);
                existing.setExpiresAt(now);
                eventQrSessionRepository.save(existing);
            }
        }

        EventQrSession session = new EventQrSession();
        session.setEvent(event);
        session.setQrToken(generateQrToken(safeEventId));
        session.setExpiresAt(now.plusMinutes(effectiveMinutes));
        session.setEndedAt(null);
        return eventQrSessionRepository.save(session);
    }

    @Override
    @Transactional
    public EventQrSession refreshSession(Integer sessionId, Integer durationSeconds) {
        EventQrSession session = getSession(sessionId);
        int effectiveDurationSeconds = durationSeconds != null && durationSeconds > 0
                ? durationSeconds
                : DEFAULT_REFRESH_SECONDS;

        LocalDateTime now = LocalDateTime.now();
        session.setQrToken(generateQrToken(session.getEvent().getEventId()));
        session.setExpiresAt(now.plusSeconds(effectiveDurationSeconds));
        session.setEndedAt(null);
        return eventQrSessionRepository.save(session);
    }

    @Override
    @Transactional
    public EventQrSession endSession(Integer sessionId) {
        EventQrSession session = getSession(sessionId);
        LocalDateTime now = LocalDateTime.now();

        session.setEndedAt(now);
        if (session.getExpiresAt() == null || session.getExpiresAt().isAfter(now)) {
            session.setExpiresAt(now);
        }

        return eventQrSessionRepository.save(session);
    }

    @Override
    public EventQrSession getSession(Integer sessionId) {
        Integer safeSessionId = Objects.requireNonNull(sessionId, "sessionId must not be null");
        return eventQrSessionRepository.findById(safeSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("QR session not found with id: " + safeSessionId));
    }

    @Override
    @Transactional
    public Attendance scanAttendance(String qrToken, Integer requestedUserId, String requesterEmail) {
        String normalizedQrToken = normalizeText(qrToken);
        if (normalizedQrToken.isEmpty()) {
            throw new IllegalArgumentException("Invalid QR");
        }

        EventQrSession session = eventQrSessionRepository.findByQrToken(normalizedQrToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid QR"));

        LocalDateTime now = LocalDateTime.now();
        if (!isActive(session, now)) {
            throw new IllegalStateException("QR expired");
        }

        String normalizedRequesterEmail = normalizeText(requesterEmail);
        if (normalizedRequesterEmail.isEmpty()) {
            throw new AccessDeniedException("Unauthorized user");
        }

        Users requester = usersRepository.findByEmail(normalizedRequesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for authenticated account"));

        if (!isStudent(requester)) {
            throw new AccessDeniedException("Only students can scan QR");
        }

        if (requestedUserId != null && !Objects.equals(requestedUserId, requester.getUserId())) {
            throw new AccessDeniedException("You cannot submit attendance for another user");
        }

        Events event = session.getEvent();
        if (event == null || event.getEventId() == null) {
            throw new IllegalArgumentException("Invalid QR");
        }

        EventParticipants registration = eventParticipantsRepository.findByEventAndUser(event, requester)
                .orElseThrow(() -> new IllegalStateException("You are not registered for this event"));

        if (registration.getStatus() != EventParticipants.RegistrationStatus.APPROVED) {
            throw new IllegalStateException("Registration is not approved");
        }

        Optional<Attendance> existingAttendance = attendanceRepository
                .findTopByUserUserIdAndEventEventIdOrderByCreatedAtDesc(requester.getUserId(), event.getEventId());
        if (existingAttendance.isPresent()) {
            throw new IllegalStateException("Already checked in");
        }

        Attendance attendance = new Attendance();
        attendance.setUser(requester);
        attendance.setEvent(event);
        attendance.setAttendanceMethod(Attendance.AttendanceMethod.QR);
        attendance.setCheckInTime(now);
        attendance.setStatus(isLate(event, now) ? Attendance.AttendanceStatus.LATE : Attendance.AttendanceStatus.PRESENT);
        attendance.setRemarks("Checked in via QR attendance");

        Attendance savedAttendance = attendanceRepository.save(attendance);

        registration.setAttended(true);
        eventParticipantsRepository.save(registration);

        return savedAttendance;
    }

    @Override
    public long getLiveAttendanceCount(Integer eventId) {
        Integer safeEventId = Objects.requireNonNull(eventId, "eventId must not be null");
        return attendanceRepository.countByEventEventIdAndStatusIn(
                safeEventId,
                List.of(Attendance.AttendanceStatus.PRESENT, Attendance.AttendanceStatus.LATE));
    }

    private boolean isActive(EventQrSession session, LocalDateTime currentTime) {
        if (session == null || session.getExpiresAt() == null) {
            return false;
        }

        if (session.getEndedAt() != null) {
            return false;
        }

        return currentTime.isBefore(session.getExpiresAt());
    }

    private boolean isLate(Events event, LocalDateTime checkInTime) {
        LocalDateTime eventStartTime = event.getEventDate();
        if (eventStartTime == null) {
            return false;
        }

        return checkInTime.isAfter(eventStartTime);
    }

    private boolean isStudent(Users user) {
        if (user == null || user.getLogin() == null) {
            return false;
        }

        String role = normalizeRole(user.getLogin().getRole());
        return "STUDENT".equals(role);
    }

    private String normalizeRole(String rawRole) {
        String normalized = normalizeText(rawRole).toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            return normalized.substring(5);
        }
        return normalized;
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }

    private String generateQrToken(Integer eventId) {
        byte[] randomBytes = new byte[6];
        RANDOM.nextBytes(randomBytes);
        String randomSuffix = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        return eventId + "_" + System.currentTimeMillis() + "_" + randomSuffix;
    }
}
