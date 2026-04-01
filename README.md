# Committees Management System

Full-stack Committee and Event Management platform with:
- Spring Boot backend (Java 17, PostgreSQL, JWT auth, Swagger)
- Angular frontend (Angular 19, modular architecture, lazy-loaded features)

## Current Status

This repository now contains:
1. ERD-aligned backend entities, repositories, services, and controllers.
2. JWT authentication and role-based route protection.
3. Global exception handling and PATCH support across key resources.
4. Angular frontend with feature modules for Auth, Dashboard, Users, Committees, Events, Tasks, Announcements, and Attendance.
5. Demo seed script for professor/project presentation.

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.5.3
- Spring Security + JWT
- Spring Data JPA + Hibernate
- PostgreSQL
- Springdoc OpenAPI
- Maven Wrapper

### Frontend
- Angular 19 (modular, no standalone)
- RxJS
- Bootstrap (CSS)
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

3. (Optional but recommended for demo) Seed demo data:
```bash
psql -U postgres -h localhost -d committees_db -f seed_demo_v2.sql
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
- event_participants
- event_feedback
- event_media
- attendance

Note: Committee chat has been removed from the active model and backend implementation.

## Demo Preparation Checklist

1. Start PostgreSQL service.
2. Apply schema (database_schema.sql).
3. Apply demo seed (seed_demo_v2.sql).
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

## Repository Notes

- Backend and frontend are intentionally kept in one repository for easy academic demonstration.
- If Swagger shows an error, ensure backend is running and dependencies are installed from pom.xml.
- If register/login fails with relation errors, schema was not applied to committees_db.
