package com.example.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.Attendance;
import com.example.Response.ResponceBean;
import com.example.Service.AttendanceService;
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
    public ResponseEntity<ResponceBean<List<Attendance>>> getAllAttendance() {
        return ResponseEntity.ok(ResponceBean.success("Attendance retrieved successfully", attendanceService.getAllAttendance()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get attendance by ID", description = "Retrieve attendance by ID")
    public ResponseEntity<ResponceBean<Attendance>> getAttendanceById(@PathVariable Integer id) {
        Optional<Attendance> attendance = attendanceService.getAttendanceById(id);
        return attendance.map(value -> ResponseEntity.ok(ResponceBean.success("Attendance retrieved successfully", value)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Attendance not found")));
    }

    @PostMapping
    @Operation(summary = "Create attendance", description = "Create a new attendance record")
    public ResponseEntity<ResponceBean<Attendance>> createAttendance(@RequestBody Attendance attendance) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Attendance created successfully", attendanceService.saveAttendance(attendance)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update attendance", description = "Update an attendance record")
    public ResponseEntity<ResponceBean<Attendance>> updateAttendance(@PathVariable Integer id, @RequestBody Attendance attendance) {
        Attendance updated = attendanceService.updateAttendance(id, attendance);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Attendance not found"));
        }
        return ResponseEntity.ok(ResponceBean.success("Attendance updated successfully", updated));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch attendance", description = "Partially update attendance record")
    public ResponseEntity<ResponceBean<Attendance>> patchAttendance(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Optional<Attendance> existing = attendanceService.getAttendanceById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Attendance not found"));
        }
        try {
            updates.remove("attendanceId");
            updates.remove("createdAt");
            Attendance patched = objectMapper.updateValue(existing.get(), updates);
            Attendance saved = attendanceService.saveAttendance(patched);
            return ResponseEntity.ok(ResponceBean.success("Attendance patched successfully", saved));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete attendance", description = "Delete an attendance record")
    public ResponseEntity<ResponceBean<String>> deleteAttendance(@PathVariable Integer id) {
        Optional<Attendance> existing = attendanceService.getAttendanceById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Attendance not found"));
        }
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok(ResponceBean.success("Attendance deleted successfully"));
    }
}
