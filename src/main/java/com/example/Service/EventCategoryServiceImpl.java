package com.example.Service;

import java.util.List;
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
        return eventCategoryRepository.findById(id);
    }

    @Override
    public EventCategory saveCategory(EventCategory category) {
        return eventCategoryRepository.save(category);
    }

    @Override
    public EventCategory updateCategory(Integer id, EventCategory details) {
        return eventCategoryRepository.findById(id).map(existing -> {
            existing.setCategoryName(details.getCategoryName());
            return eventCategoryRepository.save(existing);
        }).orElseThrow(() -> new ResourceNotFoundException("Event category not found with id: " + id));
    }

    @Override
    public void deleteCategory(Integer id) {
        eventCategoryRepository.deleteById(id);
    }
}
