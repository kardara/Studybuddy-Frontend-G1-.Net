import { useState, useEffect, useCallback } from "react";
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
  QuestionDto,
  QuestionOptionDto,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface QuestionFormData {
  questionText: string;
  questionType: 'MultipleChoice';
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

  const createEmptyQuestion = (): QuestionFormData => {
    return {
      questionText: "",
      questionType: "MultipleChoice",
      points: 1,
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
    };
  };

  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    courseId: null,
    passingScore: 70,
    timeLimit: 30,
    maxAttempts: 3,
    isActive: true,
    questions: [createEmptyQuestion()],
  });

  const loadData = useCallback(async () => {
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
        description: "Failed to load quizzes"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      courseId: null,
      passingScore: 70,
      timeLimit: 30,
      maxAttempts: 3,
      isActive: true,
      questions: [createEmptyQuestion()],
    });
    setEditingQuiz(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = async (quiz: QuizListItem) => {
    try {
      const fullQuiz = await quizzesService.getQuizById(quiz.quizId);

      setFormData({
        title: fullQuiz.title,
        description: fullQuiz.description || "",
        courseId: fullQuiz.courseId,
        passingScore: fullQuiz.passingScore || 70,
        timeLimit: fullQuiz.timeLimit || undefined,
        maxAttempts: fullQuiz.maxAttempts || undefined,
        isActive: fullQuiz.isActive,
        questions: fullQuiz.questions?.map((q: QuestionDto) => ({
          questionText: q.questionText,
          questionType: "MultipleChoice",
          points: q.points || 1,
          options: q.options?.map((opt: QuestionOptionDto) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          })) || [],
        })) || [createEmptyQuestion()],
      });

      setEditingQuiz(quiz);
      setShowModal(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load quiz for editing",
      });
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()]
    }));
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length === 1) return;
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, updates: Partial<QuestionFormData>) => {
    setFormData(prev => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], ...updates };
      return { ...prev, questions };
    });
  };

  const updateQuestionOption = (qIndex: number, oIndex: number, field: "optionText" | "isCorrect", value: string | boolean) => {
    setFormData(prev => {
      const questions = [...prev.questions];
      questions[qIndex].options[oIndex] = {
        ...questions[qIndex].options[oIndex],
        [field]: value
      };
      return { ...prev, questions };
    });
  };

  const setCorrectAnswer = (qIndex: number, oIndex: number) => {
    setFormData(prev => {
      const questions = [...prev.questions];
      questions[qIndex].options = questions[qIndex].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === oIndex
      }));
      return { ...prev, questions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.title.trim()) throw new Error("Quiz title is required");
      if (!formData.courseId) throw new Error("Please select a course");
      if (formData.questions.length === 0) throw new Error("At least one question required");

      for (let i = 0; i < formData.questions.length; i++) {
        const q = formData.questions[i];
        if (!q.questionText.trim()) throw new Error(`Question ${i + 1}: Text required`);

        if (q.options.length < 2) throw new Error(`Question ${i + 1}: Need at least 2 options`);
        if (q.options.some(o => !o.optionText.trim())) throw new Error(`Question ${i + 1}: Fill all options`);
        if (!q.options.some(o => o.isCorrect)) throw new Error(`Question ${i + 1}: Select one correct answer`);
        if (q.options.filter(o => o.isCorrect).length > 1) throw new Error(`Question ${i + 1}: Only one correct answer`);
      }

      if (editingQuiz) {
        const updateData: UpdateQuizRequest = {
          quizId: editingQuiz.quizId,
          title: formData.title,
          description: formData.description || undefined,
          courseId: formData.courseId || undefined,
          passingScore: formData.passingScore,
          timeLimit: formData.timeLimit,
          maxAttempts: formData.maxAttempts,
          isActive: formData.isActive,
        };
        await quizzesService.updateQuiz(updateData);
        toast({ title: "Success", description: "Quiz updated successfully" });
      } else {
        const createData: CreateQuizRequest = {
          title: formData.title,
          description: formData.description || undefined,
          courseId: formData.courseId!,
          passingScore: formData.passingScore,
          timeLimit: formData.timeLimit,
          maxAttempts: formData.maxAttempts,
          questions: formData.questions.map((q, qi) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            points: q.points,
            orderIndex: qi + 1,
            options: q.options.map((opt, oi) => ({
              optionText: opt.optionText,
              orderIndex: oi + 1,
              isCorrect: opt.isCorrect,
            })),
          })),
        };
        await quizzesService.createQuiz(createData);
        toast({ title: "Success", description: "Quiz created successfully" });
      }

      setShowModal(false);
      resetForm();
      await loadData();
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to save quiz",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (quizId: number) => {
    try {
      await quizzesService.deleteQuiz(quizId);
      toast({ title: "Success", description: "Quiz deleted" });
      await loadData();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete quiz" });
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const toggleQuizStatus = async (quizId: number, current: boolean) => {
    try {
      await quizzesService.toggleQuizStatus(quizId, !current);
      toast({ title: "Success", description: `Quiz ${!current ? "activated" : "deactivated"}` });
      await loadData();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    }
  };

  const filteredQuizzes = quizzes.filter(q =>
    (q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCourse === "all" || q.courseId.toString() === filterCourse)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage course quizzes
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create Quiz
        </button>
      </div>

      {/* Filters */}
      <div className="dashboard-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <select
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
            className="input-field"
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.courseId} value={c.courseId}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card overflow-hidden">
        <div className="overflow-x-auto">
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No quizzes found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? "Try adjusting your search" : "Start by creating your first quiz"}
              </p>
              {!searchTerm && (
                <button onClick={openCreateModal} className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Create Quiz
                </button>
              )}
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">Quiz Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Questions</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Pass Score</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Time Limit</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredQuizzes.map(quiz => (
                  <tr key={quiz.quizId} className="hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-medium">{quiz.title}</div>
                      {quiz.description && (
                        <div className="text-sm text-muted-foreground mt-1 max-w-md truncate">
                          {quiz.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-primary">{quiz.courseTitle}</span>
                    </td>
                    <td className="px-6 py-4">{quiz.questionCount}</td>
                    <td className="px-6 py-4">{quiz.passingScore}%</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {quiz.timeLimit ? `${quiz.timeLimit}m` : "No limit"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn("badge", quiz.isActive ? "badge-success" : "badge-muted")}>
                          {quiz.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() => toggleQuizStatus(quiz.quizId, quiz.isActive)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        >
                          {quiz.isActive ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-muted rounded-lg" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(quiz)} className="p-2 hover:bg-muted rounded-lg" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-lg" title="Statistics">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(quiz.quizId)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal - Properly Centered */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div
            className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">{editingQuiz ? "Edit Quiz" : "Create New Quiz"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Quiz Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quiz Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Course *</label>
                    <select
                      value={formData.courseId || ""}
                      onChange={e => setFormData(prev => ({ ...prev, courseId: parseInt(e.target.value) || null }))}
                      className="input-field"
                      required
                      disabled={submitting}
                    >
                      <option value="">Select course</option>
                      {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.title}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="input-field resize-none"
                    disabled={submitting}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                    <input type="number" value={formData.passingScore} onChange={e => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))} className="input-field" min="1" max="100" disabled={submitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Limit (min)</label>
                    <input type="number" value={formData.timeLimit || ""} onChange={e => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || undefined }))} className="input-field" min="1" placeholder="Unlimited" disabled={submitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Attempts</label>
                    <input type="number" value={formData.maxAttempts || ""} onChange={e => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || undefined }))} className="input-field" min="1" placeholder="Unlimited" disabled={submitting} />
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <button type="button" onClick={addQuestion} className="btn-outline" disabled={submitting}>
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>

                  {formData.questions.map((q, qi) => (
                    <div key={qi} className="p-6 bg-muted/30 rounded-xl border">
                      <div className="flex items-start gap-4">
                        <GripVertical className="w-5 h-5 text-muted-foreground mt-2" />
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">Q{qi + 1}</span>
                            <span className="text-sm text-muted-foreground">Multiple Choice</span>
                            <input
                              type="number"
                              value={q.points}
                              onChange={e => updateQuestion(qi, { points: parseInt(e.target.value) || 1 })}
                              className="input-field w-20 py-2"
                              min="1"
                              disabled={submitting}
                            />
                            <button
                              type="button"
                              onClick={() => removeQuestion(qi)}
                              disabled={submitting || formData.questions.length === 1}
                              className="ml-auto p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={q.questionText}
                            onChange={e => updateQuestion(qi, { questionText: e.target.value })}
                            placeholder="Enter question text"
                            className="input-field"
                            disabled={submitting}
                          />

                          <div className="grid sm:grid-cols-2 gap-3">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setCorrectAnswer(qi, oi)}
                                  className={cn("p-2 rounded-lg transition-colors", opt.isCorrect ? "bg-success/20 text-success" : "bg-muted hover:bg-muted/80")}
                                  disabled={submitting}
                                >
                                  {opt.isCorrect ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                </button>
                                <input
                                  type="text"
                                  value={opt.optionText}
                                  onChange={e => updateQuestionOption(qi, oi, "optionText", e.target.value)}
                                  placeholder={`Option ${oi + 1}`}
                                  className="input-field"
                                  disabled={submitting}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-muted/30">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingQuiz ? "Update Quiz" : "Create Quiz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Centered */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <Trash2 className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Delete Quiz?</h3>
              <p className="text-muted-foreground mb-8">
                This action cannot be undone. All attempts and results will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowDeleteConfirm(null)} className="btn-outline">
                  Cancel
                </button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="btn-destructive">
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