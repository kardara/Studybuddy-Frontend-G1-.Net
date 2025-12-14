import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StudentLayout } from "@/components/layout/StudentLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminCourses from "./pages/admin/AdminCourses";
import CourseContentManager from "./pages/admin/CourseContentManager";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import CourseDetail from "./pages/student/CourseDetail";
import StudentCourseLearning from "./pages/student/StudentCourseLearning";
import StudentQuiz from "./pages/student/StudentQuiz";
import StudentProgress from "./pages/student/StudentProgress";
import StudentQuizzes from "./pages/student/StudentQuizzes";
import StudentCertificates from "./pages/student/StudentCertificates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminCourses />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="course-content" element={<CourseContentManager />} />
              <Route path="quizzes" element={<AdminQuizzes />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="certificates" element={<AdminCertificates />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Student Routes - Protected */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="courses/:courseId" element={<CourseDetail />} />
              <Route path="learn/:courseId" element={<StudentCourseLearning />} />
              <Route path="quiz/:quizId" element={<StudentQuiz />} />
              <Route path="progress" element={<StudentProgress />} />
              <Route path="quizzes" element={<StudentQuizzes />} />
              <Route path="certificates" element={<StudentCertificates />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
