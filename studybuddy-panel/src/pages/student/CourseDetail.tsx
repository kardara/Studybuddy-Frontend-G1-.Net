import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    BookOpen,
    CheckCircle,
    Circle,
    Clock,
    Users,
    Star,
    ArrowLeft,
    Menu,
    X,
    ChevronRight,
    Download,
    Share2,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { coursesService } from "@/services/api/courses.service";
import { progressService } from "@/services/api/progress.service";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { CourseDetailDto, ProgressResponse } from "@/lib/types";

export default function CourseDetail() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    // Fetch course details
    const { data: course, isLoading: courseLoading } = useQuery({
        queryKey: ['course-detail', courseId],
        queryFn: () => coursesService.getCourseById(parseInt(courseId!)),
        enabled: !!courseId,
    });

    // Fetch progress
    const { data: progressData } = useQuery({
        queryKey: ['course-progress', courseId],
        queryFn: () => progressService.getCourseProgress(parseInt(courseId!)),
        enabled: !!courseId,
    });

    // Mark lesson complete mutation
    const markCompleteMutation = useMutation({
      mutationFn: ({ lessonId, isCompleted }: { lessonId: number; isCompleted: boolean }) =>
        progressService.updateProgress(lessonId, isCompleted),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['course-progress'] });
        queryClient.invalidateQueries({ queryKey: ['my-progress'] });
      },
      onError: (error) => {
        console.error("Error updating lesson progress:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update lesson progress",
        });
      },
    });

    useEffect(() => {
        if (course && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
            const firstLesson = course.modules[0].lessons[0];
            setCurrentLessonId(firstLesson.lessonId);
        }
    }, [course]);

    const handleLessonComplete = (lessonId: number, isCompleted: boolean) => {
        markCompleteMutation.mutate({ lessonId, isCompleted });
    };

    const getCurrentLesson = () => {
        if (!course || !currentLessonId) return null;

        for (const module of course.modules) {
            const lesson = module.lessons.find(l => l.lessonId === currentLessonId);
            if (lesson) return lesson;
        }
        return null;
    };

    const getNextLesson = () => {
        if (!course || !currentLessonId) return null;

        for (let i = 0; i < course.modules.length; i++) {
            const module = course.modules[i];
            for (let j = 0; j < module.lessons.length; j++) {
                const lesson = module.lessons[j];
                if (lesson.lessonId === currentLessonId) {
                    // Return next lesson in the same module, or first lesson of next module
                    if (j + 1 < module.lessons.length) {
                        return module.lessons[j + 1];
                    } else if (i + 1 < course.modules.length) {
                        return course.modules[i + 1].lessons[0];
                    }
                }
            }
        }
        return null;
    };

    const getPreviousLesson = () => {
        if (!course || !currentLessonId) return null;

        for (let i = course.modules.length - 1; i >= 0; i--) {
            const module = course.modules[i];
            for (let j = module.lessons.length - 1; j >= 0; j--) {
                const lesson = module.lessons[j];
                if (lesson.lessonId === currentLessonId) {
                    // Return previous lesson in the same module, or last lesson of previous module
                    if (j > 0) {
                        return module.lessons[j - 1];
                    } else if (i > 0) {
                        return course.modules[i - 1].lessons[course.modules[i - 1].lessons.length - 1];
                    }
                }
            }
        }
        return null;
    };

    const currentLesson = getCurrentLesson();
    const nextLesson = getNextLesson();
    const previousLesson = getPreviousLesson();

    const getCompletedLessons = () => {
        if (!course) return 0;
        let completed = 0;
        course.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                if (lesson.isCompleted) completed++;
            });
        });
        return completed;
    };

    const getTotalLessons = () => {
        if (!course) return 0;
        return course.modules.reduce((total, module) => total + module.lessons.length, 0);
    };

    const progressPercentage = getTotalLessons() > 0 ? (getCompletedLessons() / getTotalLessons()) * 100 : 0;

    if (courseLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-2">Course not found</h2>
                    <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
                    <button onClick={() => navigate('/student/courses')} className="btn-primary">
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <div className={cn(
                "bg-card border-r border-border transition-all duration-300 flex flex-col",
                sidebarOpen ? "w-80" : "w-0 overflow-hidden"
            )}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/student/courses')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Courses
                        </button>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 hover:bg-muted rounded transition-colors lg:hidden"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <h1 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h1>

                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(progressPercentage)}%</span>
                        </div>
                        <ProgressBar value={progressPercentage} showLabel={false} />
                        <p className="text-xs text-muted-foreground">
                            {getCompletedLessons()} of {getTotalLessons()} lessons completed
                        </p>
                    </div>
                </div>

                {/* Course Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        <div className="space-y-4">
                            {course.modules.map((module, moduleIndex) => (
                                <div key={module.moduleId} className="space-y-2">
                                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                        Module {moduleIndex + 1}: {module.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {module.lessons.map((lesson) => (
                                            <button
                                                key={lesson.lessonId}
                                                onClick={() => setCurrentLessonId(lesson.lessonId)}
                                                className={cn(
                                                    "w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3",
                                                    currentLessonId === lesson.lessonId
                                                        ? "bg-primary/10 border border-primary/20"
                                                        : "hover:bg-muted/50"
                                                )}
                                            >
                                                <div className="flex-shrink-0">
                                                    {lesson.isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-success" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm line-clamp-2">{lesson.title}</p>
                                                    {lesson.duration && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                            <Clock className="w-3 h-3" />
                                                            {lesson.duration}min
                                                        </p>
                                                    )}
                                                </div>
                                                {currentLessonId === lesson.lessonId && (
                                                    <ChevronRight className="w-4 h-4 text-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="bg-card border-b border-border p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="font-semibold">{course.title}</h2>
                                {currentLesson && (
                                    <p className="text-sm text-muted-foreground">Lesson: {currentLesson.title}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lesson Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {currentLesson ? (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Video Player Placeholder */}
                            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center border border-border">
                                {currentLesson.videoUrl ? (
                                    <div className="text-center">
                                        <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                                        <p className="text-muted-foreground">Video Player</p>
                                        <p className="text-sm text-muted-foreground mt-1">{currentLesson.videoUrl}</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <BookOpen className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                                        <p className="text-muted-foreground">Reading Material</p>
                                    </div>
                                )}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
                                    {currentLesson.duration && (
                                        <p className="text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {currentLesson.duration} minutes
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleLessonComplete(currentLesson.lessonId, !currentLesson.isCompleted)}
                                    disabled={markCompleteMutation.isPending}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                                        currentLesson.isCompleted
                                            ? "bg-success/10 text-success hover:bg-success/20"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                >
                                    {markCompleteMutation.isPending ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                    ) : currentLesson.isCompleted ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Circle className="w-4 h-4" />
                                    )}
                                    {currentLesson.isCompleted ? "Completed" : "Mark Complete"}
                                </button>
                            </div>

                            {/* Lesson Content */}
                            {currentLesson.content && (
                                <div className="prose prose-slate max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-6 border-t border-border">
                                <div>
                                    {previousLesson ? (
                                        <button
                                            onClick={() => setCurrentLessonId(previousLesson.lessonId)}
                                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <SkipBack className="w-4 h-4" />
                                            <div className="text-left">
                                                <p className="text-sm">Previous</p>
                                                <p className="font-medium">{previousLesson.title}</p>
                                            </div>
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}
                                </div>

                                <div>
                                    {nextLesson ? (
                                        <button
                                            onClick={() => setCurrentLessonId(nextLesson.lessonId)}
                                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <div className="text-right">
                                                <p className="text-sm">Next</p>
                                                <p className="font-medium">{nextLesson.title}</p>
                                            </div>
                                            <SkipForward className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Course Completed!</p>
                                            <p className="font-medium">Congratulations! 🎉</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Select a lesson to begin</h3>
                                <p className="text-muted-foreground">Choose a lesson from the sidebar to start learning</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}