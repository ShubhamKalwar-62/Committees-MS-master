# Committee Management Frontend (Angular 19)

Angular frontend for the Committees Management System.

## Features

- Modular Angular architecture (no standalone)
- Lazy-loaded feature modules
- JWT authentication flow
- Route guard for protected routes
- HTTP interceptor for Authorization header
- Dashboard with role-based navigation
- Reactive forms with validation

## Module Structure

- Core Module (eager):
  - Header
  - Footer
  - Landing Page

- Shared Module:
  - Reusable button
  - Reusable card
  - Reusable form field

- Feature Modules (lazy):
  - Auth
  - Dashboard
  - Users
  - Committees
  - Events
  - Tasks
  - Attendance
  - Announcements

## Run Frontend

From this folder (committee-management):

```bash
npm install
npx ng serve --port 4200
```

Open: http://localhost:4200

## Build Frontend

```bash
npx ng build
```

## Backend API Requirement

Frontend expects backend at:

- Base URL: http://localhost:8080/api

Ensure backend is running and database schema is initialized.

## Auth Notes

- Login endpoint: /api/auth/login
- Register endpoint: /api/auth/register
- JWT token stored in localStorage
- Role resolved from backend response or JWT claim

## Demo Notes

For presentation:
- Run backend with seeded data (seed_demo_v2.sql)
- Login as a seeded or newly registered user
- Navigate through Dashboard, Events, Tasks, Attendance, Announcements
