-- Committees Management System Database Schema
-- PostgreSQL Database Creation Script

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS Event_Media CASCADE;
DROP TABLE IF EXISTS Event_Feedback CASCADE;
DROP TABLE IF EXISTS Event_participants CASCADE;
DROP TABLE IF EXISTS Events CASCADE;
DROP TABLE IF EXISTS Committee_Chat CASCADE;
DROP TABLE IF EXISTS Announcements CASCADE;
DROP TABLE IF EXISTS Task CASCADE;
DROP TABLE IF EXISTS Roles CASCADE;
DROP TABLE IF EXISTS Committee CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Login CASCADE;

-- 1. Login Table (Base table for authentication)
CREATE TABLE Login (
    Login_id SERIAL PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(100) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE Users (
    User_id SERIAL PRIMARY KEY,
    Login_id INTEGER NOT NULL,
    Name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Login_id) REFERENCES Login(Login_id) ON DELETE CASCADE
);

-- 3. Committee Table
CREATE TABLE Committee (
    Committee_id SERIAL PRIMARY KEY,
    Committee_name VARCHAR(255) NOT NULL,
    Login_id INTEGER NOT NULL,
    Faculty_incharge_name VARCHAR(255),
    Faculty_position VARCHAR(255),
    Committee_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Login_id) REFERENCES Login(Login_id) ON DELETE CASCADE
);

-- 4. Roles Table
CREATE TABLE Roles (
    Role_id SERIAL PRIMARY KEY,
    Role_name VARCHAR(100) NOT NULL,
    Committee_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Committee_id) REFERENCES Committee(Committee_id) ON DELETE CASCADE
);

-- 5. Announcements Table
CREATE TABLE Announcements (
    Announcement_id SERIAL PRIMARY KEY,
    Message TEXT NOT NULL,
    User_id INTEGER NOT NULL,
    Committee_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_id) REFERENCES Users(User_id) ON DELETE CASCADE,
    FOREIGN KEY (Committee_id) REFERENCES Committee(Committee_id) ON DELETE CASCADE
);

-- 6. Committee_Chat Table
CREATE TABLE Committee_Chat (
    Chat_id SERIAL PRIMARY KEY,
    Committee_id INTEGER NOT NULL,
    User_id INTEGER NOT NULL,
    Message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Committee_id) REFERENCES Committee(Committee_id) ON DELETE CASCADE,
    FOREIGN KEY (User_id) REFERENCES Users(User_id) ON DELETE CASCADE
);

-- 7. Events Table
CREATE TABLE Events (
    Event_id SERIAL PRIMARY KEY,
    Event_name VARCHAR(255) NOT NULL,
    Event_date DATE NOT NULL,
    Event_hrs VARCHAR(100),
    Venue VARCHAR(255),
    Reg_form_link TEXT,
    Committee_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Committee_id) REFERENCES Committee(Committee_id) ON DELETE CASCADE
);

-- 8. Event_participants Table (Junction table)
CREATE TABLE Event_participants (
    EP_id SERIAL PRIMARY KEY,
    User_id INTEGER NOT NULL,
    Event_id INTEGER NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_id) REFERENCES Users(User_id) ON DELETE CASCADE,
    FOREIGN KEY (Event_id) REFERENCES Events(Event_id) ON DELETE CASCADE,
    UNIQUE(User_id, Event_id) -- Prevent duplicate registrations
);

-- 9. Event_Feedback Table
CREATE TABLE Event_Feedback (
    Feedback_id SERIAL PRIMARY KEY,
    User_id INTEGER NOT NULL,
    Event_id INTEGER NOT NULL,
    Feedback_text TEXT,
    Rating INTEGER CHECK (Rating >= 1 AND Rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_id) REFERENCES Users(User_id) ON DELETE CASCADE,
    FOREIGN KEY (Event_id) REFERENCES Events(Event_id) ON DELETE CASCADE,
    UNIQUE(User_id, Event_id) -- One feedback per user per event
);

