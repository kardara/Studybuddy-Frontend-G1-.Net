import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Play,
  Clock,
  ChevronRight,
  Loader2,
  BookOpen,
  Users,
  Star,
  Filter,
  Grid3X3,
  List,
  Plus,
  CheckCircle,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { enrollmentsService } from "@/services/api/enrollments.service";
import { coursesService } from "@/services/api/courses.service";
import { progressService } from "@/services/api/progress.service";
import { useToast } from "@/hooks/use-toast";
import { CourseListDto } from "@/lib/types";

type ViewMode = "grid" | "list";
type TabType = "my-courses" | "browse";

export default function StudentCourses() {
  const [activeTab, setActiveTab] = useState<TabType>("my-courses");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [enrollingCourses, setEnrollingCourses] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Fetch enrolled courses
  const { data: enrollments, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useQuery({
    queryKey: ['my-courses'],
    queryFn: () => enrollmentsService.getMyCourses(),
  });

  // Fetch available courses for browsing
  const { data: availableCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => coursesService.getPublishedCourses(),
  });

  // Featured courses - temporarily disabled until endpoint is implemented
  const featuredCourses: CourseListDto[] = [];

  // Fetch progress for all courses
  const { data: progressData, refetch: refetchProgress } = useQuery({
    queryKey: ['my-progress'],
    queryFn: () => progressService.getMyProgress(),
  });

  // Get enrolled course IDs for quick lookup
  const enrolledCourseIds = new Set(enrollments?.map(e => e.courseId) || []);

  const getProgressForCourse = (courseId: number) => {
    const progress = progressData?.find((p) => p.courseId === courseId);
    return progress?.progressPercentage || 0;
  };

  const handleEnroll = async (courseId: number) => {
    setEnrollingCourses(prev => new Set(prev).add(courseId));
    try {
      await enrollmentsService.enroll(courseId);
      toast({
        title: "Success",
        description: "Successfully enrolled in the course!",
      });
      // Refetch data
      refetchEnrollments();
      refetchProgress();
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: "Failed to enroll in the course. Please try again.",
      });
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const handleUnenroll = async (courseId: number) => {
    try {
      await enrollmentsService.unenroll(courseId);
      toast({
        title: "Success",
        description: "Successfully unenrolled from the course.",
      });
      refetchEnrollments();
      refetchProgress();
    } catch (error) {
      console.error("Error unenrolling:", error);
      toast({
        variant: "destructive",
        title: "Unenrollment failed",
        description: "Failed to unenroll from the course. Please try again.",
      });
    }
  };

  // Filter enrolled courses
  const filteredEnrollments = enrollments?.filter((enrollment) => {
    const course = enrollment.course;
    if (!course) return false;

    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Filter available courses
  const filteredAvailableCourses = availableCourses?.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || course.category === filterCategory;
    const matchesLevel = filterLevel === "all" || course.level === filterLevel;
    const notEnrolled = !enrolledCourseIds.has(course.courseId);
    return matchesSearch && matchesCategory && matchesLevel && notEnrolled;
  }) || [];

  // Get unique categories and levels
  const categories = [...new Set(availableCourses?.map(c => c.category).filter(Boolean))] as string[];
  const levels = [...new Set(availableCourses?.map(c => c.level))] as string[];

  const getStatusLabel = (progress: number) => {
    if (progress === 100) return { text: "Completed", class: "badge-success" };
    if (progress > 0) return { text: "In Progress", class: "badge-primary" };
    return { text: "Not Started", class: "badge-muted" };
  };

  const renderCourseCard = (course: CourseListDto, showProgress = false) => {
    const progress = showProgress ? getProgressForCourse(course.courseId) : 0;
    const isEnrolled = enrolledCourseIds.has(course.courseId);
    const isEnrolling = enrollingCourses.has(course.courseId);

    return (
      <div key={course.courseId} className="dashboard-card p-6 hover:shadow-card-hover transition-all duration-200">
        <div className="flex flex-col h-full">
          {/* Course Thumbnail */}
          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <BookOpen className="w-12 h-12 text-primary/50" />
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {course.category && (
                <span className="badge badge-primary text-xs">{course.category}</span>
              )}
              <span className="badge badge-secondary text-xs capitalize">{course.level}</span>
              {featuredCourses?.some(fc => fc.courseId === course.courseId) && (
                <span className="badge badge-warning text-xs flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>

            {course.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {course.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.estimatedDurationHours ? `${course.estimatedDurationHours}h` : 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.enrollmentCount.toLocaleString()}
              </span>
            </div>

            {/* Progress Bar (for enrolled courses) */}
            {showProgress && isEnrolled && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
                <ProgressBar value={progress} showLabel={false} />
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-auto">
            {isEnrolled ? (
              <div className="space-y-2">
                <Link
                  to={`/student/courses/${course.courseId}`}
                  className="btn-primary w-full"
                >
                  {progress === 0 ? (
                    <>
                      <Play className="w-4 h-4" />
                      Start Course
                    </>
                  ) : progress === 100 ? (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      Review Course
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Continue Learning
                    </>
                  )}
                </Link>
                <button
                  onClick={() => handleUnenroll(course.courseId)}
                  className="btn-outline w-full text-sm"
                >
                  Unenroll
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleEnroll(course.courseId)}
                disabled={isEnrolling}
                className="btn-primary w-full"
              >
                {isEnrolling ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enrolling...
                  </div>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Enroll Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCourseListItem = (course: CourseListDto, showProgress = false) => {
    const progress = showProgress ? getProgressForCourse(course.courseId) : 0;
    const isEnrolled = enrolledCourseIds.has(course.courseId);
    const isEnrolling = enrollingCourses.has(course.courseId);
    const status = getStatusLabel(progress);

    return (
      <div key={course.courseId} className="dashboard-card p-6 hover:shadow-card-hover transition-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Course Thumbnail */}
          <div className="w-full lg:w-48 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <BookOpen className="w-12 h-12 text-primary/50" />
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {course.category && (
                <span className="badge badge-primary">{course.category}</span>
              )}
              <span className="badge badge-secondary capitalize">{course.level}</span>
              {showProgress && <span className={`badge ${status.class}`}>{status.text}</span>}
            </div>
            <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
            {course.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {course.description}
              </p>
            )}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.estimatedDurationHours ? `${course.estimatedDurationHours}h` : 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.enrollmentCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Progress & Action */}
          <div className="w-full lg:w-64">
            {showProgress && isEnrolled && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
                <ProgressBar value={progress} showLabel={false} />
              </div>
            )}

            <div className="space-y-2">
              {isEnrolled ? (
                <>
                  <Link
                    to={`/student/courses/${course.courseId}`}
                    className="btn-primary w-full"
                  >
                    {progress === 0 ? (
                      <>
                        <Play className="w-4 h-4" />
                        Start Course
                      </>
                    ) : progress === 100 ? (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        Review Course
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Continue
                      </>
                    )}
                  </Link>
                  <button
                    onClick={() => handleUnenroll(course.courseId)}
                    className="btn-outline w-full text-sm"
                  >
                    Unenroll
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleEnroll(course.courseId)}
                  disabled={isEnrolling}
                  className="btn-primary w-full"
                >
                  {isEnrolling ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enrolling...
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Enroll Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isLoading = enrollmentsLoading || coursesLoading;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="text-muted-foreground mt-1">
            {activeTab === "my-courses"
              ? "Track your enrolled courses and progress"
              : "Discover and enroll in new courses"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground"
              }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "list"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground"
              }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab("my-courses")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "my-courses"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          My Courses ({enrollments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "browse"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Browse Courses
        </button>
      </div>

      {/* Search & Filter */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "my-courses" ? "your courses" : "available courses"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {activeTab === "browse" && (
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            )}
            <button className="btn-outline">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats (only for My Courses tab) */}
      {activeTab === "my-courses" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Enrolled</p>
            <p className="text-3xl font-semibold mt-1">{enrollments?.length || 0}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-3xl font-semibold mt-1">
              {progressData?.filter((p) => p.progressPercentage > 0 && p.progressPercentage < 100).length || 0}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-3xl font-semibold mt-1">
              {progressData?.filter((p) => p.progressPercentage === 100).length || 0}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* My Courses Tab */}
          {activeTab === "my-courses" && (
            <>
              {filteredEnrollments.length === 0 ? (
                <div className="dashboard-card p-12 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm || filterCategory !== "all"
                      ? "No courses found"
                      : "No enrolled courses yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || filterCategory !== "all"
                      ? "Try adjusting your search terms or filters."
                      : "Browse our course catalog to find courses that interest you."}
                  </p>
                  {(!searchTerm && filterCategory === "all") && (
                    <button
                      onClick={() => setActiveTab("browse")}
                      className="btn-primary"
                    >
                      Browse Courses
                    </button>
                  )}
                </div>
              ) : (
                <div className={viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
                }>
                  {filteredEnrollments.map((enrollment) => {
                    const course = enrollment.course;
                    if (!course) return null;
                    return viewMode === "grid"
                      ? renderCourseCard(course, true)
                      : renderCourseListItem(course, true);
                  })}
                </div>
              )}
            </>
          )}

          {/* Browse Courses Tab */}
          {activeTab === "browse" && (
            <>
              {/* Featured Courses */}
              {featuredCourses && featuredCourses.length > 0 && !searchTerm && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Featured Courses
                  </h2>
                  <div className={viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    : "space-y-4"
                  }>
                    {featuredCourses.slice(0, 4).map((course) =>
                      viewMode === "grid"
                        ? renderCourseCard(course)
                        : renderCourseListItem(course)
                    )}
                  </div>
                </div>
              )}

              {/* Available Courses */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {featuredCourses && featuredCourses.length > 0 && !searchTerm ? "All Available Courses" : "Available Courses"}
                </h2>
                {filteredAvailableCourses.length === 0 ? (
                  <div className="dashboard-card p-12 text-center">
                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || filterCategory !== "all" || filterLevel !== "all"
                        ? "Try adjusting your search terms or filters."
                        : "No courses are currently available for enrollment."}
                    </p>
                  </div>
                ) : (
                  <div className={viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                  }>
                    {filteredAvailableCourses.map((course) =>
                      viewMode === "grid"
                        ? renderCourseCard(course)
                        : renderCourseListItem(course)
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
