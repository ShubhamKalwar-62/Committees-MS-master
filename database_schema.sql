-- Committees Management System Database Schema (ERD aligned)
-- PostgreSQL Database Creation Script

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS event_media CASCADE;
DROP TABLE IF EXISTS event_feedback CASCADE;
DROP TABLE IF EXISTS event_participants CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_category CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS committee CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS login CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1) Roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    -- Legacy link retained for compatibility with existing Role APIs
    committee_id INTEGER NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Login
CREATE TABLE login (
    login_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NULL,
    -- Legacy role text retained for JWT/auth compatibility
    role VARCHAR(100) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_login_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL
);

-- 3) Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    login_id INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_login FOREIGN KEY (login_id) REFERENCES login(login_id) ON DELETE CASCADE
);

-- 4) Committee
CREATE TABLE committee (
    committee_id SERIAL PRIMARY KEY,
    committee_name VARCHAR(255) NOT NULL,
    head_id INTEGER NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Legacy columns retained for existing service/repository methods
    login_id INTEGER NULL,
    faculty_incharge_name VARCHAR(255),
    faculty_position VARCHAR(255),
    committee_info TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_committee_head FOREIGN KEY (head_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_committee_login FOREIGN KEY (login_id) REFERENCES login(login_id) ON DELETE SET NULL
);

ALTER TABLE roles
    ADD CONSTRAINT fk_roles_committee FOREIGN KEY (committee_id) REFERENCES committee(committee_id) ON DELETE SET NULL;

-- 5) Event Category
CREATE TABLE event_category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6) Events
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date TIMESTAMP,
    venue VARCHAR(255),
    category_id INTEGER,
    committee_id INTEGER NOT NULL,

    -- Legacy columns retained for existing event APIs
    description TEXT,
    status VARCHAR(20) DEFAULT 'PLANNED',
    max_participants INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES event_category(category_id) ON DELETE SET NULL,
    CONSTRAINT fk_events_committee FOREIGN KEY (committee_id) REFERENCES committee(committee_id) ON DELETE CASCADE,
    CONSTRAINT ck_events_status CHECK (status IN ('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'))
);

-- 7) Announcements
CREATE TABLE announcements (
    announcement_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    committee_id INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_announcements_committee FOREIGN KEY (committee_id) REFERENCES committee(committee_id) ON DELETE CASCADE,
    CONSTRAINT fk_announcements_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 8) Task
CREATE TABLE task (
    task_id SERIAL PRIMARY KEY,
    committee_id INTEGER NOT NULL,
    assigned_to INTEGER,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',

    -- Legacy columns retained for existing task APIs
    created_by INTEGER,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_task_committee FOREIGN KEY (committee_id) REFERENCES committee(committee_id) ON DELETE CASCADE,
    CONSTRAINT fk_task_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_task_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT ck_task_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT ck_task_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'))
);

-- 9) Event Participants
CREATE TABLE event_participants (
    ep_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,

    -- Legacy columns retained for existing participant APIs
    status VARCHAR(20) DEFAULT 'REGISTERED',
    attended BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_participants_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_event_participants_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT uq_event_participants UNIQUE (user_id, event_id),
    CONSTRAINT ck_event_participants_status CHECK (status IN ('REGISTERED', 'CONFIRMED', 'CANCELLED', 'ATTENDED'))
);

-- 10) Event Feedback
CREATE TABLE event_feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,

    -- Legacy timestamp retained for ordering query
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_event_feedback_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT uq_event_feedback UNIQUE (user_id, event_id)
);

-- 11) Event Media
CREATE TABLE event_media (
    media_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    media_url TEXT NOT NULL,

    -- Legacy file metadata retained for existing media APIs
    file_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_event_media_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT ck_event_media_type CHECK (media_type IN ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'))
);

-- 12) Attendance
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    attendance_method VARCHAR(20),
    marked_by INTEGER,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_marked_by FOREIGN KEY (marked_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT ck_attendance_status CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    CONSTRAINT ck_attendance_method CHECK (attendance_method IN ('QR', 'MANUAL'))
);

-- Indexes
CREATE INDEX idx_login_role_id ON login(role_id);
CREATE UNIQUE INDEX uq_login_single_admin_role ON login ((lower(trim(role))))
WHERE lower(trim(role)) = 'admin';
CREATE INDEX idx_users_login_id ON users(login_id);
CREATE INDEX idx_committee_head_id ON committee(head_id);
CREATE INDEX idx_committee_login_id ON committee(login_id);
CREATE INDEX idx_events_committee_id ON events(committee_id);
CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_announcements_committee_id ON announcements(committee_id);
CREATE INDEX idx_announcements_created_by ON announcements(created_by);
CREATE INDEX idx_task_committee_id ON task(committee_id);
CREATE INDEX idx_task_assigned_to ON task(assigned_to);
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX idx_event_feedback_event_id ON event_feedback(event_id);
CREATE INDEX idx_event_media_event_id ON event_media(event_id);
CREATE INDEX idx_attendance_event_id ON attendance(event_id);
CREATE INDEX idx_attendance_user_id ON attendance(user_id);

-- Trigger for updated_at maintenance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_login_updated_at BEFORE UPDATE ON login FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_committee_updated_at BEFORE UPDATE ON committee FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_updated_at BEFORE UPDATE ON task FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_category_updated_at BEFORE UPDATE ON event_category FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_participants_updated_at BEFORE UPDATE ON event_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_feedback_updated_at BEFORE UPDATE ON event_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_media_updated_at BEFORE UPDATE ON event_media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed roles
INSERT INTO roles (role_name) VALUES ('ADMIN'), ('FACULTY'), ('STUDENT');

SELECT 'Database schema created successfully!' AS status;
