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
- /api/registrations
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

## 16. 5-Minute Viva Answer Sheet (Professor Ready)

Use this as your speaking flow and backup Q and A sheet.

### 16.1 5-Minute Script (What to Say)

1. 0:00 - 0:40 | Problem and Goal
- "Our institute activities were managed manually across spreadsheets, chats, and paper records."
- "So I built a Committee and Event Management System to centralize committees, events, tasks, announcements, and attendance in one secure platform."

2. 0:40 - 1:20 | Tech Stack (Short and Clear)
- "Frontend is Angular 19 with modular and lazy-loaded features, route guards, and JWT interceptor."
- "Backend is Spring Boot with Security, JWT, JPA, Hibernate, and PostgreSQL."
- "Swagger/OpenAPI is used for API verification and demonstration."

3. 1:20 - 2:10 | Architecture
- "The backend follows Controller -> Service -> Repository -> Database architecture."
- "Frontend follows Core + Shared + Feature Modules: Auth, Dashboard, Users, Committees, Events, Tasks, Attendance, Announcements."
- "This structure keeps business logic clean and supports future scaling."

4. 2:10 - 3:00 | Security Flow
- "User logs in using email/password at /api/auth/login."
- "Backend validates using Spring Security and returns JWT with role."
- "Frontend stores token, interceptor attaches Bearer token to requests, guards protect routes by role."
- "Backend also enforces role permissions on API endpoints, so security exists on both sides."

5. 3:00 - 4:05 | Entity and Workflow Flow
- "Core entities are Login, Users, Roles, Committee, Events, Task, Announcements, Attendance, EventParticipants, EventFeedback, EventMedia, EventCategory."
- "Typical flow: Admin/Faculty creates committee and events -> tasks assigned -> students register in events -> attendance recorded -> announcements published -> feedback/media stored."

6. 4:05 - 5:00 | Demo + Value
- "I can show role-based dashboards: Admin, Faculty, Student."
- "Then I run one full cycle: create event, assign task, register participant, mark attendance, publish announcement."
- "Final value: better transparency, accountability, and faster committee operations."

### 16.2 High-Probability Viva Questions with Model Answers

1. Why did you choose Angular + Spring Boot?
- Angular gives strong module structure and route guarding.
- Spring Boot provides robust security, JPA, and fast REST development.
- Together they are industry-standard for full-stack enterprise apps.

2. Why JWT authentication?
- JWT enables stateless authentication, so backend scales better than session-based auth.
- Token carries role info, enabling quick authorization checks.

3. Why both frontend guard and backend authorization?
- Frontend guards improve UX by hiding blocked pages.
- Backend authorization is the actual security barrier and cannot be bypassed by client manipulation.

4. How are roles enforced?
- RoleGuard in Angular checks route data roles.
- Spring Security request matchers enforce role-based API access.

5. Why did you use layered architecture?
- Separation of concerns: controllers handle HTTP, services handle logic, repositories handle DB.
- Easier to test, maintain, and extend.

6. What is the purpose of EventParticipants table?
- It handles many-to-many mapping between Users and Events.
- It also stores registration state and attended flag.

7. How do you handle partial updates?
- PATCH endpoints are implemented for key entities.
- Server ignores immutable fields like IDs and created timestamps.

8. How do you handle errors uniformly?
- Global exception handler returns standardized response format.
- API responses use a common response object with success/message/data/error/timestamp.

9. How is password security handled?
- Passwords are encoded using BCrypt before storing in DB.
- Plain text password storage is avoided in normal auth flow.

10. How do you prevent duplicate admin creation?
- Backend checks existing ADMIN before registration.
- DB also has a unique index constraint for single admin role text.

11. Why PostgreSQL instead of a NoSQL DB?
- The system has strongly related structured data and constraints.
- Relational integrity is critical for attendance, tasks, participation, and roles.

12. How do you test security correctness?
- There is a test verifying admin can access protected login APIs while faculty gets forbidden.
- This confirms role-based access behavior.

13. Why Swagger is important in your project?
- It provides machine-readable API docs.
- Helps in testing, debugging, and live viva demonstration.

14. What are current limitations?
- Dashboard metrics are mostly static demo values currently.
- Test coverage is minimal and can be expanded.
- Some local config values should be moved fully to environment variables.

15. What are your next improvements?
- Add analytics endpoints and bind dashboard to live DB metrics.
- Add unit/integration test coverage for services/controllers.
- Add audit logs, pagination, search optimization, and CI pipeline.

### 16.3 2-Minute Safe Demo Order (If Time Is Short)

