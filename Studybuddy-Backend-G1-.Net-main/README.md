# StudyBuddy Backend API

> A comprehensive RESTful API for an e-learning platform built with ASP.NET Core (.NET 9) following Clean Architecture principles.

## 🎯 Features Implemented

### ✅ Authentication & User Management

- JWT-based authentication with BCrypt password hashing
- User registration and login
- Role-based authorization (Admin, Student, Instructor)

### ✅ Student Learning Workflow

- **Course Management**: Browse, search, and view course details with modules and lessons
- **Enrollment System**: Enroll in courses with duplicate prevention
- **Progress Tracking**: Automatic progress calculation and enrollment status updates
- **Quiz System**: Auto-grading quizzes with multiple attempts and retake support
- **Certificate Issuance**: Automatic certificate generation upon course completion

## 🏗️ Architecture

```
StudyBuddy.sln
├── src/
│   ├── StudyBuddy.API/          # Web API Layer (Controllers, Program.cs)
│   ├── StudyBuddy.Core/         # Domain Models & Interfaces
│   ├── StudyBuddy.Data/         # Data Access Layer (EF Core, Repositories)
│   └── StudyBuddy.Services/     # Business Logic Layer
```

**Design Pattern**: Repository Pattern with Dependency Injection

## 🚀 Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (LocalDB or Full)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Studybuddy-Backend-G1-.Net-main
```

2. **Update connection string**

Edit `src/StudyBuddy.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=StudyBuddyDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

3. **Run database migrations**

```bash
dotnet ef database update --project src/StudyBuddy.Data --startup-project src/StudyBuddy.API
```

4. **Build the solution**

```bash
dotnet build
```

5. **Run the API**

```bash
dotnet run --project src/StudyBuddy.API
```

6. **Access Swagger UI**

Navigate to: `http://localhost:5103/swagger`

## 📚 API Endpoints

### Authentication

| Method | Endpoint                | Description             | Auth Required |
| ------ | ----------------------- | ----------------------- | ------------- |
| POST   | `/api/v1/auth/register` | Register new user       | ❌            |
| POST   | `/api/v1/auth/login`    | Login and get JWT token | ❌            |

### Courses

| Method | Endpoint                           | Description                | Auth Required |
| ------ | ---------------------------------- | -------------------------- | ------------- |
| GET    | `/api/v1/courses`                  | List all published courses | ❌            |
| GET    | `/api/v1/courses/{id}`             | Get course details         | ❌            |
| GET    | `/api/v1/courses/search?q={query}` | Search courses             | ❌            |

### Enrollments

| Method | Endpoint                               | Description               | Auth Required |
| ------ | -------------------------------------- | ------------------------- | ------------- |
| POST   | `/api/v1/enrollments`                  | Enroll in a course        | ✅            |
| GET    | `/api/v1/enrollments/my-courses`       | Get student's enrollments | ✅            |
| GET    | `/api/v1/enrollments/check/{courseId}` | Check enrollment status   | ✅            |

### Progress

| Method | Endpoint                             | Description              | Auth Required |
| ------ | ------------------------------------ | ------------------------ | ------------- |
| POST   | `/api/v1/progress`                   | Update lesson completion | ✅            |
| GET    | `/api/v1/progress/course/{courseId}` | Get course progress      | ✅            |
| GET    | `/api/v1/progress/my-progress`       | Get all progress         | ✅            |

### Quizzes

| Method | Endpoint                               | Description             | Auth Required |
| ------ | -------------------------------------- | ----------------------- | ------------- |
| GET    | `/api/v1/quizzes/{id}`                 | Get quiz with questions | ✅            |
| POST   | `/api/v1/quizzes/{id}/submit`          | Submit quiz answers     | ✅            |
| GET    | `/api/v1/quizzes/{id}/attempts`        | Get past attempts       | ✅            |
| GET    | `/api/v1/quizzes/attempts/{attemptId}` | Get attempt results     | ✅            |

### Certificates

| Method | Endpoint                               | Description              | Auth Required |
| ------ | -------------------------------------- | ------------------------ | ------------- |
| POST   | `/api/v1/certificates/issue`           | Issue certificate        | ✅            |
| GET    | `/api/v1/certificates/my-certificates` | Get student certificates | ✅            |
| GET    | `/api/v1/certificates/verify/{number}` | Verify certificate       | ❌            |

## 🧪 Testing the API

### Using Swagger UI

1. **Start the API** (`dotnet run --project src/StudyBuddy.API`)
2. **Navigate to** `http://localhost:5103/swagger`

### Register & Login

**Register:**

```json
POST /api/v1/auth/register
{
  "email": "student@test.com",
  "password": "Test123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Student"
}
```

**Login:**

```json
POST /api/v1/auth/login
{
  "email": "student@test.com",
  "password": "Test123!"
}
```

### Authorize

1. Copy the `token` from login response
2. Click "Authorize" button in Swagger
3. Enter: `Bearer YOUR_TOKEN_HERE`
4. Now you can access protected endpoints!

## 📦 Technologies Used

| Technology                | Purpose                 |
| ------------------------- | ----------------------- |
| ASP.NET Core 9.0          | Web API Framework       |
| Entity Framework Core 8.0 | ORM for database access |
| SQL Server                | Database                |
| JWT Bearer                | Authentication          |
| BCrypt.Net                | Password hashing        |
| Swagger/OpenAPI           | API documentation       |

## 🗄️ Database Schema

The database includes 22 entities:

- User, Permission, RolePermission, AuditLog
- Course, Module, Lesson, LessonMaterial
- Enrollment, StudentProgress
- Quiz, Question, QuestionOption, QuizAttempt, StudentAnswer
- Certificate, CertificateTemplate
- ChatSession, ChatMessage, FAQTracker
- UserActivity, AnalyticsSnapshot

## 🔐 Security Features

- JWT token-based authentication
- BCrypt password hashing
- Role-based authorization
- HTTPS redirection
- CORS configuration
- Input validation

## 📝 Configuration

Key settings in `appsettings.json`:

```json
{
  "Jwt": {
    "SecretKey": "your-secret-key-min-32-characters",
    "Issuer": "StudyBuddy.API",
    "Audience": "StudyBuddy.Client",
    "ExpiresInMinutes": 60
  }
}
```

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure SQL Server is running
- Verify connection string in `appsettings.json`
- Run migrations: `dotnet ef database update`

### Build Errors

```bash
dotnet clean
dotnet restore
dotnet build
```

### Migration Issues

```bash
# Remove last migration
dotnet ef migrations remove --project src/StudyBuddy.Data --startup-project src/StudyBuddy.API

# Add new migration
dotnet ef migrations add MigrationName --project src/StudyBuddy.Data --startup-project src/StudyBuddy.API
```

## 👥 Contributors

- **Bashar** - Student Learning Workflow Implementation

## 📄 License

This project is part of an academic assignment.

## 🔗 Related Repositories

- Frontend: [StudyBuddy Frontend Repository]
- Documentation: [Project Documentation]

---

**Built with ❤️ using ASP.NET Core**
