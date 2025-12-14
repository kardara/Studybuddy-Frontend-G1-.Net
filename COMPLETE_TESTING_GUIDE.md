# StudyBuddy Complete Testing Guide

## Test Environment Setup

### Prerequisites

- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- SQL Server with `db33783` database
- Test user accounts created

### Test User Accounts

#### Admin Account

```
Email: admin@studybuddy.com
Password: Admin@123456
Role: Admin
```

#### Student Account 1

```
Email: student1@studybuddy.com
Password: Student@123456
Role: Student
```

#### Student Account 2

```
Email: student2@studybuddy.com
Password: Student@123456
Role: Student
```

## API Testing (Using Swagger)

### 1. Authentication Tests

**Test 1.1: Login with Valid Credentials**

- **Endpoint**: `POST /api/v1/auth/login`
- **Body**:
  ```json
  {
    "email": "admin@studybuddy.com",
    "password": "Admin@123456"
  }
  ```
- **Expected Response**: 200 OK with JWT token
- **Verification**: Token received and stored in localStorage

**Test 1.2: Login with Invalid Credentials**

- **Body**:
  ```json
  {
    "email": "admin@studybuddy.com",
    "password": "WrongPassword"
  }
  ```
- **Expected Response**: 401 Unauthorized

**Test 1.3: Register New User**

- **Endpoint**: `POST /api/v1/auth/register`
- **Body**:
  ```json
  {
    "email": "newstudent@studybuddy.com",
    "password": "NewPass@123456",
    "firstName": "New",
    "lastName": "Student",
    "role": "Student"
  }
  ```
- **Expected Response**: 200 OK with JWT token and user details

### 2. Admin User Management Tests

**Test 2.1: Get All Users**

- **Endpoint**: `GET /api/v1/admin/users`
- **Headers**: Authorization: Bearer {admin_token}
- **Expected Response**: 200 OK with user list and pagination

**Test 2.2: Get User Details**

- **Endpoint**: `GET /api/v1/admin/users/{userId}`
- **Headers**: Authorization: Bearer {admin_token}
- **Expected Response**: 200 OK with detailed user info including statistics

**Test 2.3: Block User**

- **Endpoint**: `PUT /api/v1/admin/users/{userId}/block`
- **Headers**: Authorization: Bearer {admin_token}
- **Body**:
  ```json
  {
    "blockReason": "Violating course policies"
  }
  ```
- **Expected Response**: 200 OK
- **Verification**:
  - User's `isBlocked` field becomes true
  - `blockReason` is stored
  - User cannot login

**Test 2.4: Unblock User**

- **Endpoint**: `PUT /api/v1/admin/users/{userId}/unblock`
- **Headers**: Authorization: Bearer {admin_token}
- **Expected Response**: 200 OK
- **Verification**:
  - User's `isBlocked` field becomes false
  - User can login again

**Test 2.5: Get User Permissions**

- **Endpoint**: `GET /api/v1/admin/users/{userId}/permissions`
- **Headers**: Authorization: Bearer {admin_token}
- **Expected Response**: 200 OK with list of user permissions

### 3. Course Management Tests

**Test 3.1: Create Course**

- **Endpoint**: `POST /api/v1/courses`
- **Headers**: Authorization: Bearer {admin_token}
- **Body**:
  ```json
  {
    "title": "Python Basics",
    "description": "Learn Python fundamentals",
    "category": "Programming",
    "estimatedDurationHours": 10
  }
  ```
- **Expected Response**: 201 Created with course ID
- **Verification**: Course appears in course list

**Test 3.2: Get Published Courses**

- **Endpoint**: `GET /api/v1/courses`
- **Expected Response**: 200 OK with published courses list

**Test 3.3: Get Course Details**

- **Endpoint**: `GET /api/v1/courses/{courseId}`
- **Expected Response**: 200 OK with full course details including modules

**Test 3.4: Publish Course**

