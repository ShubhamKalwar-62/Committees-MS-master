BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS role VARCHAR(100);

UPDATE users u
SET email = l.email,
    role = COALESCE(l.role, 'USER')
FROM login l
WHERE u.login_id = l.login_id
  AND (
    u.email IS DISTINCT FROM l.email
    OR u.role IS DISTINCT FROM COALESCE(l.role, 'USER')
  );

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email
    ON users(email)
    WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

CREATE OR REPLACE FUNCTION sync_users_identity_from_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.login_id IS NOT NULL THEN
        SELECT l.email, COALESCE(l.role, 'USER')
        INTO NEW.email, NEW.role
        FROM login l
        WHERE l.login_id = NEW.login_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_users_identity_on_login_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET email = NEW.email,
        role = COALESCE(NEW.role, 'USER')
    WHERE login_id = NEW.login_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_users_identity_from_login'
          AND tgrelid = 'users'::regclass
    ) THEN
        CREATE TRIGGER update_users_identity_from_login
            BEFORE INSERT OR UPDATE OF login_id ON users
            FOR EACH ROW
            EXECUTE FUNCTION sync_users_identity_from_login();
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_login_identity_into_users'
          AND tgrelid = 'login'::regclass
    ) THEN
        CREATE TRIGGER update_login_identity_into_users
            AFTER UPDATE OF email, role ON login
            FOR EACH ROW
            EXECUTE FUNCTION sync_users_identity_on_login_update();
    END IF;
END;
$$;

COMMIT;
