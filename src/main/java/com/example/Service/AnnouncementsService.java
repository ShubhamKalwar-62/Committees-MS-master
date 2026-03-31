package com.example.Service;

import com.example.Entity.Announcements;
import com.example.Entity.Users;
import com.example.Entity.Committee;
import com.example.Repository.AnnouncementsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AnnouncementsService {
    
    @Autowired
    private AnnouncementsRepository announcementsRepository;
    
    public List<Announcements> getAllAnnouncements() {
        return announcementsRepository.findAll();
    }
    
    public Optional<Announcements> getAnnouncementById(Integer id) {
        return announcementsRepository.findById(id);
    }
    
    public List<Announcements> getAnnouncementsByCommittee(Committee committee) {
        return announcementsRepository.findByCommittee(committee);
    }
    
    public List<Announcements> getAnnouncementsByUser(Users user) {
        return announcementsRepository.findByUser(user);
    }
    
    public List<Announcements> getAnnouncementsByCommitteeId(Integer committeeId) {
        return announcementsRepository.findByCommitteeIdOrderByCreatedAtDesc(committeeId);
    }
    
    public List<Announcements> searchAnnouncementsByMessage(String message) {
        return announcementsRepository.findByMessageContaining(message);
    }
    
    public List<Announcements> getAnnouncementsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return announcementsRepository.findByCreatedAtBetween(startDate, endDate);
    }
    
    public Announcements saveAnnouncement(Announcements announcement) {
        return announcementsRepository.save(announcement);
    }
    
    public void deleteAnnouncement(Integer id) {
        announcementsRepository.deleteById(id);
    }
    
    public Announcements updateAnnouncement(Integer id, Announcements announcementDetails) {
        Optional<Announcements> existingAnnouncement = announcementsRepository.findById(id);
        if (existingAnnouncement.isPresent()) {
            Announcements announcement = existingAnnouncement.get();
            announcement.setMessage(announcementDetails.getMessage());
            return announcementsRepository.save(announcement);
        }
        return null;
    }
}