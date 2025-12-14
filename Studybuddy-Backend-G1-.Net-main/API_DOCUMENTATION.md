# StudyBuddy Backend API - Complete Documentation

> A comprehensive RESTful API for an e-learning platform with React frontend integration guide.

## 🎯 Project Overview

**StudyBuddy** is a complete learning management system with:

- **Role-based Access Control** (Admin & Student only)
- **AI-Powered Course Generation** (PDF → Content via OpenAI)
- **Interactive Learning** with progress tracking & certificates
- **Quiz & Assessment System** with auto-grading
- **AI Study Buddy** with FAQ tracking
- **Complete Analytics Dashboard**

---

## 🏗️ Architecture

```
StudyBuddy.sln
├── src/
│   ├── StudyBuddy.API/          # Web API Layer (Controllers, Middleware)
│   ├── StudyBuddy.Core/         # Domain Models & Interfaces
│   ├── StudyBuddy.Data/         # Data Access Layer (EF Core, Repositories)
│   └── StudyBuddy.Services/     # Business Logic & External Services
```

**Design Pattern**: Clean Architecture with Repository Pattern

---

## 🗄️ Database Schema (16 Tables)

### Core Tables

| Table               | Purpose             | Key Fields                              |
| ------------------- | ------------------- | --------------------------------------- |
| **Users**           | User management     | UserId, Email, Role, IsBlocked          |
| **Courses**         | Course catalog      | CourseId, Title, Status, CreatedBy      |
| **Modules**         | Course sections     | ModuleId, CourseId, Title               |
| **Lessons**         | Learning content    | LessonId, ModuleId, Content             |
| **Enrollments**     | Student-course link | StudentId, CourseId, ProgressPercentage |
| **StudentProgress** | Lesson completion   | StudentId, LessonId, IsCompleted        |

### Assessment Tables

| Table               | Purpose          | Key Fields                          |
| ------------------- | ---------------- | ----------------------------------- |
| **Quizzes**         | Quiz definitions | QuizId, CourseId, PassingPercentage |
| **Questions**       | Quiz questions   | QuestionId, QuizId, QuestionText    |
| **QuestionOptions** | MCQ options      | OptionId, QuestionId, IsCorrect     |
| **QuizAttempts**    | Student attempts | AttemptId, QuizId, TotalScore       |
| **StudentAnswers**  | Answer records   | AnswerId, AttemptId, IsCorrect      |

### System Tables

| Table            | Purpose           | Key Fields                         |
| ---------------- | ----------------- | ---------------------------------- |
| **Certificates** | Course completion | CertificateId, CertificateNumber   |
| **ChatSessions** | AI chat sessions  | SessionId, StudentId               |
| **ChatMessages** | Chat history      | MessageId, SenderType, MessageText |
| **UserActivity** | Analytics data    | ActivityId, ActivityType           |
| **AuditLog**     | Admin actions     | ActionType, EntityType             |

---

## 🚀 Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
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

4. **Build and run**

```bash
dotnet build
dotnet run --project src/StudyBuddy.API
```

5. **Access Swagger UI**
   Navigate to: `http://localhost:5103/swagger`

---

## 📚 API Endpoints

### 🔐 Authentication

| Method | Endpoint                          | Description               | Auth Required |
| ------ | --------------------------------- | ------------------------- | ------------- |
| POST   | `/api/v1/auth/register`           | Register new user         | ❌            |
| POST   | `/api/v1/auth/login`              | Login and get JWT token   | ❌            |
| POST   | `/api/v1/auth/refresh-token`      | Refresh JWT token         | ❌            |
| POST   | `/api/v1/auth/logout`             | Logout user               | ✅            |
| POST   | `/api/v1/auth/forgot-password`    | Send password reset email | ❌            |
| POST   | `/api/v1/auth/reset-password`     | Reset password with token | ❌            |
| POST   | `/api/v1/auth/verify-reset-token` | Verify token validity     | ❌            |

### 👥 Admin User Management

