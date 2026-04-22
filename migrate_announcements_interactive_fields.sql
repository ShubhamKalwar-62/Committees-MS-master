BEGIN;

ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS announcement_type VARCHAR(20) DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS reference_id INTEGER,
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE;

UPDATE announcements
SET announcement_type = 'general'
WHERE announcement_type IS NULL
   OR announcement_type NOT IN ('event', 'task', 'general');

ALTER TABLE announcements
    ALTER COLUMN announcement_type SET NOT NULL,
    ALTER COLUMN is_read SET NOT NULL,
    ALTER COLUMN is_important SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ck_announcements_type'
    ) THEN
        ALTER TABLE announcements
            ADD CONSTRAINT ck_announcements_type
                CHECK (announcement_type IN ('event', 'task', 'general'));
    END IF;
END $$;

COMMIT;