- **Endpoint**: `POST /api/v1/courses/{courseId}/publish`
- **Headers**: Authorization: Bearer {admin_token}
- **Expected Response**: 200 OK
- **Verification**: Course `status` becomes "Published"

**Test 3.5: Unpublish Course**

- **Endpoint**: `POST /api/v1/courses/{courseId}/unpublish`
- **Headers**: Authorization: Bearer {admin_token}
- **Expected Response**: 200 OK
- **Verification**: Course `status` becomes "Draft"

### 4. Module Management Tests

**Test 4.1: Create Module**

- **Endpoint**: `POST /api/v1/courses/{courseId}/modules`
- **Headers**: Authorization: Bearer {admin_token}
- **Body**:
  ```json
  {
    "title": "Introduction",
    "description": "Course introduction",
    "estimatedDurationMinutes": 120
  }
  ```
- **Expected Response**: 201 Created with module ID
- **Verification**: Module appears in course modules list

**Test 4.2: Get Modules**

- **Endpoint**: `GET /api/v1/courses/{courseId}/modules`
- **Expected Response**: 200 OK with modules list

**Test 4.3: Update Module**

- **Endpoint**: `PUT /api/v1/courses/{courseId}/modules/{moduleId}`
- **Headers**: Authorization: Bearer {admin_token}
- **Body**:
  ```json
  {
    "title": "Introduction - Updated",
    "description": "Updated description"
  }
  ```
- **Expected Response**: 200 OK
- **Verification**: Module title and description updated

**Test 4.4: Delete Module**

- **Endpoint**: `DELETE /api/v1/courses/{courseId}/modules/{moduleId}`
- **Headers**: Authorization: Bearer {admin_token}
- **Expected Response**: 200 OK
- **Verification**: Module is removed from course

### 5. Lesson Management Tests

**Test 5.1: Create Lesson**

- **Endpoint**: `POST /api/v1/courses/{courseId}/modules/{moduleId}/lessons`
- **Headers**: Authorization: Bearer {admin_token}
- **Body**:
  ```json
  {
    "title": "Lesson 1: Getting Started",
    "content": "Detailed lesson content here",
    "contentType": "text",
    "estimatedDurationMinutes": 30
  }
  ```
- **Expected Response**: 201 Created with lesson ID
- **Verification**: Lesson appears in module lessons list

**Test 5.2: Get Lesson Details**

- **Endpoint**: `GET /api/v1/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}`
- **Expected Response**: 200 OK with lesson details

**Test 5.3: Update Lesson**

- **Endpoint**: `PUT /api/v1/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}`
- **Headers**: Authorization: Bearer {admin_token}
- **Body**:
  ```json
  {
    "title": "Lesson 1: Getting Started - Updated",
    "content": "Updated content",
    "contentType": "text"
  }
  ```
- **Expected Response**: 200 OK
- **Verification**: Lesson content updated

**Test 5.4: Delete Lesson**

- **Endpoint**: `DELETE /api/v1/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}`
- **Headers**: Authorization: Bearer {admin_token}
- **Expected Response**: 200 OK
- **Verification**: Lesson is removed

### 6. Enrollment Tests

**Test 6.1: Enroll in Course**

- **Endpoint**: `POST /api/v1/enrollments`
- **Headers**: Authorization: Bearer {student_token}
- **Body**:
  ```json
  {
    "courseId": {courseId}
  }
  ```
- **Expected Response**: 200 OK
- **Verification**: Enrollment record created with "Active" status

**Test 6.2: Get My Courses**

- **Endpoint**: `GET /api/v1/enrollments/my-courses`
- **Headers**: Authorization: Bearer {student_token}
- **Expected Response**: 200 OK with enrolled courses

**Test 6.3: Check Enrollment**

- **Endpoint**: `GET /api/v1/enrollments/check/{courseId}`
- **Headers**: Authorization: Bearer {student_token}
- **Expected Response**: 200 OK with `{ "isEnrolled": true }`

### 7. Progress Tracking Tests

**Test 7.1: Mark Lesson Complete**

