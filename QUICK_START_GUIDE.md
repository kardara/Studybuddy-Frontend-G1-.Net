# StudyBuddy Quick Start Guide

## Prerequisites

- **Backend**: .NET 9.0 SDK installed
- **Frontend**: Node.js 18+ installed
- **Database**: SQL Server 2019+ (local or remote)
- **IDE**: Visual Studio 2022 or VS Code

## Step-by-Step Setup

### 1. Database Setup

1. **Create Database**
   - Open SQL Server Management Studio
   - Run the provided SQL script: `comprehensive_database_fix.sql`
   - Verify tables are created: `Users`, `Courses`, `Modules`, `Lessons`, `Enrollments`, `Quizzes`, `Certificates`, etc.

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Studybuddy-Backend-G1-.Net-main/src/StudyBuddy.API

# Restore NuGet packages
dotnet restore

# Build the project
dotnet build

# Run migrations (if needed)
dotnet ef database update

# Start the server
dotnet run
```

**Expected Output:**

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd studybuddy-panel

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**

```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

### 4. Access the Application

#### Admin User

- **URL**: `http://localhost:5173/admin/dashboard`
- **Default Admin Email**: admin@studybuddy.com
- **Default Password**: Admin@123456

#### Student User

- **URL**: `http://localhost:5173/`
- **Register or use test student account**

## Configuration Files

### Backend: `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=db33783;User Id=sa;Password=your_password;"
  },
  "Jwt": {
    "SecretKey": "your-256-bit-secret-key-at-least-32-characters",
    "Issuer": "StudyBuddy",
    "Audience": "StudyBuddy",
    "ExpirationMinutes": 1440
  },
  "Email": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "FromEmail": "your-email@gmail.com",
    "FromPassword": "your-app-password"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  }
}
```

### Frontend: `.env` (if needed)

```
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=StudyBuddy
```

## First Time Setup - Creating Test Data

### 1. Create Admin Account (via API)

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin@123456",
    "firstName": "Admin",
    "lastName": "User",
    "role": "Admin"
  }'
```

### 2. Create a Course

1. Login to admin dashboard
2. Navigate to "Courses"
3. Click "Create Course"
4. Fill in:
   - Title: "Python Basics"
   - Description: "Learn Python fundamentals"
   - Category: "Programming"
   - Duration: "10" hours
5. Click "Create"

### 3. Create a Module

1. From the course, click "Manage Content"
2. Click "Add Module"
3. Fill in:
   - Title: "Introduction to Python"
   - Description: "Get started with Python"
   - Duration: "120" minutes
4. Click "Save"

### 4. Create a Lesson

1. Click "Add Lesson" under the module
2. Fill in:
   - Title: "Installing Python"
   - Content Type: "Text"
   - Content: "Step-by-step guide to install Python"
   - Duration: "15" minutes
3. Click "Save"

### 5. Create a Quiz

1. Click "Add Quiz" for the module
2. Fill in:
   - Title: "Module Test"
   - Total Questions: "5"
   - Passing Percentage: "70"
   - Duration: "20" minutes
3. Add questions with options
4. Click "Create"

### 6. Publish the Course

1. From Courses list, click the course
2. Click "Publish Course"
3. Course is now available for students

## Common Tasks

### Block a Student

1. Go to Admin → Students
2. Find student in list
3. Click "Block" button
4. Enter reason for blocking
5. Click "Confirm"

### Grant Student Permissions

1. Go to Admin → Students
2. Find student
3. Click "Permissions" (shield icon)
4. Select permissions to grant
5. Click "Save"

### View Student Progress

1. Go to Admin → Analytics
2. Select student
3. View:
   - Enrolled courses
   - Completed courses
   - Quiz attempts
   - Certificates earned

### Download Certificate

1. Login as student
2. Go to "My Certificates"
3. Click course certificate
4. Click "Download"
5. PDF is saved to your device

## Troubleshooting

### Issue: Cannot connect to database

**Solution**:

- Check SQL Server is running: `services.msc` → SQL Server (MSSQLSERVER)
- Verify connection string in `appsettings.json`
- Ensure database `db33783` exists

### Issue: Backend returns 401 Unauthorized

**Solution**:

- Clear browser localStorage: `localStorage.clear()`
- Login again
- Check JWT token in browser DevTools → Application → LocalStorage

### Issue: CORS errors

**Solution**:

- Backend CORS is configured in `Program.cs`
- Ensure frontend URL matches origin in CORS policy
- Check network tab in DevTools for actual error

### Issue: Changes not reflected

**Solution**:

- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache: DevTools → Application → Clear site data
- Restart dev server: `npm run dev`

### Issue: Database migration errors

**Solution**:

- Delete migration files if needed
- Run: `dotnet ef database drop`
- Re-run migrations: `dotnet ef database update`
- Re-run seed script

## Performance Tips

### Backend Optimization

- Enable caching for published courses
- Use database indexing
- Implement pagination for large lists
- Use async/await properly

### Frontend Optimization

- Lazy load components
- Minimize bundle size
- Enable gzip compression
- Use CDN for static assets

## Security Best Practices

- [ ] Change default admin password
- [ ] Use HTTPS in production
- [ ] Set strong JWT secret key
- [ ] Configure CORS properly
- [ ] Validate all user inputs
- [ ] Use HTTPS for database connections
- [ ] Implement rate limiting
- [ ] Regular security audits

## Useful Commands

```bash
# Backend

# Restore packages
dotnet restore

# Build
dotnet build

# Run development server
dotnet run

# Run tests (if available)
dotnet test

# Create migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

## Next Steps

1. **Customize UI**: Modify colors, fonts, logos in `tailwind.config.ts`
2. **Add More Content**: Create courses, modules, lessons, quizzes
3. **Configure Email**: Set up SMTP for notifications
4. **Setup Backups**: Configure automated database backups
5. **Monitor Logs**: Set up centralized logging (if needed)
6. **Custom Domain**: Configure custom domain in production
7. **SSL Certificates**: Install SSL for HTTPS
8. **CDN Setup**: Configure CDN for static assets

## Support Resources

- **API Documentation**: `http://localhost:5000/swagger` (when running)
- **Database Scripts**: See `comprehensive_database_fix.sql`
- **Project Docs**: See `README.md` files in each directory
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **.NET Docs**: https://docs.microsoft.com/dotnet/

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error logs in browser console (F12)
3. Check backend logs in terminal
4. Verify database connection
5. Check API endpoint in Swagger UI
6. Review stored procedures in SQL Server Management Studio

---

**Happy Learning! 🚀**
