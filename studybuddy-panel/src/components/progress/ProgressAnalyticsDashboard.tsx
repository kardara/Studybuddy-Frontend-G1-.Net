import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Clock,
    Target,
    Award,
    Calendar,
    BookOpen,
    CheckCircle,
    Play,
    Flame,
    Trophy,
    Star,
    ArrowUp,
    ArrowDown,
    Download,
    Filter,
    RefreshCw,
    Bell,
    Zap,
    Brain,
    Activity
} from 'lucide-react';
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
    RadialBarChart,
    RadialBar,
} from "recharts";
import { ProgressBar } from '@/components/dashboard/ProgressBar';
import { progressService } from '@/services/api/progress.service';
import { DetailedProgressResponse, LearningGoal, Achievement, WeeklyProgressData, ProgressAnalytics } from '@/lib/types-enhanced';

interface ProgressAnalyticsDashboardProps {
    studentId?: number;
    courseId?: number;
    showActions?: boolean;
}

export function ProgressAnalyticsDashboard({
    studentId,
    courseId,
    showActions = true
}: ProgressAnalyticsDashboardProps) {
    const [detailedProgress, setDetailedProgress] = useState<DetailedProgressResponse[]>([]);
    const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [weeklyData, setWeeklyData] = useState<WeeklyProgressData[]>([]);
    const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
    const [selectedMetric, setSelectedMetric] = useState('lessons');

    useEffect(() => {
        fetchAnalyticsData();
    }, [studentId, courseId, selectedTimeRange]);

    const fetchAnalyticsData = async () => {
        try {
            const [
                progressData,
                goalsData,
                achievementsData,
                weeklyProgressData,
                analyticsData
            ] = await Promise.all([
                progressService.getDetailedProgress(),
                progressService.getLearningGoals(),
                progressService.getAchievements(),
                progressService.getWeeklyProgress(7),
                progressService.getProgressAnalytics().catch(() => null)
            ]);

            setDetailedProgress(progressData);
            setLearningGoals(goalsData);
            setAchievements(achievementsData);
            setWeeklyData(weeklyProgressData);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAnalyticsData();
    };

    const exportData = async (format: 'pdf' | 'csv' | 'excel') => {
        try {
            const blob = await progressService.exportProgressReport(format);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `progress-report-${new Date().toISOString().split('T')[0]}.${format}`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    const createGoal = async (goal: Omit<LearningGoal, 'goalId' | 'current' | 'isCompleted' | 'createdAt'>) => {
        try {
            await progressService.createLearningGoal(goal);
            fetchAnalyticsData(); // Refresh data
        } catch (error) {
            console.error('Error creating goal:', error);
        }
    };

    // Calculate comprehensive statistics
    const stats = {
        totalCourses: detailedProgress.length,
        completedCourses: detailedProgress.filter(p => p.progressPercentage === 100).length,
        totalLessonsCompleted: detailedProgress.reduce((sum, p) => sum + p.completedLessons, 0),
        totalTimeSpent: detailedProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        averageProgress: detailedProgress.length > 0
            ? Math.round(detailedProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / detailedProgress.length)
            : 0,
        currentStreak: Math.max(...detailedProgress.map(p => p.streak || 0), 0),
        totalCertificates: detailedProgress.reduce((sum, p) => sum + (p.certificatesEarned || 0), 0),
        averageQuizScore: detailedProgress.length > 0
            ? Math.round(detailedProgress.reduce((sum, p) => sum + (p.averageQuizScore || 0), 0) / detailedProgress.length)
            : 0,
        totalQuizzesTaken: detailedProgress.reduce((sum, p) => sum + (p.totalQuizzesTaken || 0), 0)
    };

    const formatTimeSpent = (minutes: number): string => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    // Chart colors
    const chartColors = {
        primary: "hsl(var(--primary))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        destructive: "hsl(var(--destructive))",
        secondary: "hsl(var(--secondary))",
    };

    const COLORS = [chartColors.primary, chartColors.success, chartColors.warning, chartColors.destructive, chartColors.secondary];

    // Course progress data for charts
    const courseProgressData = detailedProgress.map(progress => ({
        name: progress.courseTitle.length > 20 ? progress.courseTitle.substring(0, 20) + '...' : progress.courseTitle,
        progress: progress.progressPercentage,
        completed: progress.completedLessons,
        total: progress.totalLessons,
        timeSpent: progress.timeSpent || 0,
        streak: progress.streak || 0
    }));

    // Achievement data
    const earnedAchievements = achievements.filter(a => a.isEarned);
    const progressAchievements = achievements.filter(a => !a.isEarned);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Progress Analytics</h1>
                    <p className="text-muted-foreground">Comprehensive learning progress and performance insights</p>
                </div>
                {showActions && (
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="input-field w-auto"
                        >
                            <option value="7days">Last 7 days</option>
                            <option value="30days">Last 30 days</option>
                            <option value="90days">Last 3 months</option>
                            <option value="year">This year</option>
                        </select>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="btn-outline"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <div className="relative">
                            <button className="btn-outline">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-32 bg-background border rounded-lg shadow-lg z-10 hidden group-hover:block">
                                <button
                                    onClick={() => exportData('pdf')}
                                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                                >
                                    PDF Report
                                </button>
                                <button
                                    onClick={() => exportData('csv')}
                                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                                >
                                    CSV Data
                                </button>
                                <button
                                    onClick={() => exportData('excel')}
                                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                                >
                                    Excel File
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="dashboard-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Courses Progress</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">{stats.completedCourses}/{stats.totalCourses}</p>
                                <span className="text-sm text-success flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3" />
                                    {stats.totalCourses > 0 ? Math.round((stats.completedCourses / stats.totalCourses) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                            <Clock className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Time Invested</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">{formatTimeSpent(stats.totalTimeSpent)}</p>
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
                        <div className="p-2 bg-warning/10 rounded-lg">
                            <Target className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Quiz Performance</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">{stats.averageQuizScore}%</p>
                                <span className="text-sm text-success flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3" />
                                    {stats.totalQuizzesTaken}
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
                                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                                <span className="text-sm text-chart-4 flex items-center gap-1">
                                    <Flame className="w-3 h-3" />
                                    days
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Learning Activity */}
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Learning Activity</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedMetric("lessons")}
                                className={`px-3 py-1 rounded text-sm transition-colors ${selectedMetric === "lessons"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                Lessons
                            </button>
                            <button
                                onClick={() => setSelectedMetric("time")}
                                className={`px-3 py-1 rounded text-sm transition-colors ${selectedMetric === "time"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
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
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
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
                        <BarChart data={courseProgressData.slice(0, 6)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                        <h3 className="text-lg font-semibold">Course Progress Details</h3>
                        <button className="text-sm text-primary hover:underline">
                            View All Courses
                        </button>
                    </div>
                    <div className="space-y-4">
                        {detailedProgress.slice(0, 5).map((course) => (
                            <div key={course.courseId} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{course.courseTitle}</h4>
                                        <span className="text-sm font-medium">{course.progressPercentage}%</span>
                                    </div>
                                    <ProgressBar value={course.progressPercentage} showLabel={false} className="mb-2" />
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeSpent(course.timeSpent || 0)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Flame className="w-3 h-3" />
                                                {course.streak} days
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements & Goals */}
                <div className="space-y-6">
                    {/* Recent Achievements */}
                    <div className="dashboard-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Recent Achievements</h3>
                            <Trophy className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-3">
                            {earnedAchievements.slice(0, 3).map((achievement) => (
                                <div
                                    key={achievement.achievementId}
                                    className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg"
                                >
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
                            {earnedAchievements.length === 0 && (
                                <div className="text-center py-4">
                                    <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Complete activities to earn achievements</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Learning Goals */}
                    <div className="dashboard-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Learning Goals</h3>
                            <Target className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-4">
                            {learningGoals.slice(0, 3).map((goal) => (
                                <div key={goal.goalId} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm">{goal.title}</h4>
                                        <span className="text-xs text-muted-foreground">
                                            {goal.current}/{goal.target}
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={(goal.current / goal.target) * 100}
                                        size="sm"
                                        showLabel={false}
                                        className={goal.isCompleted ? 'bg-success/20' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">{goal.description}</p>
                                </div>
                            ))}
                            {learningGoals.length === 0 && (
                                <div className="text-center py-4">
                                    <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground mb-2">Set learning goals to stay motivated</p>
                                    <button className="text-sm text-primary hover:underline">
                                        Create Goal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Insights */}
            {analytics && (
                <div className="dashboard-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Brain className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Performance Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary mb-1">
                                {formatTimeSpent(analytics.averageSessionTime)}
                            </div>
                            <p className="text-sm text-muted-foreground">Avg. Session Time</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-success mb-1">
                                {analytics.completionRate}%
                            </div>
                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-warning mb-1">
                                {analytics.learningVelocity}
                            </div>
                            <p className="text-sm text-muted-foreground">Lessons/Week</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-chart-4 mb-1">
                                {analytics.mostActiveTime}
                            </div>
                            <p className="text-sm text-muted-foreground">Most Active Time</p>
                        </div>
                    </div>
                    {analytics.recommendedActions.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <h4 className="font-semibold mb-3">Recommended Actions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {analytics.recommendedActions.map((action, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span className="text-sm">{action}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}