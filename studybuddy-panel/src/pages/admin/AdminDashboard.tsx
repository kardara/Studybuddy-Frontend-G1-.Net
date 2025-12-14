import { useEffect, useState } from "react";
import {
    Users,
    BookOpen,
    TrendingUp,
    Award,
    Activity,
    BarChart3,
    Calendar,
    Clock,
    Target,
    CheckCircle,
    AlertCircle,
    DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api.config";

interface DashboardStats {
    totalUsers: number;
    totalStudents: number;
    totalAdmins: number;
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    totalQuizzes: number;
    totalCertificates: number;
    recentActivity: ActivityItem[];
}

interface ActivityItem {
    id: string;
    type: "enrollment" | "course_created" | "quiz_completed" | "certificate_issued";
    message: string;
    timestamp: string;
    user?: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalStudents: 0,
        totalAdmins: 0,
        totalCourses: 0,
        publishedCourses: 0,
        totalEnrollments: 0,
        totalQuizzes: 0,
        totalCertificates: 0,
        recentActivity: [],
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);

            // Fetch analytics data
            const analyticsResponse = await apiClient.get("analytics/dashboard");
            const analyticsData = analyticsResponse.data;
            setStats(prevStats => ({
                ...prevStats,
                totalUsers: analyticsData.totalUsers || 0,
                totalStudents: analyticsData.totalStudents || 0,
                totalAdmins: analyticsData.totalAdmins || 0,
                totalCourses: analyticsData.totalCourses || 0,
                publishedCourses: analyticsData.publishedCourses || 0,
                totalEnrollments: analyticsData.totalEnrollments || 0,
                totalQuizzes: analyticsData.totalQuizzes || 0,
                totalCertificates: analyticsData.totalCertificates || 0,
            }));

            // Fetch recent activity (mock data for now)
            const mockActivity: ActivityItem[] = [
                {
                    id: "1",
                    type: "enrollment",
                    message: "John Doe enrolled in Advanced React Course",
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    user: "John Doe",
                },
                {
                    id: "2",
                    type: "course_created",
                    message: "New course 'Machine Learning Basics' was created",
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                },
                {
                    id: "3",
                    type: "certificate_issued",
                    message: "Certificate issued to Jane Smith for Python Programming",
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
                    user: "Jane Smith",
                },
                {
                    id: "4",
                    type: "quiz_completed",
                    message: "Mike Johnson completed Database Design quiz with 95%",
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                    user: "Mike Johnson",
                },
            ];

            setStats(prevStats => ({
                ...prevStats,
                recentActivity: mockActivity,
            }));

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load dashboard statistics",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "enrollment":
                return <Users className="w-4 h-4 text-blue-500" />;
            case "course_created":
                return <BookOpen className="w-4 h-4 text-green-500" />;
            case "certificate_issued":
                return <Award className="w-4 h-4 text-yellow-500" />;
            case "quiz_completed":
                return <Target className="w-4 h-4 text-purple-500" />;
            default:
                return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of your learning platform
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-outline">
                        <BarChart3 className="w-4 h-4" />
                        View Reports
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +12% from last month
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Active Courses</p>
                            <p className="text-3xl font-bold mt-1">{stats.publishedCourses}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                of {stats.totalCourses} total courses
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Enrollments</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalEnrollments}</p>
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +8% from last month
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Certificates Issued</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalCertificates}</p>
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                +15% from last month
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="dashboard-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Manage Students</p>
                                <p className="text-xs text-muted-foreground">View and manage student accounts</p>
                            </div>
                        </button>

                        <button className="w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <BookOpen className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Create Course</p>
                                <p className="text-xs text-muted-foreground">Add a new course to the platform</p>
                            </div>
                        </button>

                        <button className="w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Target className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Create Quiz</p>
                                <p className="text-xs text-muted-foreground">Design a new quiz for students</p>
                            </div>
                        </button>

                        <button className="w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <BarChart3 className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">View Analytics</p>
                                <p className="text-xs text-muted-foreground">Check platform performance</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 dashboard-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Recent Activity</h3>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {stats.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                                <div className="p-2 bg-muted rounded-lg">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">{activity.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatTimeAgo(activity.timestamp)}
                                        {activity.user && ` • ${activity.user}`}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {stats.recentActivity.length === 0 && (
                            <div className="text-center py-8">
                                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="dashboard-card p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="font-medium text-sm text-green-800">Database</p>
                            <p className="text-xs text-green-600">All systems operational</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="font-medium text-sm text-green-800">API Services</p>
                            <p className="text-xs text-green-600">All endpoints responding</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <div>
                            <p className="font-medium text-sm text-yellow-800">Email Service</p>
                            <p className="text-xs text-yellow-600">Check configuration</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}