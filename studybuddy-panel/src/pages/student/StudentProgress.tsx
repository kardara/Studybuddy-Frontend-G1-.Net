import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    TrendingUp,
    Clock,
    Target,
    Award,
    Calendar,
    BookOpen,
    CheckCircle,
    Play,
    BarChart3,
    PieChart,
    Flame,
    Trophy,
    Star,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { progressService } from "@/services/api/progress.service";
import { enrollmentsService } from "@/services/api/enrollments.service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WeeklyProgress {
    date: string;
    lessonsCompleted: number;
    timeSpent: number; // in minutes
    coursesActive: number;
}

interface CourseProgress {
    courseId: number;
    courseTitle: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    timeSpent: number; // in minutes
    lastAccessed: string;
    category: string;
}

export default function StudentProgress() {
    const [timeRange, setTimeRange] = useState("7days");
    const [selectedMetric, setSelectedMetric] = useState("lessons");
    const { toast } = useToast();

    // Fetch progress data
    const { data: progressData, isLoading: progressLoading } = useQuery({
        queryKey: ['my-progress'],
        queryFn: () => progressService.getMyProgress(),
    });

    const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
        queryKey: ['my-courses'],
        queryFn: () => enrollmentsService.getMyCourses(),
    });

    const isLoading = progressLoading || enrollmentsLoading;

    // Calculate statistics
    const stats = {
        totalCourses: enrollments?.length || 0,
        completedCourses: progressData?.filter(p => p.progressPercentage === 100).length || 0,
        inProgressCourses: progressData?.filter(p => p.progressPercentage > 0 && p.progressPercentage < 100).length || 0,
        totalLessonsCompleted: progressData?.reduce((sum, p) => sum + p.completedLessons, 0) || 0,
        totalLessons: progressData?.reduce((sum, p) => sum + p.totalLessons, 0) || 0,
        averageProgress: progressData && progressData.length > 0
            ? Math.round(progressData.reduce((sum, p) => sum + p.progressPercentage, 0) / progressData.length)
            : 0,
        totalTimeSpent: 0, // Will be calculated from actual data
        currentStreak: 0, // Will be calculated from actual data
    };

    // Generate mock weekly data (in real app, this would come from API)
    const weeklyData: WeeklyProgress[] = [
        { date: "Mon", lessonsCompleted: 3, timeSpent: 45, coursesActive: 2 },
        { date: "Tue", lessonsCompleted: 5, timeSpent: 75, coursesActive: 3 },
        { date: "Wed", lessonsCompleted: 2, timeSpent: 30, coursesActive: 1 },
        { date: "Thu", lessonsCompleted: 4, timeSpent: 60, coursesActive: 2 },
        { date: "Fri", lessonsCompleted: 6, timeSpent: 90, coursesActive: 3 },
        { date: "Sat", lessonsCompleted: 8, timeSpent: 120, coursesActive: 4 },
        { date: "Sun", lessonsCompleted: 3, timeSpent: 45, coursesActive: 2 },
    ];

    // Course progress data
    const courseProgress: CourseProgress[] = progressData?.map(p => ({
        courseId: p.courseId,
        courseTitle: p.courseTitle,
        progress: p.progressPercentage,
        completedLessons: p.completedLessons,
        totalLessons: p.totalLessons,
        timeSpent: Math.floor(Math.random() * 300) + 60, // Mock data
        lastAccessed: p.lastAccessedAt || new Date().toISOString(),
        category: enrollments?.find(e => e.courseId === p.courseId)?.course?.category || "General",
    })) || [];

    // Achievement data
    const achievements = [
        { id: 1, title: "First Steps", description: "Complete your first lesson", earned: true, icon: Play },
        { id: 2, title: "Quick Learner", description: "Complete 5 lessons in a day", earned: true, icon: Clock },
        { id: 3, title: "Dedicated Student", description: "Study for 7 days in a row", earned: true, icon: Flame },
        { id: 4, title: "Course Master", description: "Complete your first course", earned: false, icon: Trophy },
        { id: 5, title: "Knowledge Seeker", description: "Complete 50 lessons total", earned: false, icon: Star },
        { id: 6, title: "Perfect Score", description: "Score 100% on a quiz", earned: false, icon: Award },
    ];

    // Chart colors
    const chartColors = {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        destructive: "hsl(var(--destructive))",
        muted: "hsl(var(--muted))",
    };

    const COLORS = [chartColors.primary, chartColors.success, chartColors.warning, chartColors.destructive, chartColors.secondary];

    if (isLoading) {
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
                    <h1 className="page-title">Learning Progress</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your learning journey and achievements
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="90days">Last 3 months</option>
                        <option value="year">This year</option>
                    </select>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="dashboard-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-semibold">{stats.totalCourses}</p>
                                <span className="text-sm text-success flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3" />
                                    12%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Lessons Completed</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-semibold">{stats.totalLessonsCompleted}</p>
                                <span className="text-sm text-success flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3" />
                                    8%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Average Progress</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-semibold">{stats.averageProgress}%</p>
                                <span className="text-sm text-success flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3" />
                                    5%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-chart-4/20 rounded-lg">
                            <Flame className="w-5 h-5 text-chart-4" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Current Streak</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-semibold">7 days</p>
                                <span className="text-sm text-chart-4 flex items-center gap-1">
                                    <Flame className="w-3 h-3" />
                                    Hot!
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Learning Activity Chart */}
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Learning Activity</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedMetric("lessons")}
                                className={cn(
                                    "px-3 py-1 rounded text-sm transition-colors",
                                    selectedMetric === "lessons"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                Lessons
                            </button>
                            <button
                                onClick={() => setSelectedMetric("time")}
                                className={cn(
                                    "px-3 py-1 rounded text-sm transition-colors",
                                    selectedMetric === "time"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                Time
                            </button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey={selectedMetric === "lessons" ? "lessonsCompleted" : "timeSpent"}
                                stroke={chartColors.primary}
                                fill={chartColors.primary}
                                fillOpacity={0.2}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Course Progress Distribution */}
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Course Progress</h3>
                        <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={courseProgress.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="courseTitle"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                            />
                            <Bar dataKey="progress" fill={chartColors.success} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Progress List */}
                <div className="lg:col-span-2 dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Course Progress</h3>
                        <button className="text-sm text-primary hover:underline">
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {courseProgress.slice(0, 5).map((course) => (
                            <div key={course.courseId} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{course.courseTitle}</h4>
                                        <span className="text-sm font-medium">{course.progress}%</span>
                                    </div>
                                    <ProgressBar value={course.progress} showLabel={false} className="mb-2" />
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {Math.floor(course.timeSpent / 60)}h {course.timeSpent % 60}m
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements */}
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Achievements</h3>
                        <Trophy className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                        {achievements.map((achievement) => {
                            const Icon = achievement.icon;
                            return (
                                <div
                                    key={achievement.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                        achievement.earned
                                            ? "bg-success/10 border border-success/20"
                                            : "bg-muted/30"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "p-2 rounded-lg",
                                            achievement.earned
                                                ? "bg-success/10 text-success"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={cn(
                                            "font-medium text-sm",
                                            achievement.earned ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {achievement.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {achievement.description}
                                        </p>
                                    </div>
                                    {achievement.earned && (
                                        <CheckCircle className="w-4 h-4 text-success" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Goals Section */}
            <div className="dashboard-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Learning Goals</h3>
                    <button className="btn-outline text-sm">
                        <Target className="w-4 h-4" />
                        Set New Goal
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-3">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="42"
                                    stroke="hsl(var(--muted))"
                                    strokeWidth="6"
                                    fill="none"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="42"
                                    stroke={chartColors.primary}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${(stats.totalLessonsCompleted / 50) * 264} 264`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold">{stats.totalLessonsCompleted}/50</span>
                            </div>
                        </div>
                        <h4 className="font-medium mb-1">Complete 50 Lessons</h4>
                        <p className="text-sm text-muted-foreground">Monthly Goal</p>
                    </div>

                    <div className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-3">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="42"
                                    stroke="hsl(var(--muted))"
                                    strokeWidth="6"
                                    fill="none"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="42"
                                    stroke={chartColors.success}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${(stats.completedCourses / 5) * 264} 264`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold">{stats.completedCourses}/5</span>
                            </div>
                        </div>
                        <h4 className="font-medium mb-1">Complete 5 Courses</h4>
                        <p className="text-sm text-muted-foreground">Yearly Goal</p>
                    </div>

                    <div className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-3">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="42"
                                    stroke="hsl(var(--muted))"
                                    strokeWidth="6"
                                    fill="none"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="42"
                                    stroke={chartColors.warning}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${(7 / 30) * 264} 264`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold">7/30</span>
                            </div>
                        </div>
                        <h4 className="font-medium mb-1">30-Day Streak</h4>
                        <p className="text-sm text-muted-foreground">Current: 7 days</p>
                    </div>
                </div>
            </div>
        </div>
    );
}