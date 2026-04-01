package com.example.Service;

import java.util.List;
import java.util.Optional;

import com.example.Entity.EventFeedback;
import com.example.Entity.Events;
import com.example.Entity.Users;

public interface EventFeedbackService {
    List<EventFeedback> getAllFeedback();
    Optional<EventFeedback> getFeedbackById(Integer id);
    List<EventFeedback> getFeedbackByEvent(Events event);
    List<EventFeedback> getFeedbackByUser(Users user);
    Optional<EventFeedback> getFeedbackByEventAndUser(Events event, Users user);
    List<EventFeedback> getFeedbackByEventId(Integer eventId);
    List<EventFeedback> getFeedbackByRating(Integer rating);
    List<EventFeedback> getFeedbackByMinRating(Integer minRating);
    Double getAverageRatingForEvent(Integer eventId);
    List<EventFeedback> searchFeedbackByComments(String keyword);
    EventFeedback saveFeedback(EventFeedback feedback);
    void deleteFeedback(Integer id);
    EventFeedback updateFeedback(Integer id, EventFeedback feedbackDetails);
}