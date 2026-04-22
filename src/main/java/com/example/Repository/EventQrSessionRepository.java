package com.example.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Entity.EventQrSession;

@Repository
public interface EventQrSessionRepository extends JpaRepository<EventQrSession, Integer> {

    Optional<EventQrSession> findByQrToken(String qrToken);

    Optional<EventQrSession> findByQrTokenAndExpiresAtAfterAndEndedAtIsNull(String qrToken, LocalDateTime currentTime);

    List<EventQrSession> findByEventEventIdOrderByCreatedAtDesc(Integer eventId);
}
