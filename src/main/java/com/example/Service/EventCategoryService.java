package com.example.Service;

import java.util.List;
import java.util.Optional;

import com.example.Entity.EventCategory;

public interface EventCategoryService {
    List<EventCategory> getAllCategories();
    Optional<EventCategory> getCategoryById(Integer id);
    EventCategory saveCategory(EventCategory category);
    EventCategory updateCategory(Integer id, EventCategory details);
    void deleteCategory(Integer id);
}
