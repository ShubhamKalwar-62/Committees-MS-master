package com.example.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.EventCategory;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.EventCategoryRepository;

@Service
public class EventCategoryServiceImpl implements EventCategoryService {

    @Autowired
    private EventCategoryRepository eventCategoryRepository;

    @Override
    public List<EventCategory> getAllCategories() {
        return eventCategoryRepository.findAll();
    }

    @Override
    public Optional<EventCategory> getCategoryById(Integer id) {
        return eventCategoryRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public EventCategory saveCategory(EventCategory category) {
        return eventCategoryRepository.save(Objects.requireNonNull(category, "category must not be null"));
    }

    @Override
    public EventCategory updateCategory(Integer id, EventCategory details) {
        Integer safeId = Objects.requireNonNull(id, "id must not be null");
        EventCategory safeDetails = Objects.requireNonNull(details, "category details must not be null");
        return eventCategoryRepository.findById(safeId).map(existing -> {
            existing.setCategoryName(safeDetails.getCategoryName());
            return eventCategoryRepository.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Event category not found with id: " + id));
    }

    @Override
    public void deleteCategory(Integer id) {
        eventCategoryRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }
}