-- 10. Event_Media Table
CREATE TABLE Event_Media (
    Media_id SERIAL PRIMARY KEY,
    User_id INTEGER NOT NULL,
    Event_id INTEGER NOT NULL,
    Media_type VARCHAR(100) CHECK (Media_type IN ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO')),
    Media_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_id) REFERENCES Users(User_id) ON DELETE CASCADE,
    FOREIGN KEY (Event_id) REFERENCES Events(Event_id) ON DELETE CASCADE
);

-- 11. Task Table
CREATE TABLE Task (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(100) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    due_date DATE,
    committee_id INTEGER NOT NULL,
    assigned_to_user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (committee_id) REFERENCES Committee(Committee_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_user_id) REFERENCES Users(User_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_login_id ON Users(Login_id);
CREATE INDEX idx_committee_login_id ON Committee(Login_id);
CREATE INDEX idx_announcements_user_id ON Announcements(User_id);
CREATE INDEX idx_announcements_committee_id ON Announcements(Committee_id);
CREATE INDEX idx_committee_chat_committee_id ON Committee_Chat(Committee_id);
CREATE INDEX idx_committee_chat_user_id ON Committee_Chat(User_id);
CREATE INDEX idx_events_committee_id ON Events(Committee_id);
CREATE INDEX idx_event_participants_user_id ON Event_participants(User_id);
CREATE INDEX idx_event_participants_event_id ON Event_participants(Event_id);
CREATE INDEX idx_event_feedback_user_id ON Event_Feedback(User_id);
CREATE INDEX idx_event_feedback_event_id ON Event_Feedback(Event_id);
CREATE INDEX idx_event_media_event_id ON Event_Media(Event_id);
CREATE INDEX idx_task_committee_id ON Task(committee_id);
CREATE INDEX idx_task_assigned_user_id ON Task(assigned_to_user_id);

-- Create triggers to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_login_updated_at BEFORE UPDATE ON Login FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_committee_updated_at BEFORE UPDATE ON Committee FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON Announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON Events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_updated_at BEFORE UPDATE ON Task FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO Login (Email, Password, Role) VALUES 
('admin@university.edu', '$2a$10$DemoHashedPassword123', 'ADMIN'),
('john.doe@university.edu', '$2a$10$DemoHashedPassword456', 'FACULTY'),
('jane.smith@university.edu', '$2a$10$DemoHashedPassword789', 'STUDENT'),
('mike.wilson@university.edu', '$2a$10$DemoHashedPasswordABC', 'STUDENT');

INSERT INTO Users (Login_id, Name) VALUES 
(1, 'System Administrator'),
(2, 'Dr. John Doe'),
(3, 'Jane Smith'),
(4, 'Mike Wilson');

INSERT INTO Committee (Committee_name, Login_id, Faculty_incharge_name, Faculty_position, Committee_info) VALUES 
('Academic Excellence Committee', 2, 'Dr. John Doe', 'Professor', 'Committee focused on improving academic standards and student performance'),
('Cultural Committee', 2, 'Dr. John Doe', 'Professor', 'Organizing cultural events and activities for students'),
('Sports Committee', 2, 'Dr. John Doe', 'Professor', 'Managing sports activities and competitions');

INSERT INTO Events (Event_name, Event_date, Event_hrs, Venue, Committee_id) VALUES 
('Annual Tech Symposium', '2025-11-15', '9:00 AM - 5:00 PM', 'Main Auditorium', 1),
('Cultural Fest 2025', '2025-12-20', '6:00 PM - 11:00 PM', 'Campus Ground', 2),
('Inter-College Cricket Tournament', '2025-11-25', '8:00 AM - 6:00 PM', 'Sports Complex', 3);

INSERT INTO Task (title, status, due_date, committee_id, assigned_to_user_id) VALUES 
('Prepare symposium agenda', 'IN_PROGRESS', '2025-11-10', 1, 3),
('Book venue for cultural fest', 'PENDING', '2025-11-30', 2, 4),
('Arrange cricket equipment', 'COMPLETED', '2025-11-20', 3, 3);

-- Display table information
SELECT 'Database schema created successfully!' as status;

-- Show all tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;