| Method | Endpoint                                   | Description          | Auth Required |
| ------ | ------------------------------------------ | -------------------- | ------------- |
| GET    | `/api/v1/admin/users`                      | List all users       | ✅ (Admin)    |
| GET    | `/api/v1/admin/users/{userId}`             | Get user details     | ✅ (Admin)    |
| PUT    | `/api/v1/admin/users/{userId}`             | Update user          | ✅ (Admin)    |
| DELETE | `/api/v1/admin/users/{userId}`             | Delete user          | ✅ (Admin)    |
| PUT    | `/api/v1/admin/users/{userId}/block`       | Block user           | ✅ (Admin)    |
| PUT    | `/api/v1/admin/users/{userId}/unblock`     | Unblock user         | ✅ (Admin)    |
| GET    | `/api/v1/admin/users/{userId}/permissions` | Get user permissions | ✅ (Admin)    |
| POST   | `/api/v1/admin/audit-logs`                 | Get audit logs       | ✅ (Admin)    |

### 📖 Course Management

| Method | Endpoint                            | Description                | Auth Required |
| ------ | ----------------------------------- | -------------------------- | ------------- |
| GET    | `/api/v1/courses`                   | List all published courses | ❌            |
| GET    | `/api/v1/courses/{id}`              | Get course details         | ❌            |
| GET    | `/api/v1/courses/search?q={query}`  | Search courses             | ❌            |
| POST   | `/api/v1/courses`                   | Create course (upload PDF) | ✅ (Admin)    |
| PUT    | `/api/v1/courses/{id}`              | Update course              | ✅ (Admin)    |
| DELETE | `/api/v1/courses/{id}`              | Delete course              | ✅ (Admin)    |
| POST   | `/api/v1/courses/{id}/publish`      | Publish course             | ✅ (Admin)    |
| POST   | `/api/v1/courses/{id}/unpublish`    | Unpublish course           | ✅ (Admin)    |
| POST   | `/api/v1/courses/generate-from-pdf` | Generate content from PDF  | ✅ (Admin)    |
| POST   | `/api/v1/courses/generate-quizzes`  | Generate quizzes via AI    | ✅ (Admin)    |

### 🎓 Student Course Access

| Method | Endpoint                                              | Description                   | Auth Required |
| ------ | ----------------------------------------------------- | ----------------------------- | ------------- |
| GET    | `/api/v1/student/courses`                             | Available courses for student | ✅ (Student)  |
| POST   | `/api/v1/student/courses/{courseId}/enroll`           | Enroll in course              | ✅ (Student)  |
| GET    | `/api/v1/student/enrollments`                         | Get student's enrollments     | ✅ (Student)  |
| GET    | `/api/v1/student/enrollments/{enrollmentId}/progress` | Course progress               | ✅ (Student)  |

### 📊 Progress Tracking

| Method | Endpoint                             | Description              | Auth Required |
| ------ | ------------------------------------ | ------------------------ | ------------- |
| POST   | `/api/v1/progress`                   | Update lesson completion | ✅            |
| GET    | `/api/v1/progress/course/{courseId}` | Get course progress      | ✅            |
| GET    | `/api/v1/progress/my-progress`       | Get all progress         | ✅            |

### 🧠 Quiz & Assessment

| Method | Endpoint                               | Description             | Auth Required |
| ------ | -------------------------------------- | ----------------------- | ------------- |
| GET    | `/api/v1/quizzes/{id}`                 | Get quiz with questions | ✅            |
| POST   | `/api/v1/quizzes/{id}/start`           | Start quiz attempt      | ✅            |
| POST   | `/api/v1/quizzes/{id}/submit`          | Submit quiz answers     | ✅            |
| GET    | `/api/v1/quizzes/{id}/attempts`        | Get past attempts       | ✅            |
| GET    | `/api/v1/quizzes/attempts/{attemptId}` | Get attempt results     | ✅            |

### 🏆 Certificates

| Method | Endpoint                                        | Description              | Auth Required |
| ------ | ----------------------------------------------- | ------------------------ | ------------- |
| POST   | `/api/v1/certificates/issue`                    | Issue certificate        | ✅            |
| GET    | `/api/v1/certificates/my-certificates`          | Get student certificates | ✅            |
| GET    | `/api/v1/certificates/verify/{number}`          | Verify certificate       | ❌            |
| GET    | `/api/v1/certificates/{certificateId}/download` | Download certificate PDF | ✅            |

