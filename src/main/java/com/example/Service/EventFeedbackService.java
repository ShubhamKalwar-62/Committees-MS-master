package com.example.Service;

import com.example.Entity.EventFeedback;
import com.example.Entity.Events;
import com.example.Entity.Users;
import com.example.Repository.EventFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventFeedbackService {
    
    @Autowired
    private EventFeedbackRepository eventFeedbackRepository;
    
    public List<EventFeedback> getAllFeedback() {
        return eventFeedbackRepository.findAll();
    }
    
    public Optional<EventFeedback> getFeedbackById(Integer id) {
        return eventFeedbackRepository.findById(id);
    }
    
    public List<EventFeedback> getFeedbackByEvent(Events event) {
        return eventFeedbackRepository.findByEvent(event);
    }
    
    public List<EventFeedback> getFeedbackByUser(Users user) {
        return eventFeedbackRepository.findByUser(user);
    }
    
    public Optional<EventFeedback> getFeedbackByEventAndUser(Events event, Users user) {
        return eventFeedbackRepository.findByEventAndUser(event, user);
    }
    
    public List<EventFeedback> getFeedbackByEventId(Integer eventId) {
        return eventFeedbackRepository.findByEventIdOrderBySubmittedAt(eventId);
    }
    
    public List<EventFeedback> getFeedbackByRating(Integer rating) {
        return eventFeedbackRepository.findByRating(rating);
    }
    
    public List<EventFeedback> getFeedbackByMinRating(Integer minRating) {
        return eventFeedbackRepository.findByRatingGreaterThanEqual(minRating);
    }
    
    public Double getAverageRatingForEvent(Integer eventId) {
        return eventFeedbackRepository.getAverageRatingByEventId(eventId);
    }
    
    public List<EventFeedback> searchFeedbackByComments(String keyword) {
        return eventFeedbackRepository.findByCommentsContaining(keyword);
    }
    
    public EventFeedback saveFeedback(EventFeedback feedback) {
        return eventFeedbackRepository.save(feedback);
    }
    
    public void deleteFeedback(Integer id) {
        eventFeedbackRepository.deleteById(id);
    }
    
    public EventFeedback updateFeedback(Integer id, EventFeedback feedbackDetails) {
        Optional<EventFeedback> existingFeedback = eventFeedbackRepository.findById(id);
        if (existingFeedback.isPresent()) {
            EventFeedback feedback = existingFeedback.get();
            feedback.setRating(feedbackDetails.getRating());
            feedback.setComments(feedbackDetails.getComments());
            return eventFeedbackRepository.save(feedback);
        }
        return null;
    }
}