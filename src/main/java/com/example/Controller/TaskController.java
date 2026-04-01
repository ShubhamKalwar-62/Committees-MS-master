package com.example.Controller;

import java.util.List;
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

import com.example.Entity.Task;
import com.example.Response.ResponceBean;
import com.example.Service.TaskService;
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
    public ResponseEntity<ResponceBean<Task>> createTask(@RequestBody Task task) {
        Task savedTask = taskService.saveTask(task);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Task created successfully", savedTask));
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
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
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
}