### 💬 Chat & AI Study Buddy

| Method | Endpoint                                    | Description              | Auth Required |
| ------ | ------------------------------------------- | ------------------------ | ------------- |
| POST   | `/api/v1/chat/sessions`                     | Create chat session      | ✅            |
| GET    | `/api/v1/chat/sessions/{sessionId}`         | Get chat history         | ✅            |
| POST   | `/api/v1/chat/messages`                     | Send message (to AI)     | ✅            |
| GET    | `/api/v1/chat/sessions/{sessionId}/history` | Get full conversation    | ✅            |
| GET    | `/api/v1/chat/faq`                          | Get most asked questions | ✅            |
| GET    | `/api/v1/chat/faq/by-course/{courseId}`     | FAQ by course            | ✅            |
| PUT    | `/api/v1/chat/sessions/{sessionId}/close`   | Close chat session       | ✅            |
| GET    | `/api/v1/chat/my-sessions`                  | Get user's chat sessions | ✅            |

### 📈 Analytics & Reporting

| Method | Endpoint                                          | Description                | Auth Required |
| ------ | ------------------------------------------------- | -------------------------- | ------------- |
| GET    | `/api/v1/analytics/dashboard`                     | Admin dashboard metrics    | ✅ (Admin)    |
| GET    | `/api/v1/analytics/courses/{courseId}`            | Course-specific analytics  | ✅ (Admin)    |
| GET    | `/api/v1/analytics/students`                      | Student analytics          | ✅ (Admin)    |
| GET    | `/api/v1/analytics/students/{studentId}/progress` | Student progress analytics | ✅            |
| GET    | `/api/v1/analytics/top-courses`                   | Most popular courses       | ✅ (Admin)    |
| GET    | `/api/v1/analytics/most-active-students`          | Most active students       | ✅ (Admin)    |
| GET    | `/api/v1/analytics/enrollment-trends`             | Enrollment trends          | ✅ (Admin)    |
| POST   | `/api/v1/analytics/export`                        | Export analytics data      | ✅ (Admin)    |

---

## 🔧 Stored Procedures (16 Total)

Your requested 8 procedures are **ALL IMPLEMENTED** ✅, plus 8 additional ones:

### ✅ Your Requested Procedures (All Present)

1. **sp_GenerateCourseContentFromPDF** - AI content generation from PDF
2. **sp_CalculateCourseProgress** - Calculate student progress percentage
3. **sp_IssueCertificate** - Generate certificates with unique numbers
4. **sp_GetAdminDashboardMetrics** - Dashboard KPIs (courses, students, etc.)
5. **sp_TrackFAQQuestion** - Track frequently asked questions
6. **sp_GradeQuizAttempt** - Auto-grade quizzes with pass/fail determination
7. **sp_BlockUser** - Block/unblock users with audit logging
8. **sp_MarkLessonAsComplete** - Update lesson completion & recalculate progress

### 🔄 Additional Procedures (Bonus)

9. **sp_GeneratePasswordResetToken** - Password reset token generation
10. **sp_VerifyAndResetPassword** - Validate token and reset password
11. **sp_GetStudentCourseProgress** - Detailed progress with lesson counts
12. **sp_CanStudentRetakeQuiz** - Check retake eligibility
13. **sp_GetStudentQuizAttempts** - Quiz history for dashboard
14. **sp_CheckCertificateEligibility** - Validate completion requirements
15. **sp_GetCourseAnalytics** - Course-specific analytics
16. **sp_GetTopFAQQuestions** - Retrieve top N FAQ questions

---

## 🖥️ React Frontend Integration Guide

### 📦 Installation & Setup

1. **Create React App**

```bash
npx create-react-app studybuddy-frontend
cd studybuddy-frontend
npm install axios react-router-dom @reduxjs/toolkit react-redux
```

2. **Environment Configuration**
   Create `.env` in your React project:

```env
REACT_APP_API_BASE_URL=http://localhost:5103
REACT_APP_JWT_SECRET_KEY=your-jwt-secret-key
```

### 🔗 API Client Setup

**services/api.js**

