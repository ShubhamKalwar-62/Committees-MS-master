-- Migration: rename event_participants table to event_registrations
-- Safe to run multiple times.

DO $$
BEGIN
    IF to_regclass('public.event_participants') IS NOT NULL
       AND to_regclass('public.event_registrations') IS NULL THEN
        ALTER TABLE public.event_participants RENAME TO event_registrations;
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('public.event_registrations') IS NULL THEN
        RAISE NOTICE 'event_registrations table does not exist. Skipping rename of constraints/triggers.';
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_event_participants_user'
          AND conrelid = 'public.event_registrations'::regclass
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_event_registrations_user'
          AND conrelid = 'public.event_registrations'::regclass
    ) THEN
        ALTER TABLE public.event_registrations RENAME CONSTRAINT fk_event_participants_user TO fk_event_registrations_user;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_event_participants_event'
          AND conrelid = 'public.event_registrations'::regclass
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_event_registrations_event'
          AND conrelid = 'public.event_registrations'::regclass
    ) THEN
        ALTER TABLE public.event_registrations RENAME CONSTRAINT fk_event_participants_event TO fk_event_registrations_event;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_event_participants'
          AND conrelid = 'public.event_registrations'::regclass
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_event_registrations'
          AND conrelid = 'public.event_registrations'::regclass
    ) THEN
        ALTER TABLE public.event_registrations RENAME CONSTRAINT uq_event_participants TO uq_event_registrations;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ck_event_participants_status'
          AND conrelid = 'public.event_registrations'::regclass
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ck_event_registrations_status'
          AND conrelid = 'public.event_registrations'::regclass
    ) THEN
        ALTER TABLE public.event_registrations RENAME CONSTRAINT ck_event_participants_status TO ck_event_registrations_status;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'event_participants_pkey'
          AND conrelid = 'public.event_registrations'::regclass
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'event_registrations_pkey'
          AND conrelid = 'public.event_registrations'::regclass
    ) THEN
        ALTER TABLE public.event_registrations RENAME CONSTRAINT event_participants_pkey TO event_registrations_pkey;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'event_participants_ep_id_not_null'
          AND conrelid = 'public.event_registrations'::regclass
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'event_registrations_ep_id_not_null'
          AND conrelid = 'public.event_registrations'::regclass
    ) THEN
        ALTER TABLE public.event_registrations RENAME CONSTRAINT event_participants_ep_id_not_null TO event_registrations_ep_id_not_null;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'event_participants_user_id_not_null'
          AND conrelid = 'public.event_registrations'::regclass
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'event_registrations_user_id_not_null'
          AND conrelid = 'public.event_registrations'::regclass
    ) THEN
        ALTER TABLE public.event_registrations RENAME CONSTRAINT event_participants_user_id_not_null TO event_registrations_user_id_not_null;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'event_participants_event_id_not_null'
          AND conrelid = 'public.event_registrations'::regclass
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'event_registrations_event_id_not_null'
          AND conrelid = 'public.event_registrations'::regclass
    ) THEN
        ALTER TABLE public.event_registrations RENAME CONSTRAINT event_participants_event_id_not_null TO event_registrations_event_id_not_null;
    END IF;
END $$;

ALTER INDEX IF EXISTS public.event_participants_pkey RENAME TO event_registrations_pkey;
ALTER INDEX IF EXISTS public.idx_event_participants_event_id RENAME TO idx_event_registrations_event_id;
ALTER INDEX IF EXISTS public.idx_event_participants_user_id RENAME TO idx_event_registrations_user_id;

DO $$
BEGIN
    IF to_regclass('public.event_registrations') IS NOT NULL
       AND EXISTS (
            SELECT 1
            FROM pg_trigger t
            JOIN pg_class c ON c.oid = t.tgrelid
            WHERE t.tgname = 'update_event_participants_updated_at'
              AND c.relname = 'event_registrations'
       ) THEN
        ALTER TRIGGER update_event_participants_updated_at ON public.event_registrations
        RENAME TO update_event_registrations_updated_at;
    END IF;
END $$;

SELECT 'Event registrations migration applied successfully' AS status;
