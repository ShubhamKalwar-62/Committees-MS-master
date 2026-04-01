package com.example.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.EventFeedback;
import com.example.Entity.Events;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.EventFeedbackRepository;

@Service
public class EventFeedbackServiceImpl implements EventFeedbackService {

    @Autowired
    private EventFeedbackRepository eventFeedbackRepository;

    @Override
    public List<EventFeedback> getAllFeedback() {
        return eventFeedbackRepository.findAll();
    }

    @Override
    public Optional<EventFeedback> getFeedbackById(Integer id) {
        return eventFeedbackRepository.findById(id);
    }

    @Override
    public List<EventFeedback> getFeedbackByEvent(Events event) {
        return eventFeedbackRepository.findByEvent(event);
    }

    @Override
    public List<EventFeedback> getFeedbackByUser(Users user) {
        return eventFeedbackRepository.findByUser(user);
    }

    @Override
    public Optional<EventFeedback> getFeedbackByEventAndUser(Events event, Users user) {
        return eventFeedbackRepository.findByEventAndUser(event, user);
    }

    @Override
    public List<EventFeedback> getFeedbackByEventId(Integer eventId) {
        return eventFeedbackRepository.findByEventIdOrderBySubmittedAt(eventId);
    }

    @Override
    public List<EventFeedback> getFeedbackByRating(Integer rating) {
        return eventFeedbackRepository.findByRating(rating);
    }

    @Override
    public List<EventFeedback> getFeedbackByMinRating(Integer minRating) {
        return eventFeedbackRepository.findByRatingGreaterThanEqual(minRating);
    }

    @Override
    public Double getAverageRatingForEvent(Integer eventId) {
        return eventFeedbackRepository.getAverageRatingByEventId(eventId);
    }

    @Override
    public List<EventFeedback> searchFeedbackByComments(String keyword) {
        return eventFeedbackRepository.findByCommentsContaining(keyword);
    }

    @Override
    public EventFeedback saveFeedback(EventFeedback feedback) {
        return eventFeedbackRepository.save(feedback);
    }

    @Override
    public void deleteFeedback(Integer id) {
        eventFeedbackRepository.deleteById(id);
    }

    @Override
    public EventFeedback updateFeedback(Integer id, EventFeedback feedbackDetails) {
        Optional<EventFeedback> existingFeedback = eventFeedbackRepository.findById(id);
        if (existingFeedback.isPresent()) {
            EventFeedback feedback = existingFeedback.get();
            feedback.setRating(feedbackDetails.getRating());
            feedback.setComments(feedbackDetails.getComments());
            return eventFeedbackRepository.save(feedback);
        }
        throw new ResourceNotFoundException("Event feedback not found with id: " + id);
    }
}