```javascript
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5103";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 🔐 Authentication Service

**services/authService.js**

```javascript
import apiClient from "./api";

export const authService = {
  // Register new user
  async register(userData) {
    const response = await apiClient.post("/api/v1/auth/register", userData);
    return response.data;
  },

  // Login user
  async login(credentials) {
    const response = await apiClient.post("/api/v1/auth/login", credentials);
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    apiClient.post("/api/v1/auth/logout");
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  // Send password reset email
  async forgotPassword(email) {
    return await apiClient.post("/api/v1/auth/forgot-password", { email });
  },

  // Reset password with token
  async resetPassword(token, newPassword) {
    return await apiClient.post("/api/v1/auth/reset-password", {
      token,
      newPassword,
    });
  },
};
```

### 📚 Course Service

**services/courseService.js**

```javascript
import apiClient from "./api";

export const courseService = {
  // Get all published courses
  async getPublishedCourses() {
    const response = await apiClient.get("/api/v1/courses");
    return response.data;
  },

  // Get course details
  async getCourseDetails(courseId) {
    const response = await apiClient.get(`/api/v1/courses/${courseId}`);
    return response.data;
  },

  // Search courses
  async searchCourses(query) {
    const response = await apiClient.get(`/api/v1/courses/search?q=${query}`);
    return response.data;
  },

  // Enroll in course (Student)
  async enrollInCourse(courseId) {
    const response = await apiClient.post(
      `/api/v1/student/courses/${courseId}/enroll`
    );
    return response.data;
  },

  // Get student enrollments
  async getMyEnrollments() {
    const response = await apiClient.get("/api/v1/student/enrollments");
    return response.data;
  },

  // Create course (Admin) - Upload PDF
  async createCourse(courseData, pdfFile) {
    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("category", courseData.category);
    formData.append("pdfFile", pdfFile);

    const response = await apiClient.post("/api/v1/courses", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Generate content from PDF (Admin)
  async generateCourseContent(courseId) {
    const response = await apiClient.post(`/api/v1/courses/generate-from-pdf`, {
      courseId,
    });
    return response.data;
  },
};
```

### 🎓 Quiz Service

**services/quizService.js**

```javascript
import apiClient from "./api";

export const quizService = {
  // Get quiz with questions
  async getQuiz(quizId) {
    const response = await apiClient.get(`/api/v1/quizzes/${quizId}`);
    return response.data;
  },

  // Start quiz attempt
  async startQuiz(quizId) {
    const response = await apiClient.post(`/api/v1/quizzes/${quizId}/start`);
    return response.data;
  },

  // Submit quiz answers
  async submitQuiz(quizId, attemptId, answers) {
    const response = await apiClient.post(`/api/v1/quizzes/${quizId}/submit`, {
      attemptId,
      answers,
    });
    return response.data;
  },

  // Get quiz attempts
  async getQuizAttempts(quizId) {
    const response = await apiClient.get(`/api/v1/quizzes/${quizId}/attempts`);
    return response.data;
  },

  // Get attempt results
  async getAttemptResults(attemptId) {
    const response = await apiClient.get(
      `/api/v1/quizzes/attempts/${attemptId}`
    );
    return response.data;
  },
};
```

### 💬 Chat Service

**services/chatService.js**

```javascript
import apiClient from "./api";

export const chatService = {
  // Create chat session
  async createSession(courseId = null) {
    const response = await apiClient.post("/api/v1/chat/sessions", {
      courseId,
    });
    return response.data;
  },

  // Get chat history
  async getChatHistory(sessionId) {
    const response = await apiClient.get(`/api/v1/chat/sessions/${sessionId}`);
    return response.data;
  },

  // Send message to AI
  async sendMessage(sessionId, message) {
    const response = await apiClient.post("/api/v1/chat/messages", {
      sessionId,
      message,
    });
    return response.data;
  },

  // Get FAQ questions
  async getFAQ(courseId = null) {
    const url = courseId
      ? `/api/v1/chat/faq/by-course/${courseId}`
      : "/api/v1/chat/faq";

    const response = await apiClient.get(url);
    return response.data;
  },

  // Close chat session
  async closeSession(sessionId) {
    const response = await apiClient.put(
      `/api/v1/chat/sessions/${sessionId}/close`
    );
    return response.data;
  },

  // Get user's chat sessions
  async getMySessions() {
    const response = await apiClient.get("/api/v1/chat/my-sessions");
    return response.data;
  },
};
```

### 🏆 Certificate Service

**services/certificateService.js**

```javascript
import apiClient from "./api";

export const certificateService = {
  // Get my certificates
  async getMyCertificates() {
    const response = await apiClient.get(
      "/api/v1/certificates/my-certificates"
    );
    return response.data;
  },

  // Verify certificate
  async verifyCertificate(certificateNumber) {
    const response = await apiClient.get(
      `/api/v1/certificates/verify/${certificateNumber}`
    );
    return response.data;
  },

  // Download certificate PDF
  downloadCertificate(certificateId) {
    const token = localStorage.getItem("token");
    const url = `${process.env.REACT_APP_API_BASE_URL}/api/v1/certificates/${certificateId}/download`;

    // Open download in new window
    window.open(url, "_blank");
  },
};
```

### 📊 Analytics Service

**services/analyticsService.js**

```javascript
import apiClient from "./api";

export const analyticsService = {
  // Get admin dashboard metrics
  async getDashboardMetrics() {
    const response = await apiClient.get("/api/v1/analytics/dashboard");
    return response.data;
  },

  // Get course analytics
  async getCourseAnalytics(courseId) {
    const response = await apiClient.get(
      `/api/v1/analytics/courses/${courseId}`
    );
    return response.data;
  },

  // Get student progress
  async getStudentProgress(studentId) {
    const response = await apiClient.get(
      `/api/v1/analytics/students/${studentId}/progress`
    );
    return response.data;
  },

  // Get top courses
  async getTopCourses() {
    const response = await apiClient.get("/api/v1/analytics/top-courses");
    return response.data;
  },

  // Export analytics data
  async exportAnalytics(filters) {
    const response = await apiClient.post("/api/v1/analytics/export", filters);
    return response.data;
  },
};
```

### 👥 Admin Service

**services/adminService.js**

```javascript
import apiClient from "./api";

export const adminService = {
  // Get all users
  async getAllUsers() {
    const response = await apiClient.get("/api/v1/admin/users");
    return response.data;
  },

  // Get user details
  async getUserDetails(userId) {
    const response = await apiClient.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  },

  // Block user
  async blockUser(userId, reason) {
    const response = await apiClient.put(
      `/api/v1/admin/users/${userId}/block`,
      {
        reason,
      }
    );
    return response.data;
  },

  // Unblock user
  async unblockUser(userId) {
    const response = await apiClient.put(
      `/api/v1/admin/users/${userId}/unblock`
    );
    return response.data;
  },

  // Get audit logs
  async getAuditLogs(filters = {}) {
    const response = await apiClient.post("/api/v1/admin/audit-logs", filters);
    return response.data;
  },
};
```

---

## 🧩 React Components Examples

### Authentication Components

**Login.jsx**

```javascript
import React, { useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await authService.login(formData);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
```

### Course Components

**CourseList.jsx**

```javascript
import React, { useState, useEffect } from "react";
import { courseService } from "../services/courseService";
import { Link } from "react-router-dom";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseService.getPublishedCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const data = await courseService.searchCourses(searchQuery);
        setCourses(data);
      } catch (error) {
        console.error("Error searching courses:", error);
      }
    } else {
      loadCourses();
    }
  };

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.courseId} className="course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="course-meta">
              <span>Category: {course.category}</span>
              <span>Duration: {course.durationHours} hours</span>
            </div>
            <Link to={`/course/${course.courseId}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
```

### Quiz Component

**QuizTaking.jsx**

```javascript
import React, { useState, useEffect } from "react";
import { quizService } from "../services/quizService";
import { useParams, useNavigate } from "react-router-dom";

const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const quizData = await quizService.getQuiz(quizId);
      setQuiz(quizData);

      // Start quiz attempt
      const attemptData = await quizService.startQuiz(quizId);
      setAttempt(attemptData);
    } catch (error) {
      console.error("Error loading quiz:", error);
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Convert answers to API format
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId: parseInt(questionId),
        selectedOptionId: answers[questionId],
      }));

      const result = await quizService.submitQuiz(
        quizId,
        attempt.attemptId,
        formattedAnswers
      );

      // Navigate to results
      navigate(`/quiz/${quizId}/results/${attempt.attemptId}`, {
        state: { result },
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  if (!quiz) return <div>Loading quiz...</div>;

  const question = quiz.questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{quiz.title}</h2>
        <p>
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>
      </div>

      <div className="question-container">
        <h3>{question.questionText}</h3>
        <div className="options">
          {question.options.map((option) => (
            <button
              key={option.optionId}
              className={`option ${
                answers[question.questionId] === option.optionId
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                handleAnswerSelect(question.questionId, option.optionId)
              }
            >
              {option.optionText}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button onClick={handlePrevious} disabled={currentQuestion === 0}>
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestion === quiz.questions.length - 1}
        >
          Next
        </button>
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < quiz.questions.length}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizTaking;
```

### Chat Component

**AIChat.jsx**

```javascript
import React, { useState, useEffect, useRef } from "react";
import { chatService } from "../services/chatService";

