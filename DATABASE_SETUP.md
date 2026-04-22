# PostgreSQL Database Setup

This guide is for the current Committees Management System schema.

## Prerequisites
- PostgreSQL installed and running
- psql command available (or use pgAdmin)

## 1) Create database

```sql
CREATE DATABASE committees_db;
```

## 2) Apply schema

From repository root:

```bash
psql -U postgres -h localhost -d committees_db -f database_schema.sql
```

This creates all current tables:
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

If you already have an existing database using `event_participants`, run this migration after schema updates:

```bash
psql -U postgres -h localhost -d committees_db -f migrate_event_participants_to_event_registrations.sql
```

## 3) Optional demo seed

To quickly populate Events, Tasks, Attendance, and Announcements for demo:

```bash
psql -U postgres -h localhost -d committees_db -f seed_demo_v2.sql
```

## 3.1) Enforce single ADMIN account (existing databases)

If your database already has multiple ADMIN rows in `login`, run:

```bash
psql -U postgres -h localhost -d committees_db -f enforce_single_admin.sql
```

What this does:
- Keeps the oldest ADMIN account (smallest `login_id`)
- Converts other ADMIN rows to FACULTY
- Adds a DB-level partial unique index so only one ADMIN can exist

## 4) Configure backend connection

Edit src/main/resources/application.properties:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/committees_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

## 5) Start backend

```bash
./mvnw.cmd spring-boot:run
```

## 6) Verify backend works

- Swagger: http://localhost:8080/swagger-ui/index.html
- OpenAPI: http://localhost:8080/v3/api-docs
- Health: http://localhost:8080/health

## Common Troubleshooting

### relation "login" does not exist
Cause: schema not applied to committees_db.

Fix:
```bash
psql -U postgres -h localhost -d committees_db -f database_schema.sql
```

### authentication failed for user postgres
Cause: wrong DB credentials in application.properties.

Fix: update username/password values to match local PostgreSQL.

### port 5432 or 8080 issues
- Confirm PostgreSQL service is running
- Confirm Spring Boot is running on 8080
- Kill conflicting process if needed

## Notes

- The old committee_chat table is no longer part of the active model.
- Use seed_demo_v2.sql for project/viva demonstration data.
- Fresh schema installs also enforce one ADMIN at DB level via `uq_login_single_admin_role`.
