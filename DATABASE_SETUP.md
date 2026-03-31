# PostgreSQL Database Setup Instructions
# Committees Management System

## Prerequisites
1. PostgreSQL installed and running
2. Access to PostgreSQL command line (psql) or a GUI tool like pgAdmin

## Step 1: Install PostgreSQL (if not already installed)

### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the 'postgres' user
4. Default port is 5432

### MacOS:
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Linux:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create Database and User

### Option A: Using Command Line (psql)
```bash
# Connect to PostgreSQL as postgres user
psql -U postgres -h localhost

# Create the database
CREATE DATABASE committees_db;

# Create a user (optional - you can use postgres user)
CREATE USER committees_admin WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE committees_db TO committees_admin;

# Connect to the new database
\c committees_db

# Exit psql
\q
```

### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → Create → Database
4. Name: `committees_db`
5. Click Save

## Step 3: Run the Database Schema Script

### Method 1: Using psql command line
```bash
# Navigate to your project directory
cd "c:\Programming_lang\FSD\Committees-MS"

# Execute the SQL script
psql -U postgres -d committees_db -f database_schema.sql
```

### Method 2: Using pgAdmin
1. Open pgAdmin and connect to your server
2. Navigate to committees_db
3. Click on Tools → Query Tool
4. Open the database_schema.sql file
5. Click Execute (F5)

## Step 4: Verify Database Creation

### Check Tables Created:
```sql
-- Connect to committees_db and run:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- announcements
- committee
- committee_chat
- event_feedback
- event_media
- event_participants
- events
- login
- roles
- task
- users

### Check Sample Data:
```sql
-- Verify sample data was inserted
SELECT * FROM login;
SELECT * FROM users;
SELECT * FROM committee;
SELECT * FROM events;
SELECT * FROM task;
```

## Step 5: Update Application Configuration

The application.properties has been updated to use PostgreSQL. Make sure to update the credentials if different:

```properties
# In src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/committees_db
spring.datasource.username=postgres
spring.datasource.password=your_actual_password
```

## Step 6: Test the Application

1. Start your Spring Boot application:
```bash
cd "c:\Programming_lang\FSD\Committees-MS"
.\mvnw.cmd spring-boot:run
```

2. The application should start and connect to PostgreSQL
3. Access Swagger UI: http://localhost:8080/swagger-ui/index.html
4. Test the APIs with the sample data

## Troubleshooting

### Connection Issues:
1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   net start postgresql-x64-14
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. **Check port and credentials:**
   - Default port: 5432
   - Default user: postgres
   - Password: what you set during installation

3. **Firewall issues:**
   - Ensure port 5432 is open
   - Check postgresql.conf for listen_addresses
   - Check pg_hba.conf for authentication settings

### Permission Issues:
```sql
-- Grant all privileges on schema
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

## Database Schema Overview

### Core Tables:
- **Login**: Authentication and user roles
- **Users**: User profile information
- **Committee**: Committee details and faculty information
- **Events**: Event management
- **Task**: Task assignment and tracking

### Relationship Tables:
- **Event_participants**: Many-to-many between users and events
- **Event_Feedback**: User feedback for events
- **Event_Media**: Media files for events
- **Committee_Chat**: Committee messaging
- **Announcements**: Committee announcements
- **Roles**: Committee-specific roles

### Features Included:
- ✅ Foreign key constraints
- ✅ Indexes for performance
- ✅ Auto-updating timestamps
- ✅ Data validation constraints
- ✅ Sample data for testing
- ✅ Cascade delete operations
- ✅ Unique constraints to prevent duplicates

## Next Steps
1. Create corresponding JPA entities in your Spring Boot application
2. Update your existing CommittesMs entity or create new entities for each table
3. Create repositories, services, and controllers for the new entities
4. Update your REST APIs to handle the new data structure

Your database is now ready for a full-featured committee management system! 🎉