const AIChat = ({ courseId }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();
  }, [courseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      const session = await chatService.createSession(courseId);
      setSessionId(session.sessionId);

      // Load chat history
      const history = await chatService.getChatHistory(session.sessionId);
      setMessages(history.messages || []);
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = {
      messageText: inputMessage,
      senderType: "Student",
      sentAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await chatService.sendMessage(sessionId, inputMessage);

      const aiMessage = {
        messageText: response.messageText,
        senderType: "AI",
        sentAt: response.sentAt,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>AI Study Buddy</h3>
        {courseId && <span>Course-specific help</span>}
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.senderType === "Student" ? "user-message" : "ai-message"
            }`}
          >
            <div className="message-content">{message.messageText}</div>
            <div className="message-time">
              {new Date(message.sentAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-message">
            <div className="message-content">AI is typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask me anything about your course..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !inputMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChat;
```

---

## 🔧 Configuration

### Backend Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=StudyBuddyDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-key-min-32-characters",
    "Issuer": "StudyBuddy.API",
    "Audience": "StudyBuddy.Client",
    "ExpirationMinutes": 60
  },
  "OpenAI": {
    "ApiKey": "your-openai-api-key",
    "Model": "gpt-4"
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "FromAddress": "noreply@studybuddy.com",
    "SenderName": "StudyBuddy Team",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "EnableSSL": true
  },
  "CertificateSettings": {
    "TemplateHtml": "<html>...certificate template...</html>",
    "LogoUrl": "https://your-domain.com/logo.png",
    "FontFamily": "Arial, sans-serif"
  },
  "FileStorage": {
    "MaxUploadSizeMB": 100,
    "AllowedExtensions": ".pdf,.jpg,.jpeg,.png",
    "StoragePath": "C:\\uploads"
  }
}
```

### Frontend Environment (`.env`)

```env
REACT_APP_API_BASE_URL=http://localhost:5103
REACT_APP_JWT_SECRET_KEY=your-jwt-secret-key
REACT_APP_APP_NAME=StudyBuddy Learning Platform
```

---

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

---

## 🔐 Security Features

- JWT token-based authentication
- BCrypt password hashing
- Role-based authorization (Admin/Student)
- HTTPS redirection
- CORS configuration for frontend
- Input validation on all endpoints
- Account blocking/unblocking
- Audit logging of admin actions

---

## 📦 Technologies Used

| Technology                | Purpose                      |
| ------------------------- | ---------------------------- |
| ASP.NET Core 9.0          | Web API Framework            |
| Entity Framework Core 8.0 | ORM for database access      |
| SQL Server                | Database                     |
| JWT Bearer                | Authentication               |
| BCrypt.Net                | Password hashing             |
| Swagger/OpenAPI           | API documentation            |
| OpenAI GPT-4              | AI content generation & chat |

---

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

---

## 👥 Contributors

- **Bashar** - Student Learning Workflow Implementation

---

## 📄 License

This project is part of an academic assignment.

---

**Built with ❤️ using ASP.NET Core**