- **Endpoint**: `POST /api/v1/progress`
- **Headers**: Authorization: Bearer {student_token}
- **Body**:
  ```json
  {
    "lessonId": {lessonId},
    "courseId": {courseId},
    "isCompleted": true
  }
  ```
- **Expected Response**: 200 OK
- **Verification**: StudentProgress record created

**Test 7.2: Get Course Progress**

- **Endpoint**: `GET /api/v1/progress/course/{courseId}`
- **Headers**: Authorization: Bearer {student_token}
- **Expected Response**: 200 OK with progress details

**Test 7.3: Get My Progress**

- **Endpoint**: `GET /api/v1/progress/my-progress`
- **Headers**: Authorization: Bearer {student_token}
- **Expected Response**: 200 OK with all student progress

### 8. Quiz Tests

**Test 8.1: Create Quiz**

- **Endpoint**: `POST /api/v1/quizzes`
- **Headers**: Authorization: Bearer {admin_token}
- **Body**:
  ```json
  {
    "courseId": {courseId},
    "moduleId": {moduleId},
    "title": "Module Test",
    "totalQuestions": 5,
    "passingPercentage": 70,
    "durationMinutes": 30
  }
  ```
- **Expected Response**: 201 Created with quiz ID

**Test 8.2: Get Quiz**

- **Endpoint**: `GET /api/v1/quizzes/{quizId}`
- **Expected Response**: 200 OK with quiz details and questions

**Test 8.3: Submit Quiz**

- **Endpoint**: `POST /api/v1/quizzes/{quizId}/submit`
- **Headers**: Authorization: Bearer {student_token}
- **Body**:
  ```json
  {
    "quizId": {quizId},
    "courseId": {courseId},
    "answers": [
      {
        "questionId": {questionId},
        "selectedOptionId": {optionId}
      }
    ]
  }
  ```
- **Expected Response**: 200 OK with quiz results including score and passing status

### 9. Certificate Tests

**Test 9.1: Issue Certificate**

- **Endpoint**: `POST /api/v1/certificates/issue`
- **Headers**: Authorization: Bearer {admin_token}
- **Body**:
  ```json
  {
    "studentId": {studentId},
    "courseId": {courseId}
  }
  ```
- **Expected Response**: 201 Created with certificate details

**Test 9.2: Get My Certificates**

- **Endpoint**: `GET /api/v1/certificates/my-certificates`
- **Headers**: Authorization: Bearer {student_token}
- **Expected Response**: 200 OK with student's certificates

**Test 9.3: Verify Certificate**

- **Endpoint**: `GET /api/v1/certificates/verify/{certificateNumber}`
- **Expected Response**: 200 OK with certificate details (public endpoint)

**Test 9.4: Download Certificate**

- **Endpoint**: `GET /api/v1/certificates/download/{certificateId}`
- **Headers**: Authorization: Bearer {student_token}
- **Expected Response**: 200 OK with PDF file

## Frontend UI Testing

### Admin Dashboard Tests

**Test A1: Admin Login**

- Go to `http://localhost:5173/admin/login`
- Enter admin credentials
- Expected: Redirected to admin dashboard

**Test A2: Student Management**

- Navigate to Admin → Students
- Verify: All students listed with details
- Test: Block a student
  - Click block button
  - Enter reason
  - Verify: Student status changes to "Blocked"
- Test: Unblock student
  - Click unblock button
  - Verify: Student status changes to "Active"
- Test: Manage permissions
  - Click permissions button
  - Select permissions
  - Click save
  - Verify: Permissions updated

**Test A3: Course Management**

- Navigate to Admin → Courses
- Test: Create course
  - Click "Create Course"
  - Fill all fields
  - Click "Create"
  - Verify: Course appears in list
- Test: Manage course content
  - Click course
  - Click "Manage Content"
  - Add module, add lessons
  - Verify: Content appears

**Test A4: Publishing**

- From course list, select a course
- Click "Publish"
- Verify: Status changes to "Published"
- Navigate to student dashboard
- Verify: Published course appears

