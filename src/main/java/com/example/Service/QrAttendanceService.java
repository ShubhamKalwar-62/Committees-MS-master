package com.example.Service;

import com.example.Entity.Attendance;
import com.example.Entity.EventQrSession;

public interface QrAttendanceService {

    EventQrSession startSession(Integer eventId, Integer durationMinutes);

    EventQrSession refreshSession(Integer sessionId, Integer durationSeconds);

    EventQrSession endSession(Integer sessionId);

    EventQrSession getSession(Integer sessionId);

    Attendance scanAttendance(String qrToken, Integer requestedUserId, String requesterEmail);

    long getLiveAttendanceCount(Integer eventId);
}
