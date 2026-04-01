package com.example.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Entity.EventCategory;

@Repository
public interface EventCategoryRepository extends JpaRepository<EventCategory, Integer> {

    Optional<EventCategory> findByCategoryName(String categoryName);
}
