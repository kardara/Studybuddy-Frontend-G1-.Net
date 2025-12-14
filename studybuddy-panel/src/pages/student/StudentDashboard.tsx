import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  ArrowRight,
  Target,
  Flame,
  Star,
  Calendar,
  BarChart3,
  CheckCircle,
  Trophy,
  Zap,
  Download,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { QuizCard } from "@/components/dashboard/QuizCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { authService } from "@/services/api/auth.service";
import { enrollmentsService } from "@/services/api/enrollments.service";
import { certificatesService } from "@/services/api/certificates.service";
import { progressService } from "@/services/api/progress.service";
import { EnrollmentResponse, CertificateDto, User } from "@/lib/types";
import { DetailedProgressResponse } from "@/lib/types-enhanced";

interface DashboardStats {
  totalEnrolledCourses: number;
  completedCourses: number;
  totalLessonsCompleted: number;
  totalTimeSpent: number; // in minutes
  currentStreak: number;
  certificatesEarned: number;
  averageQuizScore: number;
  totalQuizzesTaken: number;
}

interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  isEarned: boolean;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [detailedProgress, setDetailedProgress] = useState<DetailedProgressResponse[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEnrolledCourses: 0,
    completedCourses: 0,
    totalLessonsCompleted: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    certificatesEarned: 0,
    averageQuizScore: 0,
    totalQuizzesTaken: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);

      // Fetch enrollments (required)
      let enrollmentsData = [];
      try {
        enrollmentsData = await enrollmentsService.getMyCourses();
        setEnrollments(enrollmentsData);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        setEnrollments([]);
      }

      // Fetch certificates (required)
      let certificatesData = [];
      try {
        certificatesData = await certificatesService.getMyCertificates();
        setCertificates(certificatesData);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setCertificates([]);
      }
      // Fetch progress (optional - may not have all fields)
      let progressData = [];
      try {
        progressData = await progressService.getMyProgress();
        setDetailedProgress(progressData);
      } catch (error) {
        console.error('Error fetching progress:', error);
        setDetailedProgress([]);
      }

      // Fetch achievements (optional)
      const achievementsData = [];
      try {
        // Note: Replace this with your actual achievements service method
        // achievementsData = await achievementsService.getMyAchievements();
        setAchievements(achievementsData);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setAchievements([]);
      }
      // They will fail and cause the dashboard to fail

      // Calculate stats from available data
      const completedCourses = enrollmentsData.filter(
        (e) => e.progressPercentage === 100
      ).length;

      const totalLessonsCompleted = progressData.reduce(
        (sum: number, p: DetailedProgressResponse) => sum + (p.completedLessons || 0),
        0
      );

      const totalTimeSpent = progressData.reduce(
        (sum: number, p: DetailedProgressResponse) => sum + (p.timeSpent || 0),
        0
      );

      const currentStreak = progressData.length > 0
        ? Math.max(...progressData.map((p: DetailedProgressResponse) => p.streak || 0))
        : 0;

      const averageQuizScore = progressData.length > 0
        ? Math.round(
          progressData.reduce((sum: number, p: DetailedProgressResponse) => sum + (p.averageQuizScore || 0), 0) /
          progressData.length
        )
        : 0;

      setStats({
        totalEnrolledCourses: enrollmentsData.length,
        completedCourses,
        totalLessonsCompleted,
        totalTimeSpent,
        currentStreak,
        certificatesEarned: certificatesData.length,
        averageQuizScore,
        totalQuizzesTaken: progressData.reduce((sum: number, p: DetailedProgressResponse) => sum + (p.totalQuizzesTaken || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSpent = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return "text-success";
    if (progress >= 50) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Continue your learning journey and achieve your goals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/student/progress" className="btn-outline">
            <BarChart3 className="w-4 h-4" />
            View Progress
          </Link>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Enrolled Courses"
            value={stats.totalEnrolledCourses}
            change={`${stats.completedCourses} completed`}
            changeType={stats.completedCourses > 0 ? "positive" : "neutral"}
            icon={BookOpen}
          />
          <StatCard
            title="Hours Learned"
            value={formatTimeSpent(stats.totalTimeSpent)}
            change={`${stats.currentStreak} day streak`}
            changeType={stats.currentStreak > 0 ? "positive" : "neutral"}
            icon={Clock}
            iconColor="bg-success/10 text-success"
          />
          <StatCard
            title="Quizzes Completed"
            value={stats.totalQuizzesTaken}
            change={`${stats.averageQuizScore}% avg score`}
            changeType={stats.averageQuizScore >= 70 ? "positive" : stats.averageQuizScore >= 50 ? "neutral" : "negative"}
            icon={Target}
            iconColor="bg-warning/10 text-warning"
          />
          <StatCard
            title="Certificates Earned"
            value={stats.certificatesEarned}
            change="Ready to showcase"
            changeType="positive"
            icon={Award}
            iconColor="bg-chart-4/20 text-chart-4"
          />
        </div>

        {/* Continue Learning Section */}
        <div className="dashboard-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title mb-0">Continue Learning</h2>
            <Link to="/student/continue" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Course */}
            <div className="lg:col-span-2">
              {detailedProgress.length > 0 ? (
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-start justify-between mb-4">
                    <span className="badge badge-primary">Currently Learning</span>
                    <span className="text-sm text-muted-foreground">
                      {detailedProgress[0].progressPercentage}% complete
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{detailedProgress[0].courseTitle}</h3>
                  <p className="text-muted-foreground mb-4">
                    {detailedProgress[0].completedLessons} of {detailedProgress[0].totalLessons} lessons completed
                  </p>
                  <ProgressBar
                    value={detailedProgress[0].progressPercentage}
                    className="mb-4"
                    showLabel={false}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTimeSpent(detailedProgress[0].timeSpent || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {detailedProgress[0].streak} day streak
                      </span>
                    </div>
                    <Link
                      to={`/student/courses/${detailedProgress[0].courseId}`}
                      className="btn-primary"
                    >
                      <Play className="w-4 h-4" />
                      Continue Course
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-br from-muted/10 to-muted/5 rounded-xl border border-muted/20 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Courses Yet</h3>
                  <p className="text-muted-foreground mb-4">Enroll in a course to start learning</p>
                  <Link to="/student/courses" className="btn-primary">
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <div className="lg:col-span-2 dashboard-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title mb-0">My Courses</h2>
              <Link to="/student/courses" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {detailedProgress.slice(0, 5).map((progress) => (
                <div key={progress.courseId} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{progress.courseTitle}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {progress.completedLessons}/{progress.totalLessons} lessons
                      </span>
                      <ProgressBar
                        value={progress.progressPercentage}
                        className="flex-1 max-w-32"
                        size="sm"
                        showLabel={false}
                      />
                      <span className={`text-xs font-medium ${getProgressColor(progress.progressPercentage)}`}>
                        {progress.progressPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeSpent(progress.timeSpent || 0)}
                    </div>
                    <Link
                      to={`/student/courses/${progress.courseId}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <div className="dashboard-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title mb-0">Recent Achievements</h3>
                <Trophy className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                {achievements.filter(a => a.isEarned).slice(0, 3).map((achievement) => (
                  <div key={achievement.achievementId} className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Star className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                ))}
                {achievements.filter(a => a.isEarned).length === 0 && (
                  <div className="text-center py-4">
                    <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Complete lessons to earn achievements</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card p-6">
              <h3 className="section-title mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/student/certificates" className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="p-2 bg-chart-4/10 rounded-lg">
                    <Download className="w-4 h-4 text-chart-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">My Certificates</h4>
                    <p className="text-xs text-muted-foreground">Download or share certificates</p>
                  </div>
                </Link>
                <Link to="/student/progress" className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">View Progress</h4>
                    <p className="text-xs text-muted-foreground">Detailed analytics & goals</p>
                  </div>
                </Link>
                <Link to="/student/quizzes" className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Take Quizzes</h4>
                    <p className="text-xs text-muted-foreground">Test your knowledge</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Preview */}
        <div className="dashboard-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">StudyBuddy AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Get instant help with your learning</p>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground italic">
              "Hi {user?.fullName?.split(' ')[0] || 'there'}! Ready to continue your learning journey?"
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/student/chat" className="btn-outline flex-1">
              <MessageSquare className="w-4 h-4" />
              Start Conversation
            </Link>
            <Link to="/student/chat?topic=help" className="btn-primary flex-1">
              <Zap className="w-4 h-4" />
              Quick Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}