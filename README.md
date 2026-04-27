# Committees Management System

Full-stack Committee and Event Management platform with:
- Spring Boot backend (Java 25, PostgreSQL, JWT auth, Swagger)
- Angular frontend (Angular 19, modular architecture, lazy-loaded features)

## Current Status

This repository now contains:
1. ERD-aligned backend entities, repositories, services, and controllers.
2. JWT authentication and role-based route protection.
3. Global exception handling and PATCH support across key resources.
4. Angular frontend with feature modules for Auth, Dashboard, Users, Committees, Events, Tasks, Announcements, and Attendance.
5. Migration scripts for registration approvals, QR attendance sessions, interactive announcements, and users identity sync.

## Tech Stack

### Backend
- Java 25
- Spring Boot 3.5.3
- Spring Security + JWT
- Spring Data JPA + Hibernate
- PostgreSQL
- Springdoc OpenAPI
- Maven Wrapper

### Frontend
- Angular 19 (modular, no standalone)
- RxJS
- Tailwind CSS
- Reactive Forms

## Backend Setup

1. Create database:
```sql
CREATE DATABASE committees_db;
```

2. Run schema:
```bash
psql -U postgres -h localhost -d committees_db -f database_schema.sql
```

3. If you are upgrading an existing database, apply migrations in this order:
```bash
psql -U postgres -h localhost -d committees_db -f migrate_event_participants_to_event_registrations.sql
psql -U postgres -h localhost -d committees_db -f migrate_registration_approval_and_qr_session.sql
psql -U postgres -h localhost -d committees_db -f migrate_announcements_interactive_fields.sql
psql -U postgres -h localhost -d committees_db -f migrate_users_email_role_fields.sql
```

4. Update credentials in src/main/resources/application.properties.

5. Start backend:
```bash
./mvnw.cmd spring-boot:run
```

Backend URLs:
- API base: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI: http://localhost:8080/v3/api-docs

## Frontend Setup

1. Open frontend folder:
```bash
cd committee-management
```

2. Install dependencies:
```bash
npm install
```

3. Start frontend:
```bash
npx ng serve --port 4200
```

Frontend URL:
- App: http://localhost:4200

## Connectivity + SMTP Email (Professor Requirement)

This project now includes:
1. Frontend-backend connectivity via Angular services targeting `http://localhost:8080/api/**`.
2. Global backend CORS config for Angular origin (`http://localhost:4200`) in Spring Security.
3. SMTP email integration for successful registration.

### Enable SMTP Email Sending

Set environment variables before starting backend (PowerShell):

```powershell
$env:APP_MAIL_ENABLED="true"
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="yourgmail@gmail.com"
$env:MAIL_PASSWORD="your_16_char_app_password"
```

Then start backend:

```bash
./mvnw.cmd spring-boot:run
```

### Test SMTP Quickly

Use test endpoint:

```http
POST /api/auth/test-email
```

Sample body:

```json
{
  "email": "student@example.com",
  "name": "Demo User"
}
```

Mail tools UI is also available for ADMIN users at:
- `/admin/mail-tools`

## Authentication API

### Register
POST /api/auth/register
```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "Demo@123",
  "role": "STUDENT"
}
```

### Login
POST /api/auth/login
```json
{
  "email": "demo@example.com",
  "password": "Demo@123"
}
```

Login returns JWT token and role. Frontend stores token in localStorage and sends Bearer token via interceptor.

## Main Backend Resources

- /api/auth
- /api/users
- /api/roles
- /api/committees
- /api/event-categories
- /api/events
- /api/registrations
- /api/event-participants
- /api/event-feedback
- /api/event-media
- /api/media/upload
- /api/tasks
- /api/announcements
- /api/attendance

## Data Model (Current)

Core tables/entities:
- roles
- login
- users
- committee
- event_category
- events
- announcements
- task
- event_registrations
- event_feedback
- event_media
- attendance

Note: Committee chat has been removed from the active model and backend implementation.

## Demo Preparation Checklist

1. Start PostgreSQL service.
2. Apply schema (database_schema.sql).
3. If using an existing DB, apply migrations in the documented order.
4. Start backend.
5. Start frontend.
6. Register/login once from frontend.
7. Show modules:
   - Dashboard
   - Events
   - Tasks
   - Attendance
   - Announcements

## Useful Commands

Backend compile:
```bash
./mvnw.cmd -q clean compile
```

Frontend build:
```bash
cd committee-management
npx ng build
```

## Final Demo Checklist

1. Login with all three roles (ADMIN, FACULTY, STUDENT).
2. Verify role-based routing:
  - ADMIN: /admin/dashboard
  - FACULTY: /faculty/dashboard
  - STUDENT: /student/dashboard
3. Run workflow once end-to-end:
  - Create committee
  - Create event
  - Create/assign task
  - Mark attendance
  - Post announcement
4. Open dashboard and confirm both charts are visible.
5. Verify API docs at /swagger-ui/index.html.
6. Run backend tests and frontend build before submission.

## Production Verification (Part 1 to Part 11)

Status: Completed in implementation and validated.

- Backend tests: 15/15 passing.
- Frontend tests: 64/64 passing.
- Frontend production build: successful.

### Final Result

- Student flow: Registers -> waits approval -> scans QR -> attendance recorded.
- Faculty flow: Approves -> starts QR session -> students scan -> attendance recorded.
- System behavior: Secure time-based QR, proxy attendance prevention, real-time attendance tracking, production-level modular design.

### Quick Smoke Test

1. Student login -> register for event -> confirm status shows Pending Approval.
2. Faculty/Admin login -> approve from pending registrations.
3. Faculty/Admin -> start QR session for approved event.
4. Student -> scan QR -> confirm success view includes user, event, and check-in time.
5. Student re-scan same session -> confirm duplicate blocked.
6. Scan expired token -> confirm rejection.
7. Verify live attendance count increases during active session.

## Repository Notes

- Backend and frontend are intentionally kept in one repository for easy academic demonstration.
- If Swagger shows an error, ensure backend is running and dependencies are installed from pom.xml.
- If register/login fails with relation errors, schema was not applied to committees_db.
