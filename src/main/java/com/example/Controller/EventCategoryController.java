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

import com.example.Entity.EventCategory;
import com.example.Response.ResponceBean;
import com.example.Service.EventCategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/event-categories")
@Tag(name = "Event Category Management", description = "APIs for managing event categories")
public class EventCategoryController {

    @Autowired
    private EventCategoryService eventCategoryService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    @Operation(summary = "Get all categories", description = "Retrieve all event categories")
    public ResponseEntity<ResponceBean<List<EventCategory>>> getAllCategories() {
        return ResponseEntity.ok(ResponceBean.success("Event categories retrieved successfully", eventCategoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Retrieve category by ID")
    public ResponseEntity<ResponceBean<EventCategory>> getCategoryById(@PathVariable Integer id) {
        Optional<EventCategory> category = eventCategoryService.getCategoryById(id);
        return category.map(value -> ResponseEntity.ok(ResponceBean.success("Event category retrieved successfully", value)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Event category not found")));
    }

    @PostMapping
    @Operation(summary = "Create category", description = "Create a new event category")
    public ResponseEntity<ResponceBean<EventCategory>> createCategory(@RequestBody EventCategory category) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Event category created successfully", eventCategoryService.saveCategory(category)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Update event category")
    public ResponseEntity<ResponceBean<EventCategory>> updateCategory(@PathVariable Integer id, @RequestBody EventCategory category) {
        EventCategory updated = eventCategoryService.updateCategory(id, category);
        if (updated == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Event category not found"));
        }
        return ResponseEntity.ok(ResponceBean.success("Event category updated successfully", updated));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch category", description = "Partially update event category")
    public ResponseEntity<ResponceBean<EventCategory>> patchCategory(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Optional<EventCategory> existing = eventCategoryService.getCategoryById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Event category not found"));
        }
        try {
            updates.remove("categoryId");
            EventCategory patched = objectMapper.updateValue(existing.get(), updates);
            EventCategory saved = eventCategoryService.saveCategory(patched);
            return ResponseEntity.ok(ResponceBean.success("Event category patched successfully", saved));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Delete event category")
    public ResponseEntity<ResponceBean<String>> deleteCategory(@PathVariable Integer id) {
        Optional<EventCategory> existing = eventCategoryService.getCategoryById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Event category not found"));
        }
        eventCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ResponceBean.success("Event category deleted successfully"));
    }
}
