DO $$
DECLARE
    v_head_user_id INTEGER;
    v_head_login_id INTEGER;
    v_committee_id INTEGER;
    v_cat_workshop INTEGER;
    v_cat_cultural INTEGER;
    v_cat_sports INTEGER;
    v_event1 INTEGER;
    v_event2 INTEGER;
    v_event3 INTEGER;
BEGIN
    SELECT u.user_id, u.login_id INTO v_head_user_id, v_head_login_id
    FROM users u
    ORDER BY u.user_id
    LIMIT 1;

    IF v_head_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found. Please register at least one account first.';
    END IF;

    INSERT INTO committee (committee_name, head_id, login_id, faculty_incharge_name, faculty_position, committee_info)
    SELECT 'Tech Fest Committee', v_head_user_id, v_head_login_id, 'Dr. Anita Sharma', 'Faculty Coordinator', 'Organizes technical and innovation events for students.'
    WHERE NOT EXISTS (
        SELECT 1 FROM committee WHERE committee_name = 'Tech Fest Committee'
    );

    SELECT committee_id INTO v_committee_id
    FROM committee
    WHERE committee_name = 'Tech Fest Committee'
    ORDER BY committee_id
    LIMIT 1;

    INSERT INTO event_category (category_name)
    VALUES ('Workshop') ON CONFLICT (category_name) DO NOTHING;
    INSERT INTO event_category (category_name)
    VALUES ('Cultural') ON CONFLICT (category_name) DO NOTHING;
    INSERT INTO event_category (category_name)
    VALUES ('Sports') ON CONFLICT (category_name) DO NOTHING;

    SELECT category_id INTO v_cat_workshop FROM event_category WHERE category_name = 'Workshop';
    SELECT category_id INTO v_cat_cultural FROM event_category WHERE category_name = 'Cultural';
    SELECT category_id INTO v_cat_sports FROM event_category WHERE category_name = 'Sports';

    INSERT INTO events (event_name, event_date, venue, category_id, committee_id, description, status, max_participants)
    SELECT 'Angular Bootcamp 2026', CURRENT_TIMESTAMP + INTERVAL '3 day', 'Seminar Hall A', v_cat_workshop, v_committee_id,
           'Hands-on Angular and Spring Boot integration workshop.', 'PLANNED', 120
    WHERE NOT EXISTS (SELECT 1 FROM events WHERE event_name = 'Angular Bootcamp 2026');

    INSERT INTO events (event_name, event_date, venue, category_id, committee_id, description, status, max_participants)
    SELECT 'Campus Cultural Night', CURRENT_TIMESTAMP + INTERVAL '7 day', 'Open Amphitheatre', v_cat_cultural, v_committee_id,
           'Music, dance, and club performances by students.', 'PLANNED', 300
    WHERE NOT EXISTS (SELECT 1 FROM events WHERE event_name = 'Campus Cultural Night');

    INSERT INTO events (event_name, event_date, venue, category_id, committee_id, description, status, max_participants)
    SELECT 'Inter-Department Cricket League', CURRENT_TIMESTAMP + INTERVAL '10 day', 'Main Ground', v_cat_sports, v_committee_id,
           'Friendly tournament across all departments.', 'PLANNED', 180
    WHERE NOT EXISTS (SELECT 1 FROM events WHERE event_name = 'Inter-Department Cricket League');

    SELECT event_id INTO v_event1 FROM events WHERE event_name = 'Angular Bootcamp 2026' LIMIT 1;
    SELECT event_id INTO v_event2 FROM events WHERE event_name = 'Campus Cultural Night' LIMIT 1;
    SELECT event_id INTO v_event3 FROM events WHERE event_name = 'Inter-Department Cricket League' LIMIT 1;

    INSERT INTO task (committee_id, assigned_to, created_by, title, description, status, priority, start_date, end_date)
    SELECT v_committee_id, v_head_user_id, v_head_user_id, 'Prepare Event Posters',
           'Design and print posters for all upcoming events.', 'IN_PROGRESS', 'HIGH',
           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '2 day'
    WHERE NOT EXISTS (SELECT 1 FROM task WHERE title = 'Prepare Event Posters');

    INSERT INTO task (committee_id, assigned_to, created_by, title, description, status, priority, start_date, end_date)
    SELECT v_committee_id, v_head_user_id, v_head_user_id, 'Confirm Venue Bookings',
           'Coordinate with admin office for all venue reservations.', 'PENDING', 'URGENT',
           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 day'
    WHERE NOT EXISTS (SELECT 1 FROM task WHERE title = 'Confirm Venue Bookings');

    INSERT INTO task (committee_id, assigned_to, created_by, title, description, status, priority, start_date, end_date)
    SELECT v_committee_id, v_head_user_id, v_head_user_id, 'Volunteer Orientation',
           'Conduct orientation session for event volunteers.', 'PENDING', 'MEDIUM',
           CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '4 day'
    WHERE NOT EXISTS (SELECT 1 FROM task WHERE title = 'Volunteer Orientation');

    INSERT INTO announcements (title, committee_id, created_by)
    SELECT 'Registration for Angular Bootcamp 2026 is now open. Secure your spot today!', v_committee_id, v_head_user_id
    WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title LIKE 'Registration for Angular Bootcamp 2026%');

    INSERT INTO announcements (title, committee_id, created_by)
    SELECT 'All coordinators must join the planning meeting tomorrow at 10:00 AM.', v_committee_id, v_head_user_id
    WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title LIKE 'All coordinators must join the planning meeting%');

    INSERT INTO announcements (title, committee_id, created_by)
    SELECT 'Volunteers are requested to complete task updates before Friday evening.', v_committee_id, v_head_user_id
    WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title LIKE 'Volunteers are requested to complete task updates%');

    INSERT INTO attendance (user_id, event_id, status, check_in_time, attendance_method, marked_by, remarks)
    SELECT v_head_user_id, v_event1, 'PRESENT', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'MANUAL', v_head_user_id, 'Arrived early for workshop setup.'
    WHERE v_event1 IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM attendance WHERE user_id = v_head_user_id AND event_id = v_event1);

    INSERT INTO attendance (user_id, event_id, status, check_in_time, attendance_method, marked_by, remarks)
    SELECT v_head_user_id, v_event2, 'LATE', CURRENT_TIMESTAMP - INTERVAL '30 min', 'MANUAL', v_head_user_id, 'Joined after opening briefing.'
    WHERE v_event2 IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM attendance WHERE user_id = v_head_user_id AND event_id = v_event2);

    INSERT INTO attendance (user_id, event_id, status, check_in_time, attendance_method, marked_by, remarks)
    SELECT v_head_user_id, v_event3, 'PRESENT', CURRENT_TIMESTAMP, 'QR', v_head_user_id, 'Checked in at gate.'
    WHERE v_event3 IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM attendance WHERE user_id = v_head_user_id AND event_id = v_event3);
END$$;
