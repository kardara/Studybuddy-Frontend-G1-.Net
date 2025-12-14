import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Edit,
    Trash2,
    ChevronDown,
    X,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api.config";

interface Course {
    courseId: number;
    title: string;
    description?: string;
    category?: string;
    createdAt: string;
}

interface Module {
    moduleId: number;
    courseId: number;
    title: string;
    description?: string;
    moduleNumber: number;
    estimatedDurationMinutes?: number;
    sequenceOrder: number;
    lessons?: Lesson[];
}

interface Lesson {
    lessonId: number;
    moduleId: number;
    courseId: number;
    title: string;
    content?: string;
    lessonNumber: number;
    estimatedDurationMinutes?: number;
    sequenceOrder: number;
    contentType?: string;
    videoUrl?: string;
}

interface Quiz {
    quizId: number;
    courseId: number;
    moduleId?: number;
    title: string;
    description?: string;
    totalQuestions: number;
    passingPercentage: number;
    durationMinutes?: number;
}

interface ModalState {
    show: boolean;
    type: "module" | "lesson" | "quiz" | null;
    data?: Module | Lesson | Quiz;
    courseId?: number;
    moduleId?: number;
}

export default function CourseContentManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState<ModalState>({ show: false, type: null });
    const { toast } = useToast();

    // Form states
    const [moduleForm, setModuleForm] = useState({
        title: "",
        description: "",
        estimatedDurationMinutes: "",
    });

    const [lessonForm, setLessonForm] = useState({
        title: "",
        content: "",
        contentType: "text",
        videoUrl: "",
        estimatedDurationMinutes: "",
    });

    const [quizForm, setQuizForm] = useState({
        title: "",
        description: "",
        totalQuestions: "",
        passingPercentage: "70",
        durationMinutes: "",
    });

    // Load courses
    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiClient.get("courses/admin/all");
            setCourses(data.data);
            if (data.data.length > 0) {
                setSelectedCourse(data.data[0]);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load courses",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const fetchModules = async (courseId: number) => {
        try {
            setLoading(true);
            const data = await apiClient.get(`courses/${courseId}/modules`);
            setModules(data.data || []);
        } catch (error) {
            console.error("Error fetching modules:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load modules when course changes
    useEffect(() => {
        if (selectedCourse) {
            fetchModules(selectedCourse.courseId);
        }
    }, [selectedCourse]);

    // Module handlers
    const handleAddModule = () => {
        setModuleForm({ title: "", description: "", estimatedDurationMinutes: "" });
        setModal({ show: true, type: "module", courseId: selectedCourse?.courseId });
    };

    const handleEditModule = (module: Module) => {
        setModuleForm({
            title: module.title,
            description: module.description || "",
            estimatedDurationMinutes: module.estimatedDurationMinutes?.toString() || "",
        });
        setModal({
            show: true,
            type: "module",
            courseId: selectedCourse?.courseId,
            data: module,
        });
    };

    const handleSaveModule = async () => {
        if (!moduleForm.title.trim() || !selectedCourse) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Module title is required",
            });
            return;
        }

        setSubmitting(true);
        try {
            const data = {
                title: moduleForm.title,
                description: moduleForm.description,
                estimatedDurationMinutes: moduleForm.estimatedDurationMinutes
                    ? parseInt(moduleForm.estimatedDurationMinutes)
                    : null,
            };

            if (modal.data) {
                await apiClient.put(`courses/${selectedCourse.courseId}/modules/${modal.data.moduleId}`, data);
            } else {
                await apiClient.post(`courses/${selectedCourse.courseId}/modules`, data);
            }

            toast({
                title: "Success",
                description: modal.data ? "Module updated" : "Module created",
            });
            setModal({ show: false, type: null });
            await fetchModules(selectedCourse.courseId);
        } catch (error) {
            console.error("Error saving module:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save module",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteModule = async (moduleId: number) => {
        if (!confirm("Delete this module and all its lessons?")) return;

        setSubmitting(true);
        try {
            await apiClient.delete(`courses/${selectedCourse?.courseId}/modules/${moduleId}`);

            toast({
                title: "Success",
                description: "Module deleted",
            });
            await fetchModules(selectedCourse!.courseId);
        } catch (error) {
            console.error("Error deleting module:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete module",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Lesson handlers
    const handleAddLesson = (moduleId: number) => {
        setLessonForm({
            title: "",
            content: "",
            contentType: "text",
            videoUrl: "",
            estimatedDurationMinutes: "",
        });
        setModal({
            show: true,
            type: "lesson",
            courseId: selectedCourse?.courseId,
            moduleId,
        });
    };

    const handleEditLesson = (lesson: Lesson) => {
        setLessonForm({
            title: lesson.title,
            content: lesson.content || "",
            contentType: lesson.contentType || "text",
            videoUrl: lesson.videoUrl || "",
            estimatedDurationMinutes: lesson.estimatedDurationMinutes?.toString() || "",
        });
        setModal({
            show: true,
            type: "lesson",
            courseId: selectedCourse?.courseId,
            moduleId: lesson.moduleId,
            data: lesson,
        });
    };

    const handleSaveLesson = async () => {
        if (!lessonForm.title.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Lesson title is required",
            });
            return;
        }

        setSubmitting(true);
        try {
            const data = {
                title: lessonForm.title,
                content: lessonForm.content,
                contentType: lessonForm.contentType,
                videoUrl: lessonForm.videoUrl,
                estimatedDurationMinutes: lessonForm.estimatedDurationMinutes
                    ? parseInt(lessonForm.estimatedDurationMinutes)
                    : null,
            };

            if (modal.data) {
                await apiClient.put(`courses/${selectedCourse?.courseId}/modules/${modal.moduleId}/lessons/${(modal.data as Lesson).lessonId}`, data);
            } else {
                await apiClient.post(`courses/${selectedCourse?.courseId}/modules/${modal.moduleId}/lessons`, data);
            }

            toast({
                title: "Success",
                description: modal.data ? "Lesson updated" : "Lesson created",
            });
            setModal({ show: false, type: null });
            await fetchModules(selectedCourse!.courseId);
        } catch (error) {
            console.error("Error saving lesson:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save lesson",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLesson = async (moduleId: number, lessonId: number) => {
        if (!confirm("Delete this lesson?")) return;

        setSubmitting(true);
        try {
            await apiClient.delete(`courses/${selectedCourse?.courseId}/modules/${moduleId}/lessons/${lessonId}`);

            toast({
                title: "Success",
                description: "Lesson deleted",
            });
            await fetchModules(selectedCourse!.courseId);
        } catch (error) {
            console.error("Error deleting lesson:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete lesson",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const toggleExpandModule = (moduleId: number) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Course Content Manager</h1>
            </div>

            {/* Course Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Select Course</label>
                <select
                    value={selectedCourse?.courseId || ""}
                    onChange={(e) => {
                        const course = courses.find((c) => c.courseId === parseInt(e.target.value));
                        setSelectedCourse(course || null);
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">-- Select a course --</option>
                    {courses.map((course) => (
                        <option key={course.courseId} value={course.courseId}>
                            {course.title}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourse && (
                <>
                    {/* Course Info */}
                    <div className="bg-blue-50 p-4 rounded-lg border">
                        <h3 className="font-bold text-lg">{selectedCourse.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {selectedCourse.description || "No description"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(selectedCourse.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Add Module Button */}
                    <button
                        onClick={handleAddModule}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Module
                    </button>

                    {/* Modules List */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : modules.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No modules yet. Add one to get started.
                            </div>
                        ) : (
                            modules.map((module) => (
                                <div key={module.moduleId} className="border rounded-lg overflow-hidden">
                                    {/* Module Header */}
                                    <div className="bg-muted/50 p-4 flex items-center justify-between cursor-pointer hover:bg-muted"
                                        onClick={() => toggleExpandModule(module.moduleId)}>
                                        <div className="flex items-center gap-3 flex-1">
                                            <ChevronDown
                                                className={`w-5 h-5 transition ${expandedModules.has(module.moduleId) ? "rotate-180" : ""
                                                    }`}
                                            />
                                            <div>
                                                <h4 className="font-bold">{module.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {module.lessons?.length || 0} lessons
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditModule(module);
                                                }}
                                                className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600"
                                                title="Edit module"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteModule(module.moduleId);
                                                }}
                                                className="p-2 hover:bg-red-100 rounded transition-colors text-red-600"
                                                title="Delete module"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedModules.has(module.moduleId) && (
                                        <div className="p-4 border-t space-y-3">
                                            {/* Lessons */}
                                            <div className="space-y-2">
                                                {module.lessons && module.lessons.length > 0 && (
                                                    <>
                                                        <h5 className="font-medium text-sm">Lessons</h5>
                                                        {module.lessons.map((lesson) => (
                                                            <div
                                                                key={lesson.lessonId}
                                                                className="flex items-center justify-between p-3 bg-muted/50 rounded hover:bg-muted"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-sm">{lesson.title}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {lesson.contentType || "text"} •{" "}
                                                                        {lesson.estimatedDurationMinutes || 0} min
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleEditLesson(lesson)}
                                                                        className="p-2 hover:bg-blue-100 rounded text-blue-600"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDeleteLesson(module.moduleId, lesson.lessonId)
                                                                        }
                                                                        className="p-2 hover:bg-red-100 rounded text-red-600"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                )}

                                                {/* Add Lesson Button */}
                                                <button
                                                    onClick={() => handleAddLesson(module.moduleId)}
                                                    className="w-full p-2 border-2 border-dashed border-primary text-primary hover:bg-primary/5 rounded transition-colors text-sm font-medium"
                                                >
                                                    + Add Lesson
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Module Modal */}
            {modal.show && modal.type === "module" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {modal.data ? "Edit Module" : "Add Module"}
                            </h2>
                            <button
                                onClick={() => setModal({ show: false, type: null })}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title *</label>
                                <input
                                    type="text"
                                    value={moduleForm.title}
                                    onChange={(e) =>
                                        setModuleForm({ ...moduleForm, title: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Module title"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={moduleForm.description}
                                    onChange={(e) =>
                                        setModuleForm({ ...moduleForm, description: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Module description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Estimated Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={moduleForm.estimatedDurationMinutes}
                                    onChange={(e) =>
                                        setModuleForm({
                                            ...moduleForm,
                                            estimatedDurationMinutes: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setModal({ show: false, type: null })}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveModule}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-primary/50 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {submitting ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lesson Modal */}
            {modal.show && modal.type === "lesson" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {modal.data ? "Edit Lesson" : "Add Lesson"}
                            </h2>
                            <button
                                onClick={() => setModal({ show: false, type: null })}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Title *</label>
                                <input
                                    type="text"
                                    value={lessonForm.title}
                                    onChange={(e) =>
                                        setLessonForm({ ...lessonForm, title: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Lesson title"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Content Type</label>
                                <select
                                    value={lessonForm.contentType}
                                    onChange={(e) =>
                                        setLessonForm({ ...lessonForm, contentType: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="text">Text</option>
                                    <option value="video">Video</option>
                                    <option value="pdf">PDF</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>

                            {lessonForm.contentType.includes("video") && (
                                <div>
                                    <label className="text-sm font-medium">Video URL</label>
                                    <input
                                        type="url"
                                        value={lessonForm.videoUrl}
                                        onChange={(e) =>
                                            setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium">Content</label>
                                <textarea
                                    value={lessonForm.content}
                                    onChange={(e) =>
                                        setLessonForm({ ...lessonForm, content: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Lesson content"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Estimated Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={lessonForm.estimatedDurationMinutes}
                                    onChange={(e) =>
                                        setLessonForm({
                                            ...lessonForm,
                                            estimatedDurationMinutes: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setModal({ show: false, type: null })}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveLesson}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-primary/50 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {submitting ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