### Student Dashboard Tests

**Test S1: Student Registration**

- Go to `http://localhost:5173/register`
- Fill in registration form
- Click "Register"
- Expected: Account created and logged in

**Test S2: Browse Courses**

- Go to home page
- Verify: Published courses displayed
- Can search courses
- Can filter by category

**Test S3: Enroll in Course**

- Click a course
- Click "Enroll"
- Verify: Enrollment successful
- Verify: Course appears in "My Courses"

**Test S4: Learn Course**

- Go to enrolled course
- Verify: Modules and lessons displayed
- Click lesson to view content
- Click "Mark as Complete"
- Verify: Lesson marked complete
- Verify: Progress updated

**Test S5: Take Quiz**

- Complete all lessons in module
- Click "Take Quiz"
- Answer questions
- Click "Submit"
- Verify: Results displayed
  - Score shown
  - Correct/incorrect answers shown
  - Pass/fail status shown

**Test S6: View Certificates**

- Complete entire course (all lessons + quiz pass)
- Go to "My Certificates"
- Verify: Certificate issued
- Test download: Click download
- Test share: Click share button
- Test verify: Use verify button to verify certificate

## Performance Testing

### Load Testing

**Test P1: Multiple Users Simultaneously**

- Simulate 10 concurrent users
- Expected: System responds in < 2 seconds
- Verify: No errors

**Test P2: Large Course**

- Create course with 20+ modules and 100+ lessons
- Expected: Load time < 3 seconds

**Test P3: Bulk Student Creation**

- Create 100 student accounts
- Expected: Completes in < 30 seconds

## Security Testing

**Test SEC1: Unauthorized Access**

- Try accessing admin endpoint without token
- Expected: 401 Unauthorized
- Try accessing with invalid token
- Expected: 401 Unauthorized

**Test SEC2: Cross-Origin Requests**

- Try API call from unauthorized domain
- Expected: CORS error or rejection

**Test SEC3: Blocked User Access**

- Block a user
- Try logging in with blocked user
- Expected: Login fails with message

**Test SEC4: Permission-Based Access**

- Create student without admin permission
- Try accessing admin endpoints
- Expected: 403 Forbidden

## Edge Cases

**Test E1: Empty Course**

- Create course with no modules/lessons
- Try to enroll
- Verify: Can enroll but see empty course

**Test E2: Delete Module with Lessons**

- Add module with lessons
- Delete module
- Verify: All associated lessons deleted

**Test E3: Quiz with No Questions**

- Create quiz with 0 questions
- Try to submit
- Verify: Appropriate error

**Test E4: Certificate Name with Special Characters**

- Issue certificate to user with special characters in name
- Download certificate
- Verify: Name displays correctly

## Regression Testing Checklist

- [ ] Login functionality works
- [ ] User registration works
- [ ] Block/unblock works
- [ ] Course creation works
- [ ] Module/lesson creation works
- [ ] Course publishing works
- [ ] Student enrollment works
- [ ] Progress tracking works
- [ ] Quiz submission works
- [ ] Certificate issuance works
- [ ] Certificate download works
- [ ] Permission management works
- [ ] Audit logging works
- [ ] Search/filter works
- [ ] Pagination works
- [ ] Error messages display correctly
- [ ] No console errors
- [ ] No network errors
- [ ] UI responsive on mobile
- [ ] All CRUD operations work

## Test Report Template

```markdown
# Test Report - [Date]

## Summary

- Total Tests:
- Passed:
- Failed:
- Blocked:

## Failures

List any failures with:

- Test case
- Expected result
- Actual result
- Steps to reproduce
- Severity (Critical/High/Medium/Low)

## Recommendations

- Performance improvements needed
- Security enhancements
- UI/UX improvements
- Bug fixes required

## Sign-off

- Tested by:
- Date:
- Status: Ready for Production / Needs Fixes
```

---

**Complete Testing Guide Ready** ✅
