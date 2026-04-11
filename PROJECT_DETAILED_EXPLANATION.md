# Committee & Event Management System - Detailed Project Explanation

## 1. Project Overview

This project is a full-stack Committee & Event Management System designed for college/institute operations.

It solves common management problems such as:
- Scattered committee coordination
- Manual event registration tracking
- Weak attendance visibility
- Poor task assignment and follow-up
- Unstructured announcements and communication

The system centralizes these functions with a secure backend and modular frontend.

## 2. Technology Stack

## Backend
- Java 25
- Spring Boot 3.5.3
- Spring Security (JWT + role-based authorization)
- Spring Data JPA / Hibernate
- PostgreSQL
- Springdoc OpenAPI (Swagger)
- Maven Wrapper

## Frontend
- Angular 19 (modular architecture, non-standalone)
- Reactive Forms
- HTTP Interceptor + Route Guard
- Bootstrap CSS

## 3. High-Level Architecture

Backend architecture follows layered design:
- Controller Layer: Exposes REST APIs
- Service Layer: Business logic (interface + implementation)
- Repository Layer: Database operations (JPA)
- Entity Layer: Relational mapping

Frontend architecture:
- Core Module: Header, Footer, Landing Page
- Shared Module: Reusable UI components
- Feature Modules (lazy-loaded): Auth, Dashboard, Users, Committees, Events, Tasks, Attendance, Announcements

## 4. Database Entities and Purpose

Below are the active entities in the current implementation.

### 4.1 Roles
Purpose:
- Stores role definitions and role metadata.

Key use:
- Used for authorization decisions and role mapping.

### 4.2 Login
Purpose:
- Stores authentication credentials.

Key fields:
- email
- password (encrypted in backend)
- role / role reference

Key use:
- Main identity source for login and JWT generation.

### 4.3 Users
Purpose:
- Stores user profile/business identity.

Key fields:
- name
- login reference

Key use:
- Represents people participating in committees/events/tasks.

### 4.4 Committee
Purpose:
- Represents organizational committees.

Key fields:
- committee_name
- head_id
- faculty details
- committee_info

Key use:
- Parent context for events, tasks, and announcements.

### 4.5 EventCategory
Purpose:
- Classifies event type.

Examples:
- Workshop
- Cultural
- Sports

### 4.6 Events
Purpose:
- Stores event planning and execution data.

Key fields:
- event_name
- event_date
- venue
- committee_id
- category_id
- status
- max_participants

### 4.7 Announcements
Purpose:
- Stores notices posted for committees.

Key fields:
- title/message
- committee_id
- created_by

### 4.8 Task
Purpose:
- Tracks work allocation and progress.

Key fields:
- title
- status
- priority
- assigned_to
- created_by
- start_date / end_date
- committee_id

### 4.9 EventParticipants
Purpose:
- Join table for user registration into events.

Key fields:
- user_id
- event_id
- status
- attended

### 4.10 EventFeedback
Purpose:
- Collects post-event ratings and comments.

Key fields:
- user_id
- event_id
- rating
- comment

### 4.11 EventMedia
Purpose:
- Tracks media metadata for event files.

Key fields:
- event_id
- media_type
- media_url / file metadata

### 4.12 Attendance
Purpose:
- Captures attendance records per user per event.

Key fields:
- user_id
- event_id
- status (PRESENT/ABSENT/LATE)
- check_in_time
- check_out_time
- attendance_method
- remarks

## 5. Relationship Mapping (ERD Logic)

### Core relationships
- Login -> Users: One-to-One
- Committee -> Events: One-to-Many
- EventCategory -> Events: One-to-Many
- Committee -> Task: One-to-Many
- Committee -> Announcements: One-to-Many

### User-event relationships
- Users <-> Events: Many-to-Many via EventParticipants
- Users -> EventFeedback and Events -> EventFeedback: One-to-Many from each side
- Users -> Attendance and Events -> Attendance: One-to-Many from each side

### Event media
- Events -> EventMedia: One-to-Many

### Task ownership
- Users -> Task (assigned_to): One-to-Many
- Users -> Task (created_by): One-to-Many

### Announcement ownership
- Users -> Announcements (created_by): One-to-Many

## 6. Authentication and Security Flow

## Login flow
1. User sends email/password to /api/auth/login.
2. Backend validates credentials using Spring Security.
3. JWT token is generated with role claim.
4. Token + role returned to frontend.

## Frontend token handling
1. Token stored in localStorage.
2. JWT interceptor attaches Authorization: Bearer <token>.
3. Route guard protects private routes.

## Authorization
- Backend enforces role-based route constraints.
- Frontend also hides/shows menu options by role for better UX.

## 7. REST API Modules

Major base paths:
- /api/auth
- /api/users
- /api/roles
- /api/committees
- /api/event-categories
- /api/events
- /api/event-participants
- /api/event-feedback
- /api/event-media
- /api/media/upload
- /api/tasks
- /api/announcements
- /api/attendance

Common operations:
- GET list/detail
- POST create
- PUT update
- PATCH partial update
- DELETE remove

## 8. Frontend Module Responsibilities

### Auth Module
- Login form
- Register form
- Validation + API integration

### Dashboard Module
- Overview cards
- Snapshot section
- Role-aware sidebar navigation

### Users Module
- User listing/table view

### Committees Module
- Committee list
- Committee detail

### Events Module
- Event list
- Event detail
- Event create form
- Event registration action

### Tasks Module
- Task list/table
- Task create form

### Attendance Module
- Attendance list
- Attendance mark form

### Announcements Module
- Announcement list
- Announcement create form

## 9. Validation and Error Handling

Backend:
- Global exception handling via @RestControllerAdvice
- Consistent JSON error responses
- ResourceNotFoundException for missing records

Frontend:
- Reactive form validations
  - required
  - email
  - minLength
- Friendly error messages for register/login and schema issues

## 10. Demo Data and Presentation Readiness

For professor demonstration, demo data is seeded with:
- Committees
- Events
- Tasks
- Announcements
- Attendance

Script:
- seed_demo_v2.sql

This allows immediate showcase of dashboard and feature pages without manual data entry.

## 11. Typical User Journey

1. Register account (role: STUDENT/FACULTY/ADMIN)
2. Login and receive JWT
3. Open dashboard and navigate modules
4. View events and register for participation
5. Create/view tasks
6. Mark/view attendance
7. View/create announcements

## 12. Why This Project is Production-Oriented

- Layered backend architecture
- Secure JWT auth + RBAC
- Normalized relational schema with constraints
- API documentation via Swagger
- Modular Angular architecture with lazy loading
- Reusable components and guard/interceptor patterns
- Demo-ready seeded data and clear setup docs

## 13. Known Practical Notes

- If register/login fails with relation errors, schema was not applied to committees_db.
- If /v3/api-docs fails, verify springdoc dependency compatibility and backend startup.
- Frontend build warnings about size budget are non-blocking for demo.

## 14. Suggested Viva Explanation Sequence

1. Problem statement and need for centralization
2. Architecture (backend + frontend)
3. Entity and relationship explanation
4. Authentication + authorization flow
5. API module coverage
6. Live demo through dashboard -> events -> tasks -> attendance -> announcements
7. Show Swagger as technical validation

## 15. Conclusion

This project demonstrates full-stack engineering with secure API design, relational modeling, modular frontend implementation, and practical real-world workflow automation for academic committees and event management.