1. Login as FACULTY and open dashboard.
2. Show Events list and create one event.
3. Show Tasks and create one task.
4. Show Attendance module and mark one record.
5. Show Announcements and create one announcement.
6. Switch to STUDENT and show event registration flow.

### 16.4 One-Line Closing for Professor

"This project is a secure, role-based, full-stack workflow system that converts manual committee operations into a traceable digital process with clear ownership, participation, and reporting."

## 17. One-Page Rapid Revision Sheet

Use this page for last-minute revision before viva.

### 17.1 30-Second Project Pitch

"Committee and Event Management System is a full-stack platform that digitizes committee workflows. It combines secure role-based access, event and task lifecycle management, attendance tracking, and announcement communication into one centralized system for ADMIN, FACULTY, and STUDENT users."

### 17.2 60-Second Architecture Snapshot

Backend:
- Spring Boot REST APIs
- Security with JWT and role-based access
- JPA/Hibernate repositories on PostgreSQL
- Standard response wrapper and global exception handling

Frontend:
- Angular modular architecture with lazy loading
- Route guards for auth and role access
- JWT interceptor for Bearer token
- Feature modules: Auth, Dashboard, Users, Committees, Events, Tasks, Attendance, Announcements

Data layer:
- Normalized relational schema
- 12 active entities
- Constraints for status values, uniqueness, and referential integrity

### 17.3 Must-Remember Technical Points

1. JWT token is generated on login and stored in localStorage.
2. Interceptor adds Authorization Bearer token to API calls.
3. Frontend guard controls navigation, backend security controls real access.
4. Backend API follows Controller -> Service -> Repository pattern.
5. Role-based access uses ADMIN, FACULTY, STUDENT.
6. ADMIN access is restricted for role and login management APIs.
7. EventParticipants solves Users <-> Events many-to-many mapping.
8. Attendance records include status, check-in/check-out, and method.
9. PATCH endpoints support partial updates across major entities.
10. ResponceBean standardizes success, message, data, error, timestamp.
11. Global exception handler centralizes error responses.
12. Passwords are encoded using BCrypt.
13. Optional SMTP integration supports registration and reset emails.
14. Swagger is used for API documentation and quick verification.
15. Seed SQL script enables demo-ready data quickly.

### 17.4 Core Entity Memory Trick

Auth and identity:
- Roles, Login, Users

Organization:
- Committee

Event lifecycle:
- EventCategory, Events, EventParticipants, EventFeedback, EventMedia

Operations and communication:
- Task, Attendance, Announcements

### 17.5 90-Second Demo Flow

1. Login as FACULTY.
2. Open dashboard and explain role-aware navigation.
3. Create one event.
4. Create one task linked to committee.
5. Mark attendance for an event.
6. Publish one announcement.
7. Switch to STUDENT and register for event.

### 17.6 Safe Lines to Say if Nervous

1. "Frontend enforces UX-level role navigation, backend enforces security-level authorization."
2. "This is a relational domain, so PostgreSQL plus JPA is the right fit for integrity and reporting."
3. "I prioritized secure flow first, then modularity, then presentation-ready demo data."
4. "The current dashboard uses demo metrics and can be wired to live analytics endpoints as next step."

## 18. Mock Viva Practice Set (Tough + Follow-Up)

Practice this as question-answer drills.

### 18.1 Security and Authentication

Q1. Why is frontend guard alone not sufficient for security?
- Model answer: Frontend guard can be bypassed by direct API calls. Real security must be enforced at backend endpoint level using Spring Security role checks.
- Follow-up: Then why keep frontend guards?
- Defense: For user experience, clean navigation, and role-specific menu control.

Q2. Why did you choose JWT instead of session authentication?
- Model answer: JWT enables stateless APIs, easier scaling, and token-based role propagation across requests.
- Follow-up: What is one JWT risk?
- Defense: Token leakage risk; mitigated by short expiration, secure storage strategy, and HTTPS in deployment.

Q3. How do you prove role authorization works?
- Model answer: Security config has method/path role matchers, and test coverage verifies that FACULTY cannot access admin-only login list while ADMIN can.
- Follow-up: Is one test enough?
- Defense: No, current test is baseline. Next step is role matrix integration testing for all sensitive endpoints.

Q4. How is password security handled?
- Model answer: Passwords are encoded using BCrypt before persistence and never returned in normal API output.
- Follow-up: Any weak spot left?
- Defense: Must ensure all legacy paths avoid plaintext checks and enforce encoded comparisons only.

### 18.2 Architecture and Design

Q5. Why layered architecture?
- Model answer: It separates transport logic, business logic, and persistence logic, improving maintainability and testability.
- Follow-up: What happens if service layer is removed?
- Defense: Controller becomes bloated and hard to test; business rules get duplicated.

