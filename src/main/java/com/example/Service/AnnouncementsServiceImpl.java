package com.example.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.Announcements;
import com.example.Entity.Committee;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.AnnouncementsRepository;

@Service
public class AnnouncementsServiceImpl implements AnnouncementsService {

    @Autowired
    private AnnouncementsRepository announcementsRepository;

    @Override
    public List<Announcements> getAllAnnouncements() {
        return announcementsRepository.findAll();
    }

    @Override
    public Optional<Announcements> getAnnouncementById(Integer id) {
        return announcementsRepository.findById(id);
    }

    @Override
    public List<Announcements> getAnnouncementsByCommittee(Committee committee) {
        return announcementsRepository.findByCommittee(committee);
    }

    @Override
    public List<Announcements> getAnnouncementsByUser(Users user) {
        return announcementsRepository.findByUser(user);
    }

    @Override
    public List<Announcements> getAnnouncementsByCommitteeId(Integer committeeId) {
        return announcementsRepository.findByCommitteeIdOrderByCreatedAtDesc(committeeId);
    }

    @Override
    public List<Announcements> searchAnnouncementsByMessage(String message) {
        return announcementsRepository.findByMessageContaining(message);
    }

    @Override
    public List<Announcements> getAnnouncementsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return announcementsRepository.findByCreatedAtBetween(startDate, endDate);
    }

    @Override
    public Announcements saveAnnouncement(Announcements announcement) {
        return announcementsRepository.save(announcement);
    }

    @Override
    public void deleteAnnouncement(Integer id) {
        announcementsRepository.deleteById(id);
    }

    @Override
    public Announcements updateAnnouncement(Integer id, Announcements announcementDetails) {
        Optional<Announcements> existingAnnouncement = announcementsRepository.findById(id);
        if (existingAnnouncement.isPresent()) {
            Announcements announcement = existingAnnouncement.get();
            announcement.setMessage(announcementDetails.getMessage());
            return announcementsRepository.save(announcement);
        }
        throw new ResourceNotFoundException("Announcement not found with id: " + id);
    }
}
