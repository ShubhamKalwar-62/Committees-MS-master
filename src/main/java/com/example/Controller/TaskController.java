package com.example.Controller;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.Task;
import com.example.Exception.ResourceNotFoundException;
import com.example.Response.ResponceBean;
import com.example.Service.TaskService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Task Management", description = "APIs for managing tasks")
public class TaskController {
    
    @Autowired
    private TaskService taskService;

    @Autowired
    private ObjectMapper objectMapper;
    
    @GetMapping
    @Operation(summary = "Get all tasks", description = "Retrieve all tasks")
    public ResponseEntity<ResponceBean<List<Task>>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(ResponceBean.success("Tasks retrieved successfully", tasks));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID", description = "Retrieve a specific task by ID")
    public ResponseEntity<ResponceBean<Task>> getTaskById(@PathVariable Integer id) {
        Optional<Task> task = taskService.getTaskById(id);
        if (task.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Task retrieved successfully", task.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Task not found"));
    }
    
    @GetMapping("/committee/{committeeId}")
    @Operation(summary = "Get tasks by committee", description = "Retrieve tasks by committee ID")
    public ResponseEntity<ResponceBean<List<Task>>> getTasksByCommittee(@PathVariable Integer committeeId) {
        List<Task> tasks = taskService.getTasksByCommitteeId(committeeId);
        return ResponseEntity.ok(ResponceBean.success("Tasks retrieved successfully", tasks));
    }

    @GetMapping("/assigned/{userId}")
    @Operation(summary = "Get tasks by assignee", description = "Retrieve tasks assigned to a specific user ID")
    public ResponseEntity<ResponceBean<List<Task>>> getTasksByAssignee(@PathVariable Integer userId) {
        List<Task> tasks = taskService.getTasksByAssignedUserId(userId);
        return ResponseEntity.ok(ResponceBean.success("Assigned tasks retrieved successfully", tasks));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get tasks by status", description = "Retrieve tasks by status")
    public ResponseEntity<ResponceBean<List<Task>>> getTasksByStatus(@PathVariable Task.TaskStatus status) {
        List<Task> tasks = taskService.getTasksByStatus(status);
        return ResponseEntity.ok(ResponceBean.success("Tasks retrieved successfully", tasks));
    }
    
    @GetMapping("/priority/{priority}")
    @Operation(summary = "Get tasks by priority", description = "Retrieve tasks by priority")
    public ResponseEntity<ResponceBean<List<Task>>> getTasksByPriority(@PathVariable Task.TaskPriority priority) {
        List<Task> tasks = taskService.getTasksByPriority(priority);
        return ResponseEntity.ok(ResponceBean.success("Tasks retrieved successfully", tasks));
    }
    
    @GetMapping("/overdue")
    @Operation(summary = "Get overdue tasks", description = "Retrieve all overdue tasks")
    public ResponseEntity<ResponceBean<List<Task>>> getOverdueTasks() {
        List<Task> tasks = taskService.getOverdueTasks();
        return ResponseEntity.ok(ResponceBean.success("Overdue tasks retrieved successfully", tasks));
    }
    
    @PostMapping
    @Operation(summary = "Create new task", description = "Create a new task")
    public ResponseEntity<ResponceBean<Task>> createTask(@RequestBody java.util.Map<String, Object> payload) {
        try {
            Object rawStartDate = payload.remove("startDate");
            Object rawEndDate = payload.remove("endDate");

            Task task = objectMapper.convertValue(payload, Task.class);
            task.setStartDate(parseTaskDate(rawStartDate));
            task.setEndDate(parseTaskDate(rawEndDate));

            Task savedTask = taskService.saveTask(task);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ResponceBean.success("Task created successfully", savedTask));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid task payload", ex.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update task", description = "Update an existing task")
    public ResponseEntity<ResponceBean<Task>> updateTask(@PathVariable Integer id, @RequestBody Task taskDetails) {
        Task updatedTask = taskService.updateTask(id, taskDetails);
        if (updatedTask != null) {
            return ResponseEntity.ok(ResponceBean.success("Task updated successfully", updatedTask));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Task not found"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch task", description = "Partially update a task")
    public ResponseEntity<ResponceBean<Task>> patchTask(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> updates) {
        Optional<Task> existing = taskService.getTaskById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Task not found"));
        }
        try {
            updates.remove("taskId");
            updates.remove("createdAt");
            Task patched = objectMapper.updateValue(existing.get(), updates);
            Task saved = taskService.saveTask(patched);
            return ResponseEntity.ok(ResponceBean.success("Task patched successfully", saved));
        } catch (IllegalArgumentException | JsonProcessingException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Mark task as complete", description = "Mark a task as COMPLETED for the current authenticated user")
    public ResponseEntity<ResponceBean<Task>> markTaskAsComplete(@PathVariable Integer id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String requesterEmail = authentication != null ? authentication.getName() : null;
        if (requesterEmail == null || requesterEmail.isBlank() || "anonymousUser".equalsIgnoreCase(requesterEmail)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ResponceBean.error("Unauthorized"));
        }

        try {
            Task completedTask = taskService.markTaskAsComplete(id, requesterEmail);
            return ResponseEntity.ok(ResponceBean.success("Task marked as complete", completedTask));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponceBean.error(ex.getMessage()));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ResponceBean.error(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Unable to complete task", ex.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete task", description = "Delete a task")
    public ResponseEntity<ResponceBean<String>> deleteTask(@PathVariable Integer id) {
        Optional<Task> task = taskService.getTaskById(id);
        if (task.isPresent()) {
            taskService.deleteTask(id);
            return ResponseEntity.ok(ResponceBean.success("Task deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Task not found"));
    }

    private LocalDateTime parseTaskDate(Object rawDate) {
        if (rawDate == null) {
            return null;
        }

        String value = String.valueOf(rawDate).trim();
        if (value.isEmpty()) {
            return null;
        }

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

        throw new IllegalArgumentException("startDate/endDate must be valid ISO datetimes");
    }
}