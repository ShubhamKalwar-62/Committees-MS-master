# Committees Management System

A comprehensive **Spring Boot REST API** for managing committees, users, events, and tasks in educational institutions. This system provides role-based access control, JWT authentication, and complete CRUD operations for all entities.

## 🚀 Features

### Core Functionality
- **Committee Management** - Create, manage, and organize committees
- **User Management** - Handle users with different roles (Admin, Faculty, Student)
- **Event Management** - Organize events with participant registration and feedback
- **Task Management** - Assign and track tasks with priorities and status
- **Announcement System** - Broadcast announcements to committee members
- **Chat System** - Enable communication within committees
- **Media Management** - Handle event-related media files

### Technical Features
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin, Faculty, and Student roles
- **RESTful API Design** - 70+ well-designed API endpoints
- **Interactive API Documentation** - Swagger/OpenAPI integration
- **Database Integration** - PostgreSQL with JPA/Hibernate
- **Input Validation** - Comprehensive validation with custom error messages
- **CORS Support** - Cross-origin resource sharing enabled

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 17 | Programming Language |
| **Spring Boot** | 3.5.3 | Application Framework |
| **Spring Security** | 6.2.8 | Authentication & Authorization |
| **Spring Data JPA** | 6.6.18 | Data Access Layer |
| **PostgreSQL** | 17.5 | Database |
| **JWT** | 0.12.6 | Token Authentication |
| **Swagger/OpenAPI** | 2.2.0 | API Documentation |
| **Maven** | 3.9+ | Build Tool |

## 📋 Prerequisites

Before running this application, make sure you have:

- **Java 17** or higher installed
- **PostgreSQL 17.5** running locally
- **Maven 3.9+** installed
- **Git** for version control

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Gaikwadshlok/Committees-MS.git
cd Committees-MS
```

### 2. Database Setup
1. **Create PostgreSQL Database:**
   ```sql
   CREATE DATABASE committees_db;
   ```

2. **Run Database Schema:**
   ```bash
   psql -U postgres -d committees_db -f database_schema.sql
   ```

3. **Update Database Credentials:**
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

### 3. Build the Application
```bash
# Using Maven Wrapper (Recommended)
./mvnw clean install

# Or using system Maven
mvn clean install
```

### 4. Run the Application
```bash
# Using Maven Wrapper
./mvnw spring-boot:run

# Or using the batch file (Windows)
./run-app.bat

# Or using system Maven
mvn spring-boot:run
```

The application will start on **http://localhost:8080**

## 📚 API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI Spec:** http://localhost:8080/v3/api-docs
- **Health Check:** http://localhost:8080/health

## 🔐 Authentication

### JWT Token Authentication

1. **Register a new user:**
   ```bash
   POST /api/auth/register
   {
     "email": "admin@example.com",
     "password": "password123",
     "role": "ADMIN",
     "name": "Administrator"
   }
   ```

2. **Login to get JWT token:**
   ```bash
   POST /api/auth/login
   {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```

3. **Use token in subsequent requests:**
   ```bash
   Authorization: Bearer <your_jwt_token>
   ```

### User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, user management, all CRUD operations |
| **FACULTY** | Committee management, event management, task assignment |
| **STUDENT** | Event participation, task updates, announcements viewing |

## 🗂️ API Endpoints Overview

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration  
- `POST /api/auth/validate` - Token validation

### Core Entity Endpoints
- `/api/users/**` - User management
- `/api/committees/**` - Committee operations
- `/api/events/**` - Event management
- `/api/tasks/**` - Task management
- `/api/announcements/**` - Announcement system
- `/api/committee-chat/**` - Committee communication
- `/api/event-participants/**` - Event participation
- `/api/event-feedback/**` - Event feedback
- `/api/event-media/**` - Media management
- `/api/roles/**` - Role management

## 🗃️ Database Schema

The application uses **11 main entities**:

1. **Login** - Authentication credentials
2. **Users** - User profiles and information
3. **Committee** - Committee details and structure
4. **Roles** - System roles and permissions
5. **Announcements** - System-wide announcements
6. **Events** - Event management and scheduling
7. **EventParticipants** - Event registration tracking
8. **EventFeedback** - Event feedback and ratings
9. **EventMedia** - Event-related media files
10. **CommitteeChat** - Committee communication
11. **Task** - Task assignment and tracking

## 🧪 Testing

### Run Unit Tests
```bash
./mvnw test
```

### API Testing with Swagger UI
1. Navigate to http://localhost:8080/swagger-ui.html
2. Authenticate using the `/api/auth/login` endpoint
3. Copy the JWT token from the response
4. Click "Authorize" button and enter: `Bearer <token>`
5. Test any endpoint directly from the interface

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/example/
│   │   ├── CommitteesMsApplication.java    # Main application class
│   │   ├── Controller/                     # REST controllers
│   │   ├── Entity/                         # JPA entities
│   │   ├── Repository/                     # Data repositories
│   │   ├── Service/                        # Business logic
│   │   ├── Security/                       # Security configuration
│   │   ├── Response/                       # Response models
│   │   └── config/                         # Configuration classes
│   └── resources/
│       ├── application.properties          # Application configuration
│       └── static/                         # Static resources
├── test/                                   # Test classes
├── database_schema.sql                     # Database schema
├── DATABASE_SETUP.md                       # Database setup guide
└── pom.xml                                # Maven dependencies
```

## 🔧 Configuration

### Application Properties
Key configuration options in `application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/committees_db
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=your_secret_key
jwt.expiration=86400000

# Swagger Configuration
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 8080 already in use:**
   ```bash
   # Find process using port 8080
   netstat -ano | findstr :8080
   
   # Kill the process (Windows)
   taskkill /PID <process_id> /F
   ```

2. **Database connection issues:**
   - Ensure PostgreSQL is running
   - Verify database credentials in `application.properties`
   - Check if `committees_db` database exists

3. **JWT Token issues:**
   - Ensure you're including the token in Authorization header
   - Check token expiration (default: 24 hours)
   - Verify token format: `Bearer <token>`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Shlok Gaikwad**
- GitHub: [@Gaikwadshlok](https://github.com/Gaikwadshlok)
- Email: support@committees.edu

## 🙏 Acknowledgments

- Spring Boot community for excellent documentation
- PostgreSQL team for the robust database system
- Swagger/OpenAPI for comprehensive API documentation tools

---

## 📊 Project Statistics

- **Total Entities:** 11
- **API Endpoints:** 70+
- **Security Roles:** 3 (Admin, Faculty, Student)
- **Database Tables:** 11
- **Authentication:** JWT-based
- **Documentation:** Interactive Swagger UI

---

**Happy Coding! 🚀**