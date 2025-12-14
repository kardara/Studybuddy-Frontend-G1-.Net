# Swagger Testing Guide - StudyBuddy API

## 🔐 **HOW TO GET AUTHORIZED IN SWAGGER**

### Step 1: Register an Admin User

1. **Navigate to** `POST /api/v1/auth/register`
2. **Click "Try it out"**
3. **Enter this JSON:**

```json
{
  "email": "admin@studybuddy.com",
  "password": "Admin123!",
  "firstName": "Admin",
  "lastName": "User",
  "role": "Admin"
}
```

4. **Click "Execute"**

### Step 2: Login to Get JWT Token

1. **Navigate to** `POST /api/v1/auth/login`
2. **Click "Try it out"**
3. **Enter this JSON:**

```json
{
  "email": "admin@studybuddy.com",
  "password": "Admin123!"
}
```

4. **Click "Execute"**
5. **Copy the "token" value** from the response (you'll need this)

### Step 3: Authorize in Swagger

1. **Click the "Authorize" button** at the top of Swagger (🔒 icon)
2. **In the "Value" field, enter:**
   ```
   Bearer YOUR_TOKEN_HERE
   ```
   (Replace `YOUR_TOKEN_HERE` with the actual token from Step 2)
3. **Click "Authorize"**
4. **Click "Close"**

### Step 4: Test Course Content Generation

Now you should be able to:

1. **Navigate to** `POST /api/v1/courses/generate-from-pdf`
2. **Click "Try it out"**
3. **Upload your document**
4. **Click "Execute"** - Should work now!

---

## 🎯 **QUICK TEST USERS**

### Admin User (Full Access)

```json
{
  "email": "admin@test.com",
  "password": "Admin123!",
  "firstName": "Admin",
  "lastName": "Test",
  "role": "Admin"
}
```

### Student User (Limited Access)

```json
{
  "email": "student@test.com",
  "password": "Student123!",
  "firstName": "Student",
  "lastName": "Test",
  "role": "Student"
}
```

---

## 🔍 **TROUBLESHOOTING**

### "Unauthorized" Error Solutions:

1. **Check token format:**

   - Must start with `Bearer ` (with space)
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

2. **Token expired?**

   - JWT tokens expire after 60 minutes (configurable)
   - Simply login again to get a new token

3. **Wrong user role?**

   - Make sure you registered as "Admin" for course management
   - Students can't upload/create courses

4. **Clear authorization:**
   - Click "Authorize" again
   - Click "Logout" to clear
   - Re-enter your token

---

## 📋 **COMMON TEST SCENARIOS**

### Test Admin Functions:

1. **Register Admin** → **Login** → **Authorize**
2. **Create Course:** `POST /api/v1/courses`
3. **Generate Content:** `POST /api/v1/courses/generate-from-pdf`
4. **View Analytics:** `GET /api/v1/analytics/dashboard`
5. **Manage Users:** `GET /api/v1/admin/users`

### Test Student Functions:

1. **Register Student** → **Login** → **Authorize**
2. **View Courses:** `GET /api/v1/courses`
3. **Enroll in Course:** `POST /api/v1/student/courses/{id}/enroll`
4. **Take Quiz:** `POST /api/v1/quizzes/{id}/start`
5. **Chat with AI:** `POST /api/v1/chat/sessions`

---

## 🚨 **IMPORTANT NOTES**

- **Always login first** before testing protected endpoints
- **Use Admin role** for testing course management features
- **JWT tokens expire** - re-login if you get unauthorized errors
- **Check your email/password** are correct in login requests
- **Course creation requires Admin role** - students can't create courses

---

## 🎮 **QUICK START TEST SEQUENCE**

1. **Register Admin:** `POST /api/v1/auth/register`
2. **Login Admin:** `POST /api/v1/auth/login` → Copy token
3. **Authorize Swagger:** `Bearer {copied_token}`
4. **Test Course Upload:** `POST /api/v1/courses/generate-from-pdf`
5. **Success!** 🎉

That's it! You should now be able to test all endpoints without authorization issues.
