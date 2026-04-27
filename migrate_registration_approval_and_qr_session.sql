BEGIN;

ALTER TABLE event_registrations
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Drop legacy/new status checks before remapping existing rows.
ALTER TABLE event_registrations
    DROP CONSTRAINT IF EXISTS ck_event_registrations_status,
    DROP CONSTRAINT IF EXISTS ck_event_participants_status;

UPDATE event_registrations
SET status = CASE UPPER(status)
    WHEN 'REGISTERED' THEN 'PENDING'
    WHEN 'CONFIRMED' THEN 'APPROVED'
    WHEN 'CANCELLED' THEN 'REJECTED'
    WHEN 'ATTENDED' THEN 'APPROVED'
    WHEN 'PENDING' THEN 'PENDING'
    WHEN 'APPROVED' THEN 'APPROVED'
    WHEN 'REJECTED' THEN 'REJECTED'
    ELSE 'PENDING'
END;

ALTER TABLE event_registrations
    ALTER COLUMN status SET DEFAULT 'PENDING',
    ALTER COLUMN status SET NOT NULL;

ALTER TABLE event_registrations
    ADD CONSTRAINT ck_event_registrations_status
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

CREATE INDEX IF NOT EXISTS idx_event_registrations_status
    ON event_registrations(status);

CREATE TABLE IF NOT EXISTS event_qr_session (
    qr_session_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    qr_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    CONSTRAINT fk_event_qr_session_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_qr_session_event_id
    ON event_qr_session(event_id);

CREATE INDEX IF NOT EXISTS idx_event_qr_session_expires_at
    ON event_qr_session(expires_at);

COMMIT;
