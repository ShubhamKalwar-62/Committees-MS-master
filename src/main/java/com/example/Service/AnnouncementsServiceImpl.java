package com.example.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.Announcements;
import com.example.Entity.Committee;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.AnnouncementsRepository;

@Service
public class AnnouncementsServiceImpl implements AnnouncementsService {

    private static final Set<String> SUPPORTED_ANNOUNCEMENT_TYPES = Set.of("event", "task", "general");

    @Autowired
    private AnnouncementsRepository announcementsRepository;

    @Override
    public List<Announcements> getAllAnnouncements() {
        return announcementsRepository.findAll();
    }

    @Override
    public Optional<Announcements> getAnnouncementById(Integer id) {
        return announcementsRepository.findById(Objects.requireNonNull(id, "id must not be null"));
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
        return announcementsRepository.findByCommitteeIdOrderByCreatedAtDesc(Objects.requireNonNull(committeeId, "committeeId must not be null"));
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
        Announcements nonNullAnnouncement = Objects.requireNonNull(announcement, "announcement must not be null");
        normalizeAndValidateAnnouncement(nonNullAnnouncement);
        return announcementsRepository.save(nonNullAnnouncement);
    }

    @Override
    public Announcements markAnnouncementAsRead(Integer id) {
        Announcements announcement = announcementsRepository.findById(Objects.requireNonNull(id, "id must not be null"))
            .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id: " + id));

        if (!Boolean.TRUE.equals(announcement.getRead())) {
            announcement.setRead(true);
        }

        return announcementsRepository.save(announcement);
    }

    @Override
    public void deleteAnnouncement(Integer id) {
        announcementsRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public Announcements updateAnnouncement(Integer id, Announcements announcementDetails) {
        Optional<Announcements> existingAnnouncement = announcementsRepository.findById(Objects.requireNonNull(id, "id must not be null"));
        if (existingAnnouncement.isPresent()) {
            Announcements announcement = existingAnnouncement.get();
            announcement.setMessage(announcementDetails.getMessage());
            if (announcementDetails.getCommittee() != null) {
                announcement.setCommittee(announcementDetails.getCommittee());
            }
            if (announcementDetails.getUser() != null) {
                announcement.setUser(announcementDetails.getUser());
            }
            announcement.setType(announcementDetails.getType());
            announcement.setReferenceId(announcementDetails.getReferenceId());
            announcement.setRead(announcementDetails.getRead());
            announcement.setImportant(announcementDetails.getImportant());

            normalizeAndValidateAnnouncement(announcement);
            return announcementsRepository.save(announcement);
        }
        throw new ResourceNotFoundException("Announcement not found with id: " + id);
    }

    private void normalizeAndValidateAnnouncement(Announcements announcement) {
        String normalizedMessage = Optional.ofNullable(announcement.getMessage())
            .map(String::trim)
            .orElse("");
        if (normalizedMessage.isEmpty()) {
            throw new IllegalArgumentException("message is required");
        }

        announcement.setMessage(normalizedMessage);

        String normalizedType = Optional.ofNullable(announcement.getType())
            .map(String::trim)
            .map(String::toLowerCase)
            .orElse("general");

        if (!SUPPORTED_ANNOUNCEMENT_TYPES.contains(normalizedType)) {
            throw new IllegalArgumentException("announcement type must be one of: event, task, general");
        }

        announcement.setType(normalizedType);
        if ("general".equals(normalizedType)) {
            announcement.setReferenceId(null);
        } else {
            Integer referenceId = announcement.getReferenceId();
            if (referenceId == null || referenceId <= 0) {
                throw new IllegalArgumentException("referenceId is required for event/task announcements");
            }
        }

        if (announcement.getRead() == null) {
            announcement.setRead(false);
        }
        if (announcement.getImportant() == null) {
            announcement.setImportant(false);
        }
    }
}
