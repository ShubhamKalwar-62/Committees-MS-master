package com.example.Controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.Attendance;
import com.example.Response.ResponceBean;
import com.example.Service.AttendanceService;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/attendance")
@Tag(name = "Attendance Management", description = "APIs for managing attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    @Operation(summary = "Get all attendance", description = "Retrieve all attendance records")
    public ResponseEntity<ResponceBean<List<Attendance>>> getAllAttendance(
            @RequestParam(required = false) Integer eventId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDateTime parsedStartDate = parseFlexibleDateTime(startDate, true);
            LocalDateTime parsedEndDate = parseFlexibleDateTime(endDate, false);
            List<Attendance> records = attendanceService.getAttendanceByFilters(eventId, parsedStartDate, parsedEndDate);
            return ResponseEntity.ok(ResponceBean.success("Attendance retrieved successfully", records));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid attendance filter", ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get attendance by ID", description = "Retrieve attendance by ID")
    public ResponseEntity<ResponceBean<Attendance>> getAttendanceById(@PathVariable @NonNull Integer id) {
        Optional<Attendance> attendance = attendanceService.getAttendanceById(id);
        return attendance.map(value -> ResponseEntity.ok(ResponceBean.success("Attendance retrieved successfully", value)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Attendance not found")));
    }

    @PostMapping
    @Operation(summary = "Create attendance", description = "Create a new attendance record")
    public ResponseEntity<ResponceBean<Attendance>> createAttendance(@RequestBody @NonNull AttendanceCreateRequest request) {
        Integer userId = request.resolveUserId();
        Integer eventId = request.resolveEventId();

        if (userId == null || userId <= 0 || eventId == null || eventId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid attendance payload", "user_id and event_id are required positive integers"));
        }

        try {
            Attendance.AttendanceStatus status = parseAttendanceStatus(request.getStatus());
            LocalDateTime checkInTime = parseFlexibleDateTime(request.getCheckInTime(), true);

            Attendance saved = attendanceService.markAttendance(
                    userId,
                    eventId,
                    status,
                    checkInTime,
                    request.getRemarks(),
                    request.resolveMarkedById());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ResponceBean.success("Attendance created successfully", saved));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid attendance payload", ex.getMessage()));
        }
    }

    @PostMapping("/mark-all-present")
    @Operation(summary = "Mark all students present", description = "Mark all student users as present for a selected event")
    public ResponseEntity<ResponceBean<List<Attendance>>> markAllPresent(@RequestBody @NonNull MarkAllPresentRequest request) {
        Integer eventId = request.resolveEventId();
        if (eventId == null || eventId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid request", "event_id is required and must be a positive integer"));
        }

        try {
            LocalDateTime checkInTime = parseFlexibleDateTime(request.getCheckInTime(), true);
            List<Attendance> records = attendanceService.markAllPresent(
                    eventId,
                    checkInTime,
                    request.getRemarks(),
                    request.resolveMarkedById());
            return ResponseEntity.ok(ResponceBean.success("Marked all users present successfully", records));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid request", ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update attendance", description = "Update an attendance record")
    public ResponseEntity<ResponceBean<Attendance>> updateAttendance(@PathVariable @NonNull Integer id, @RequestBody @NonNull Attendance attendance) {
        Attendance updated = attendanceService.updateAttendance(id, attendance);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Attendance not found"));
        }
        return ResponseEntity.ok(ResponceBean.success("Attendance updated successfully", updated));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch attendance", description = "Partially update attendance record")
    public ResponseEntity<ResponceBean<Attendance>> patchAttendance(@PathVariable @NonNull Integer id, @RequestBody @NonNull Map<String, Object> updates) {
        Optional<Attendance> existing = attendanceService.getAttendanceById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Attendance not found"));
        }
        try {
            updates.remove("attendanceId");
            updates.remove("createdAt");
            Attendance patched = objectMapper.updateValue(existing.get(), updates);
            Attendance saved = attendanceService.saveAttendance(Objects.requireNonNull(patched, "patched attendance must not be null"));
            return ResponseEntity.ok(ResponceBean.success("Attendance patched successfully", saved));
        } catch (IllegalArgumentException | JsonMappingException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete attendance", description = "Delete an attendance record")
    public ResponseEntity<ResponceBean<String>> deleteAttendance(@PathVariable @NonNull Integer id) {
        Optional<Attendance> existing = attendanceService.getAttendanceById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Attendance not found"));
        }
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok(ResponceBean.success("Attendance deleted successfully"));
    }

    private Attendance.AttendanceStatus parseAttendanceStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return Attendance.AttendanceStatus.PRESENT;
        }

        try {
            return Attendance.AttendanceStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("status must be one of PRESENT, ABSENT, LATE");
        }
    }

    private LocalDateTime parseFlexibleDateTime(String rawValue, boolean isStartBoundary) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        String value = rawValue.trim();

        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
        } catch (DateTimeParseException ignored) {
        }

        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        try {
            return ZonedDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        try {
            LocalDate date = LocalDate.parse(value);
            return isStartBoundary ? date.atStartOfDay() : date.atTime(LocalTime.MAX);
        } catch (DateTimeParseException ignored) {
        }

        throw new IllegalArgumentException("Date values must be valid ISO date/time (example: 2026-04-20 or 2026-04-20T10:30:00)");
    }

    public static class AttendanceCreateRequest {
        @JsonProperty("user_id")
        @JsonAlias({ "userId" })
        private Integer userId;

        @JsonProperty("event_id")
        @JsonAlias({ "eventId" })
        private Integer eventId;

        private String status;
        private String checkInTime;
        private String remarks;

        @JsonProperty("marked_by")
        @JsonAlias({ "markedById" })
        private Integer markedById;

        private UserRef user;
        private EventRef event;
        private UserRef markedBy;

        public Integer getUserId() {
            return userId;
        }

        public void setUserId(Integer userId) {
            this.userId = userId;
        }

        public Integer getEventId() {
            return eventId;
        }

        public void setEventId(Integer eventId) {
            this.eventId = eventId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getCheckInTime() {
            return checkInTime;
        }

        public void setCheckInTime(String checkInTime) {
            this.checkInTime = checkInTime;
        }

        public String getRemarks() {
            return remarks;
        }

        public void setRemarks(String remarks) {
            this.remarks = remarks;
        }

        public Integer getMarkedById() {
            return markedById;
        }

        public void setMarkedById(Integer markedById) {
            this.markedById = markedById;
        }

        public UserRef getUser() {
            return user;
        }

        public void setUser(UserRef user) {
            this.user = user;
        }

        public EventRef getEvent() {
            return event;
        }

        public void setEvent(EventRef event) {
            this.event = event;
        }

        public UserRef getMarkedBy() {
            return markedBy;
        }

        public void setMarkedBy(UserRef markedBy) {
            this.markedBy = markedBy;
        }

        public Integer resolveUserId() {
            if (userId != null) {
                return userId;
            }
            return user != null ? user.getUserId() : null;
        }

        public Integer resolveEventId() {
            if (eventId != null) {
                return eventId;
            }
            return event != null ? event.getEventId() : null;
        }

        public Integer resolveMarkedById() {
            if (markedById != null) {
                return markedById;
            }
            return markedBy != null ? markedBy.getUserId() : null;
        }
    }

    public static class MarkAllPresentRequest {
        @JsonProperty("event_id")
        @JsonAlias({ "eventId" })
        private Integer eventId;

        private String checkInTime;
        private String remarks;

        @JsonProperty("marked_by")
        @JsonAlias({ "markedById" })
        private Integer markedById;

        private EventRef event;
        private UserRef markedBy;

        public Integer getEventId() {
            return eventId;
        }

        public void setEventId(Integer eventId) {
            this.eventId = eventId;
        }

        public String getCheckInTime() {
            return checkInTime;
        }

        public void setCheckInTime(String checkInTime) {
            this.checkInTime = checkInTime;
        }

        public String getRemarks() {
            return remarks;
        }

        public void setRemarks(String remarks) {
            this.remarks = remarks;
        }

        public Integer getMarkedById() {
            return markedById;
        }

        public void setMarkedById(Integer markedById) {
            this.markedById = markedById;
        }

        public EventRef getEvent() {
            return event;
        }

        public void setEvent(EventRef event) {
            this.event = event;
        }

        public UserRef getMarkedBy() {
            return markedBy;
        }

        public void setMarkedBy(UserRef markedBy) {
            this.markedBy = markedBy;
        }

        public Integer resolveEventId() {
            if (eventId != null) {
                return eventId;
            }
            return event != null ? event.getEventId() : null;
        }

        public Integer resolveMarkedById() {
            if (markedById != null) {
                return markedById;
            }
            return markedBy != null ? markedBy.getUserId() : null;
        }
    }

    public static class UserRef {
        private Integer userId;

        public Integer getUserId() {
            return userId;
        }

        public void setUserId(Integer userId) {
            this.userId = userId;
        }
    }

    public static class EventRef {
        private Integer eventId;

        public Integer getEventId() {
            return eventId;
        }

        public void setEventId(Integer eventId) {
            this.eventId = eventId;
        }
    }
}