Q6. Why modular Angular with lazy loading?
- Model answer: Better structure, lower initial bundle impact, and cleaner team-level separation of feature responsibilities.
- Follow-up: Which modules are lazy-loaded?
- Defense: Auth, Dashboard, Users, Committees, Events, Tasks, Attendance, Announcements.

Q7. Why keep both entity relationships and repository custom queries?
- Model answer: Relationships handle object graph mapping, while custom queries optimize common filters and reporting patterns.
- Follow-up: Example?
- Defense: Event participant count, overdue tasks, event date-range filters.

### 18.3 Database and Data Integrity

Q8. Why PostgreSQL over NoSQL here?
- Model answer: Domain is structured with strong relations and constraints. SQL joins and integrity are central to attendance, tasks, and participation tracking.
- Follow-up: Could NoSQL still work?
- Defense: Yes for denormalized read-heavy designs, but consistency and relational integrity would require extra handling.

Q9. How is duplicate participant registration prevented?
- Model answer: Unique constraint on user_id and event_id in event_registrations table.
- Follow-up: Is backend validation still needed?
- Defense: Yes, DB constraint is final safety; service-level validation gives cleaner user feedback.

Q10. How is single-admin policy enforced?
- Model answer: Backend checks existing ADMIN before registration and schema has unique index for admin role text.
- Follow-up: Why both checks?
- Defense: Application check gives meaningful message; DB constraint guarantees hard consistency.

Q11. How do status values remain valid?
- Model answer: Check constraints at DB level and enum mapping in entities.
- Follow-up: Benefit?
- Defense: Prevents invalid states at persistence layer even if client payload is wrong.

### 18.4 API and Error Handling

Q12. Why use a common response wrapper?
- Model answer: Uniform response contract simplifies frontend parsing and error handling.
- Follow-up: What fields are standardized?
- Defense: success, message, data, error, timestamp.

Q13. How do you handle unexpected exceptions?
- Model answer: Global exception handler maps validation, not-found, and generic errors into structured responses.
- Follow-up: Advantage in viva demo?
- Defense: Predictable error payloads make debugging and presentation cleaner.

Q14. Why support PATCH when PUT already exists?
- Model answer: PATCH is efficient for partial updates and avoids resending full entity payloads.
- Follow-up: Any caution?
- Defense: Immutable fields like IDs and created timestamps must be blocked during patch.

### 18.5 Feature Workflow and Product Thinking

Q15. Explain one end-to-end business workflow.
- Model answer: Faculty creates event -> task assignments prepared -> students register -> attendance marked -> announcement published -> feedback captured.
- Follow-up: Which entities are involved?
- Defense: Committee, Events, Task, EventParticipants, Attendance, Announcements, EventFeedback.

Q16. Why is attendance separate from participants?
- Model answer: Registration and attendance are different states; a participant may register but not attend.
- Follow-up: What extra fields justify separation?
- Defense: check_in_time, check_out_time, attendance_method, marked_by, remarks.

Q17. How is student experience personalized?
- Model answer: Role-specific routes, dashboard, profile insights, scoped task and attendance views.
- Follow-up: How does app know role?
- Defense: Role from login response or JWT payload is stored and reused for route decisions.

### 18.6 Limitations, Trade-Offs, and Roadmap

Q18. What are current limitations?
- Model answer: Dashboard cards/charts are mostly demo-configured values, test coverage is limited, and some configuration should be environment-only in production.
- Follow-up: Is that acceptable for academic demo?
- Defense: Yes, core architecture and workflow are complete; these are known improvement tracks.

Q19. If given one week, what would you improve first?
- Model answer: Replace static dashboard metrics with analytics APIs, expand automated test coverage, and harden config and secrets management.
- Follow-up: Why this order?
- Defense: It maximizes functional credibility, reliability, and deployment readiness quickly.

Q20. What makes this project production-oriented, not just a CRUD demo?
- Model answer: Role-secured APIs, relational constraints, multi-entity workflow, modular frontend, global error handling, and integration-style flow across committees, events, tasks, attendance, and announcements.
- Follow-up: One final proof point?
- Defense: Full role-based end-to-end journey works across both frontend navigation and backend authorization.

### 18.7 Rapid Practice Drill (Use Before Viva)

1. Explain architecture in 40 seconds.
2. Explain JWT flow in 30 seconds.
3. Explain ERD in 60 seconds.
4. Explain one user journey in 45 seconds.
5. Explain limitations and roadmap in 30 seconds.

If you can answer all five smoothly, you are viva-ready.
