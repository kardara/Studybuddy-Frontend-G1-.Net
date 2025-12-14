import { useState, useEffect } from "react";
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Circle,
    Loader2,
    AlertCircle,
    BookOpen,
    Clock,
    Award,
    Play,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Module {
    moduleId: number;
    title: string;
    description?: string;
    lessons?: Lesson[];
    estimatedDurationMinutes?: number;
}

interface Lesson {
    lessonId: number;
    title: string;
    content?: string;
    contentType?: string;
    videoUrl?: string;
    estimatedDurationMinutes?: number;
    isCompleted?: boolean;
}

interface CourseDetail {
    courseId: number;
    title: string;
    description?: string;
    modules: Module[];
    totalLessons?: number;
}

interface StudentProgress {
    lessonId: number;
    isCompleted: boolean;
    completedAt?: string;
}

// Utility function to convert video URLs to embed URLs
const getEmbedUrl = (url: string): string => {
    if (!url) return "";

    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // If it's already an embed URL, return as is
    if (url.includes("embed") || url.includes("player")) {
        return url;
    }

    // For direct video files or other URLs, return as is
    return url;
};

export default function StudentCourseLearning() {
    const { courseId } = useRoute().params;
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (courseId) {
            fetchCourse(parseInt(courseId));
        }
    }, [courseId]);

    useEffect(() => {
        if (course && course.modules.length > 0 && course.modules[0].lessons?.length) {
            const firstLesson = course.modules[0].lessons[0];
            setCurrentLessonId(firstLesson.lessonId);
        }
    }, [course]);

    // Reset video states when lesson changes
    useEffect(() => {
        setVideoLoading(true);
        setVideoError(false);
    }, [currentLessonId]);

    const fetchCourse = async (id: number) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/courses/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setCourse(data);
                // Mark completed lessons
                const completed = new Set<number>();
                data.modules.forEach((m: Module) => {
                    m.lessons?.forEach((l: Lesson) => {
                        if (l.isCompleted) completed.add(l.lessonId);
                    });
                });
                setCompletedLessons(completed);
            }
        } catch (error) {
            console.error("Error fetching course:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load course",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async () => {
        if (!currentLessonId || !courseId) return;

        setSubmitting(true);
        try {
            const response = await fetch("/api/v1/progress", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lessonId: currentLessonId,
                    courseId: parseInt(courseId),
                    isCompleted: true,
                }),
            });

            if (response.ok) {
                setCompletedLessons(new Set([...completedLessons, currentLessonId]));
                toast({
                    title: "Success",
                    description: "Lesson marked as complete",
                });

                // Check if course is complete
                checkCourseCompletion();
            }
        } catch (error) {
            console.error("Error marking lesson complete:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to mark lesson complete",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const checkCourseCompletion = async () => {
        if (!courseId) return;
        const totalLessons = course?.modules.reduce(
            (sum, m) => sum + (m.lessons?.length || 0),
            0
        );
        if (completedLessons.size === totalLessons) {
            toast({
                title: "Congratulations!",
                description: "You've completed this course! Take the final quiz to earn a certificate.",
            });
        }
    };

    const getCurrentLesson = (): Lesson | null => {
        if (!course || !currentLessonId) return null;
        for (const module of course.modules) {
            const lesson = module.lessons?.find((l) => l.lessonId === currentLessonId);
            if (lesson) return lesson;
        }
        return null;
    };

    const getNextLesson = (): Lesson | null => {
        if (!course || !currentLessonId) return null;
        for (let i = 0; i < course.modules.length; i++) {
            const module = course.modules[i];
            for (let j = 0; j < (module.lessons?.length || 0); j++) {
                const lesson = module.lessons![j];
                if (lesson.lessonId === currentLessonId) {
                    if (j + 1 < (module.lessons?.length || 0)) {
                        return module.lessons![j + 1];
                    } else if (i + 1 < course.modules.length) {
                        return course.modules[i + 1].lessons?.[0] || null;
                    }
                }
            }
        }
        return null;
    };

    const getPreviousLesson = (): Lesson | null => {
        if (!course || !currentLessonId) return null;
        for (let i = course.modules.length - 1; i >= 0; i--) {
            const module = course.modules[i];
            for (let j = (module.lessons?.length || 0) - 1; j >= 0; j--) {
                const lesson = module.lessons![j];
                if (lesson.lessonId === currentLessonId) {
                    if (j > 0) {
                        return module.lessons![j - 1];
                    } else if (i > 0) {
                        const prevModule = course.modules[i - 1];
                        return prevModule.lessons?.[prevModule.lessons.length - 1] || null;
                    }
                }
            }
        }
        return null;
    };

    const currentLesson = getCurrentLesson();
    const nextLesson = getNextLesson();
    const previousLesson = getPreviousLesson();

    const totalLessons = course?.modules.reduce(
        (sum, m) => sum + (m.lessons?.length || 0),
        0
    ) || 0;
    const progressPercentage =
        totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <AlertCircle className="w-8 h-8 text-red-600 mr-2" />
                <p>Course not found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-screen">
            {/* Sidebar - Course Navigation */}
            <div className="lg:col-span-1 border rounded-lg p-4 h-fit sticky top-4">
                <div className="mb-4">
                    <h2 className="font-bold text-lg mb-2">{course.title}</h2>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4" />
                            <span>{totalLessons} lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{completedLessons.size} completed</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="text-sm font-medium mb-2">{Math.round(progressPercentage)}%</div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Modules List */}
                <div className="space-y-3">
                    {course.modules.map((module) => (
                        <div key={module.moduleId}>
                            <h4 className="font-medium text-sm mb-2">{module.title}</h4>
                            <div className="space-y-1">
                                {module.lessons?.map((lesson) => (
                                    <button
                                        key={lesson.lessonId}
                                        onClick={() => setCurrentLessonId(lesson.lessonId)}
                                        className={`w-full text-left px-3 py-2 rounded transition-colors text-sm flex items-center gap-2 ${currentLessonId === lesson.lessonId
                                            ? "bg-primary text-white"
                                            : "hover:bg-muted"
                                            }`}
                                    >
                                        {completedLessons.has(lesson.lessonId) ? (
                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                        ) : (
                                            <Circle className="w-4 h-4 flex-shrink-0" />
                                        )}
                                        <span className="truncate">{lesson.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
                {currentLesson && (
                    <>
                        {/* Lesson Header */}
                        <div className="border rounded-lg p-6">
                            <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                {currentLesson.estimatedDurationMinutes && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{currentLesson.estimatedDurationMinutes} min</span>
                                    </div>
                                )}
                                {completedLessons.has(currentLesson.lessonId) && (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Completed</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lesson Content */}
                        <div className="border rounded-lg p-6 space-y-4">
                            {currentLesson.contentType === "video" && currentLesson.videoUrl && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Play className="w-4 h-4" />
                                        <span>Video Lesson</span>
                                    </div>
                                    <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                                        {videoLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                        {!videoError ? (
                                            <iframe
                                                src={getEmbedUrl(currentLesson.videoUrl)}
                                                title={currentLesson.title}
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                frameBorder="0"
                                                onLoad={() => setVideoLoading(false)}
                                                onError={() => {
                                                    console.error("Video failed to load:", currentLesson.videoUrl);
                                                    setVideoLoading(false);
                                                    setVideoError(true);
                                                }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                                                <div className="text-center p-4">
                                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                    <h3 className="font-medium mb-2">Video Unavailable</h3>
                                                    <p className="text-sm mb-4">
                                                        Unable to load the video. This might be due to:
                                                    </p>
                                                    <ul className="text-xs text-left space-y-1 mb-4">
                                                        <li>• Invalid video URL</li>
                                                        <li>• Video platform restrictions</li>
                                                        <li>• Network connectivity issues</li>
                                                    </ul>
                                                    <button
                                                        onClick={() => {
                                                            setVideoError(false);
                                                            setVideoLoading(true);
                                                        }}
                                                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
                                                    >
                                                        Try Again
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentLesson.content && (
                                <div className="prose max-w-none">
                                    <p>{currentLesson.content}</p>
                                </div>
                            )}

                            {!currentLesson.content && !currentLesson.videoUrl && (
                                <p className="text-muted-foreground">No content available for this lesson yet.</p>
                            )}
                        </div>

                        {/* Mark Complete Button */}
                        <div className="border rounded-lg p-6">
                            <button
                                onClick={handleMarkComplete}
                                disabled={
                                    submitting || completedLessons.has(currentLesson.lessonId)
                                }
                                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${completedLessons.has(currentLesson.lessonId)
                                    ? "bg-green-100 text-green-700"
                                    : "bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50"
                                    }`}
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {completedLessons.has(currentLesson.lessonId)
                                    ? "✓ Completed"
                                    : "Mark as Complete"}
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-3">
                            <button
                                onClick={() =>
                                    previousLesson && setCurrentLessonId(previousLesson.lessonId)
                                }
                                disabled={!previousLesson}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <button
                                onClick={() => nextLesson && setCurrentLessonId(nextLesson.lessonId)}
                                disabled={!nextLesson}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Course Completion Message */}
                        {completedLessons.size === totalLessons && (
                            <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                                <div className="flex items-start gap-4">
                                    <Award className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-green-900 mb-2">
                                            Course Completed!
                                        </h3>
                                        <p className="text-green-700 mb-4">
                                            You've finished all lessons. Take the final quiz to earn your certificate.
                                        </p>
                                        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                                            Take Final Quiz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Helper hook for route parameters
function useRoute() {
    const [params, setParams] = useState({ courseId: "" });

    useEffect(() => {
        const path = window.location.pathname;
        const match = path.match(/\/courses\/(\d+)/);
        if (match) {
            setParams({ courseId: match[1] });
        }
    }, []);

    return { params };
}
