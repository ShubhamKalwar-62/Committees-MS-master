package com.example.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.Entity.Announcements;
import com.example.Entity.Committee;
import com.example.Entity.Users;

public interface AnnouncementsService {
    List<Announcements> getAllAnnouncements();
    Optional<Announcements> getAnnouncementById(Integer id);
    List<Announcements> getAnnouncementsByCommittee(Committee committee);
    List<Announcements> getAnnouncementsByUser(Users user);
    List<Announcements> getAnnouncementsByCommitteeId(Integer committeeId);
    List<Announcements> searchAnnouncementsByMessage(String message);
    List<Announcements> getAnnouncementsBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
    Announcements saveAnnouncement(Announcements announcement);
    Announcements markAnnouncementAsRead(Integer id);
    void deleteAnnouncement(Integer id);
    Announcements updateAnnouncement(Integer id, Announcements announcementDetails);
}