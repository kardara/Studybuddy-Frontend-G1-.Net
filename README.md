# StudyBuddy V2 🎓

StudyBuddy is a comprehensive learning management system (LMS) designed to facilitate online education. This repository contains both the modern React frontend and the robust .NET Core backend API.

## 🚀 Project Overview

StudyBuddy provides a seamless experience for students and administrators:
- **Student Portal**: Course browsing, enrollment, progress tracking, quizzes, and certificate generation.
- **Admin Dashboard**: Course management, user administration, and analytics.
- **Secure Authentication**: JWT-based authentication with role-based access control.

## 🛠️ Tech Stack

### Backend
- **Framework**: .NET Core 8 Web API
- **Database**: SQL Server (via Entity Framework Core)
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger UI

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: React Query (TanStack Query) + Context API
- **Routing**: React Router DOM

## 📂 Project Structure

```
Studybuddy-V2/
├── Studybuddy-Backend-G1-.Net-main/   # ASP.NET Core Backend
│   ├── src/
│   │   ├── StudyBuddy.API/            # API Controllers & Entry point
│   │   ├── StudyBuddy.Core/           # Domain Models & Interfaces
│   │   ├── StudyBuddy.Data/           # EF Core & Repositories
│   │   └── StudyBuddy.Services/       # Business Logic Services
│   └── tests/                         # Unit & Integration Tests
│
└── studybuddy-panel-/                 # React Frontend
    ├── src/
    │   ├── components/                # Reusable UI components
    │   ├── contexts/                  # React Contexts (Auth, etc.)
    │   ├── lib/                       # Utilities & Types
    │   ├── pages/                     # Application Pages
    │   └── services/                  # API Integration Services
    └── public/                        # Static Assets
```

## ⚙️ Setup Instructions

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [SQL Server](https://www.microsoft.com/sql-server/sql-server-downloads) (Express or Developer edition)

---

### backend Setup (.NET API)

1. **Navigate to the API directory:**
   ```bash
   cd Studybuddy-Backend-G1-.Net-main/src/StudyBuddy.API
   ```

2. **Configure Database:**
   Update `appsettings.json` with your SQL Server connection string:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost;Database=StudyBuddyDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
   }
   ```

3. **Apply Migrations:**
   ```bash
   dotnet ef database update
   ```

4. **Run the API:**
   ```bash
   dotnet run
   ```
   The API will start at `http://localhost:5103` (or configured port).
   Swagger UI is available at `http://localhost:5103/swagger`.

---

### Frontend Setup (React App)

1. **Navigate to the frontend directory:**
   ```bash
   cd studybuddy-panel-
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   Ensure `src/lib/api.config.ts` points to your running backend:
   ```typescript
   export const API_BASE_URL = 'http://localhost:5103'; // Match your backend port
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:8081` (or 8080).

## 🧪 Testing the Integration

1. Start the Backend (`dotnet run`).
2. Start the Frontend (`npm run dev`).
3. Open the frontend in your browser.
4. **Register** a new account (select "Student" role).
5. You should be redirected to the **Student Dashboard**.
6. Explore **Courses**, **Enrollments**, and **Certificates** to see live data from the API.

## 🤝 Contribution

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
