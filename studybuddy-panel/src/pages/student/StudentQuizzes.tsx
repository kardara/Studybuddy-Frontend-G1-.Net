import { useState, useEffect } from "react";
import { ClipboardList, Clock, CheckCircle, XCircle, Play, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { quizzesService, StudentQuizAttempt } from "@/services/api/quizzes.service";
import { useToast } from "@/hooks/use-toast";

export default function StudentQuizzes() {
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "failed">("pending");
  const [quizzes, setQuizzes] = useState<StudentQuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizzesService.getStudentQuizAttempts();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch quiz attempts",
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = quizzes.filter(q => q.status === 'in_progress').length;
  const completedCount = quizzes.filter(q => q.status === 'completed' && (q.score || 0) >= 70).length;
  const failedCount = quizzes.filter(q => q.status === 'completed' && (q.score || 0) < 70).length;

  const filteredQuizzes = quizzes.filter(quiz => {
    if (activeTab === "pending") return quiz.status === 'in_progress';
    if (activeTab === "completed") return quiz.status === 'completed' && (quiz.score || 0) >= 70;
    if (activeTab === "failed") return quiz.status === 'completed' && (quiz.score || 0) < 70;
    return false;
  });

  const getStatusIcon = (status: string, score?: number) => {
    if (status === 'in_progress') return <Clock className="w-4 h-4 text-primary" />;
    if (status === 'completed' && (score || 0) >= 70) return <CheckCircle className="w-4 h-4 text-success" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  const getStatusBadge = (status: string, score?: number) => {
    if (status === 'in_progress') return <span className="badge badge-primary">In Progress</span>;
    if (status === 'completed' && (score || 0) >= 70) return <span className="badge badge-success">Passed</span>;
    return <span className="badge badge-destructive">Failed</span>;
  };

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
          <h1 className="page-title">Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            Test your knowledge and track your performance
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-semibold">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passed</p>
              <p className="text-2xl font-semibold">{completedCount}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-semibold">{failedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "pending"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "completed"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Passed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab("failed")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "failed"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Failed ({failedCount})
        </button>
      </div>

      {/* Quiz List */}
      {filteredQuizzes.length === 0 ? (
        <div className="dashboard-card p-12 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No {activeTab} quizzes</h3>
          <p className="text-muted-foreground">
            {activeTab === "pending"
              ? "You don't have any pending quizzes at the moment."
              : activeTab === "completed"
                ? "You haven't passed any quizzes yet."
                : "You haven't failed any quizzes yet."
            }
          </p>
        </div>
      ) : (
        <div className="dashboard-card">
          <div className="p-6">
            <div className="space-y-4">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.attemptId}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(quiz.status, quiz.score)}
                    </div>
                    <div>
                      <h3 className="font-medium">{quiz.quizTitle}</h3>
                      <p className="text-sm text-muted-foreground">{quiz.courseTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(quiz.status, quiz.score)}
                        {quiz.submittedAt && (
                          <span className="text-xs text-muted-foreground">
                            Submitted {new Date(quiz.submittedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {quiz.status === 'completed' && quiz.score !== undefined && (
                      <div className="text-right">
                        <p className="font-medium">{quiz.score}%</p>
                        <p className="text-xs text-muted-foreground">
                          {quiz.correctAnswers}/{quiz.totalQuestions} correct
                        </p>
                      </div>
                    )}

                    {quiz.status === 'in_progress' ? (
                      <button className="btn-primary btn-sm">
                        <Play className="w-4 h-4" />
                        Continue
                      </button>
                    ) : (
                      <button className="btn-outline btn-sm">
                        <ArrowRight className="w-4 h-4" />
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
