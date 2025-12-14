import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  GripVertical,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Play,
  BarChart3,
  Settings,
  ToggleLeft,
  ToggleRight,
  FileText,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  quizzesService,
  QuizListItem
} from "@/services/api/quizzes.service";
import { coursesService } from "@/services/api/courses.service";
import {
  CourseListDto,
  CreateQuizRequest,
  UpdateQuizRequest,
  CreateQuestionRequest,
  CreateQuestionOptionRequest
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface QuestionFormData {
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  options: Array<{
    optionText: string;
    isCorrect: boolean;
  }>;
}

interface QuizFormData {
  title: string;
  description: string;
  courseId: number | null;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  isActive: boolean;
  questions: QuestionFormData[];
}

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [courses, setCourses] = useState<CourseListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizListItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    courseId: null,
    passingScore: 70,
    timeLimit: 30,
    maxAttempts: 3,
    isActive: true,
    questions: [
      {
        questionText: "",
        questionType: "multiple_choice",
        points: 1,
        options: [
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ],
      },
    ],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizzesData, coursesData] = await Promise.all([
        quizzesService.getAllQuizzes(),
        coursesService.getAllCourses()
      ]);
      setQuizzes(quizzesData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      courseId: null,
      passingScore: 70,
      timeLimit: 30,
      maxAttempts: 3,
      isActive: true,
      questions: [
        {
          questionText: "",
          questionType: "multiple_choice",
          points: 1,
          options: [
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
          ],
        },
      ],
    });
    setEditingQuiz(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (quiz: QuizListItem) => {
    setFormData({
      title: quiz.title,
      description: quiz.description || "",
      courseId: quiz.courseId,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit || 30,
      maxAttempts: quiz.maxAttempts || 3,
      isActive: quiz.isActive,
      questions: [], // Will be loaded separately
    });
    setEditingQuiz(quiz);
    setShowModal(true);
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: "",
          questionType: "multiple_choice",
          points: 1,
          options: [
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
          ],
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index: number, field: keyof QuestionFormData, value: string | number) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, field: keyof CreateQuestionOptionRequest, value: string | boolean) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map((option, idx) => ({
      ...option,
      isCorrect: idx === optionIndex
    }));
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error("Quiz title is required");
      }
      if (!formData.courseId) {
        throw new Error("Please select a course");
      }
      if (formData.questions.length === 0) {
        throw new Error("At least one question is required");
      }

      // Validate questions
      for (let i = 0; i < formData.questions.length; i++) {
        const question = formData.questions[i];
        if (!question.questionText.trim()) {
          throw new Error(`Question ${i + 1} text is required`);
        }
        if (question.options.some(opt => !opt.optionText.trim())) {
          throw new Error(`All options for question ${i + 1} must be filled`);
        }
        if (!question.options.some(opt => opt.isCorrect)) {
          throw new QuestionError(`Question ${i + 1} must have exactly one correct answer`);
        }
      }

      const quizData: CreateQuizRequest = {
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        passingScore: formData.passingScore,
        timeLimit: formData.timeLimit,
        maxAttempts: formData.maxAttempts,
        questions: formData.questions.map((q, qIndex) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          orderIndex: qIndex + 1,
          options: q.options.map((opt, oIndex) => ({
            optionText: opt.optionText,
            orderIndex: oIndex + 1,
            isCorrect: opt.isCorrect,
          })),
        })),
      };

      if (editingQuiz) {
        const updateData: UpdateQuizRequest = {
          quizId: editingQuiz.quizId,
          title: formData.title,
          description: formData.description,
          passingScore: formData.passingScore,
          timeLimit: formData.timeLimit,
          maxAttempts: formData.maxAttempts,
          isActive: formData.isActive,
        };
        await quizzesService.updateQuiz(updateData);
        toast({
          title: "Success",
          description: "Quiz updated successfully",
        });
      } else {
        await quizzesService.createQuiz(quizData);
        toast({
          title: "Success",
          description: "Quiz created successfully",
        });
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save quiz",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (quizId: number) => {
    try {
      await quizzesService.deleteQuiz(quizId);
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      loadData();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete quiz",
      });
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const toggleQuizStatus = async (quizId: number, currentStatus: boolean) => {
    try {
      await quizzesService.toggleQuizStatus(quizId, !currentStatus);
      toast({
        title: "Success",
        description: `Quiz ${!currentStatus ? "activated" : "deactivated"} successfully`,
      });
      loadData();
    } catch (error) {
      console.error("Error toggling quiz status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quiz status",
      });
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "all" || quiz.courseId.toString() === filterCourse;
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage course quizzes with multiple choice questions
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Quiz
        </button>
      </div>

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId.toString()}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card overflow-hidden">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No quizzes match your search criteria" : "Get started by creating your first quiz"}
            </p>
            {!searchTerm && (
              <button onClick={openCreateModal} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Quiz
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Course</th>
                  <th>Questions</th>
                  <th>Pass Score</th>
                  <th>Time Limit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz.quizId}>
                    <td>
                      <div className="font-medium">{quiz.title}</div>
                      {quiz.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {quiz.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {quiz.courseTitle}
                      </span>
                    </td>
                    <td>{quiz.questionCount}</td>
                    <td>{quiz.passingScore}%</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {quiz.timeLimit ? `${quiz.timeLimit}m` : "No limit"}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "badge",
                            quiz.isActive ? "badge-success" : "badge-muted"
                          )}
                        >
                          {quiz.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() => toggleQuizStatus(quiz.quizId, quiz.isActive)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                        >
                          {quiz.isActive ? (
                            <ToggleRight className="w-5 h-5 text-success" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="View quiz"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => openEditModal(quiz)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Edit quiz"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="View statistics"
                        >
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(quiz.quizId)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Delete quiz"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing 1-{filteredQuizzes.length} of {quizzes.length} quizzes
              </p>
              <div className="flex gap-2">
                <button className="btn-outline py-2 px-3" disabled>
                  Previous
                </button>
                <button className="btn-primary py-2 px-3" disabled>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quiz Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Quiz Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="input-field"
                      placeholder="Enter quiz title"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Course *
                    </label>
                    <select
                      value={formData.courseId || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, courseId: parseInt(e.target.value) })
                      }
                      className="input-field"
                      required
                      disabled={submitting}
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.courseId} value={course.courseId}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter quiz description"
                    rows={2}
                    className="input-field resize-none"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Pass Score (%) *
                    </label>
                    <input
                      type="number"
                      value={formData.passingScore}
                      onChange={(e) =>
                        setFormData({ ...formData, passingScore: parseInt(e.target.value) })
                      }
                      className="input-field"
                      min="0"
                      max="100"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, timeLimit: parseInt(e.target.value) })
                      }
                      className="input-field"
                      min="1"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      value={formData.maxAttempts}
                      onChange={(e) =>
                        setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })
                      }
                      className="input-field"
                      min="1"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium">Questions *</label>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="btn-outline py-1.5 px-3 text-sm"
                      disabled={submitting}
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formData.questions.map((question, qIndex) => (
                      <div key={qIndex} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-grab" />
                          <div className="flex-1 space-y-4">
                            {/* Question Header */}
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-muted-foreground">
                                Q{qIndex + 1}.
                              </span>
                              <select
                                value={question.questionType}
                                onChange={(e) =>
                                  updateQuestion(qIndex, 'questionType', e.target.value)
                                }
                                className="input-field w-auto py-1 text-sm"
                                disabled={submitting}
                              >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="true_false">True/False</option>
                                <option value="short_answer">Short Answer</option>
                              </select>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">Points:</label>
                                <input
                                  type="number"
                                  value={question.points}
                                  onChange={(e) =>
                                    updateQuestion(qIndex, 'points', parseInt(e.target.value))
                                  }
                                  className="input-field w-16 py-1 text-sm"
                                  min="1"
                                  disabled={submitting}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="p-1 hover:bg-muted rounded transition-colors ml-auto"
                                disabled={submitting || formData.questions.length === 1}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </div>

                            {/* Question Text */}
                            <input
                              type="text"
                              value={question.questionText}
                              onChange={(e) =>
                                updateQuestion(qIndex, 'questionText', e.target.value)
                              }
                              placeholder="Enter your question"
                              className="input-field"
                              disabled={submitting}
                            />

                            {/* Options */}
                            {question.questionType === 'multiple_choice' && (
                              <div className="grid grid-cols-2 gap-3">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setCorrectAnswer(qIndex, oIndex)}
                                      className={cn(
                                        "flex-shrink-0 p-1 rounded transition-colors",
                                        option.isCorrect
                                          ? "text-success bg-success/10"
                                          : "text-muted-foreground hover:text-success"
                                      )}
                                      disabled={submitting}
                                    >
                                      {option.isCorrect ? (
                                        <CheckCircle className="w-5 h-5" />
                                      ) : (
                                        <Circle className="w-5 h-5" />
                                      )}
                                    </button>
                                    <input
                                      type="text"
                                      value={option.optionText}
                                      onChange={(e) =>
                                        updateQuestionOption(qIndex, oIndex, 'optionText', e.target.value)
                                      }
                                      placeholder={`Option ${oIndex + 1}`}
                                      className="input-field py-2"
                                      disabled={submitting}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.questionType === 'true_false' && (
                              <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setCorrectAnswer(qIndex, 0)}
                                    className={cn(
                                      "p-1 rounded transition-colors",
                                      question.options[0]?.isCorrect
                                        ? "text-success bg-success/10"
                                        : "text-muted-foreground hover:text-success"
                                    )}
                                    disabled={submitting}
                                  >
                                    {question.options[0]?.isCorrect ? (
                                      <CheckCircle className="w-5 h-5" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </button>
                                  <span>True</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setCorrectAnswer(qIndex, 1)}
                                    className={cn(
                                      "p-1 rounded transition-colors",
                                      question.options[1]?.isCorrect
                                        ? "text-success bg-success/10"
                                        : "text-muted-foreground hover:text-success"
                                    )}
                                    disabled={submitting}
                                  >
                                    {question.options[1]?.isCorrect ? (
                                      <CheckCircle className="w-5 h-5" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </button>
                                  <span>False</span>
                                </div>
                              </div>
                            )}

                            {question.questionType === 'short_answer' && (
                              <div className="p-3 bg-muted/50 rounded text-sm text-muted-foreground">
                                Short answer questions will be manually graded
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingQuiz ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    editingQuiz ? "Update Quiz" : "Create Quiz"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <Trash2 className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Delete Quiz</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this quiz? This action cannot be undone and will remove all associated attempts.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="btn-destructive"
                >
                  Delete Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom error class for better error handling
class QuestionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuestionError';
  }
}