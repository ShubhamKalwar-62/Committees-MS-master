-- Enforce exactly one ADMIN account at DB level for existing databases.
-- This script keeps the oldest ADMIN (smallest login_id) and demotes the rest to FACULTY.

BEGIN;

WITH ranked_admins AS (
    SELECT login_id,
           ROW_NUMBER() OVER (ORDER BY login_id ASC) AS rn
    FROM login
    WHERE lower(trim(role)) = 'admin'
), faculty_role AS (
    SELECT role_id
    FROM roles
    WHERE upper(role_name) = 'FACULTY'
    ORDER BY role_id
    LIMIT 1
)
UPDATE login l
SET role = 'FACULTY',
    role_id = COALESCE((SELECT role_id FROM faculty_role), l.role_id)
WHERE l.login_id IN (
    SELECT login_id
    FROM ranked_admins
    WHERE rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_login_single_admin_role
ON login ((lower(trim(role))))
WHERE lower(trim(role)) = 'admin';

COMMIT;

-- Verify result quickly:
-- SELECT login_id, email, role FROM login WHERE lower(trim(role)) = 'admin' ORDER BY login_id;