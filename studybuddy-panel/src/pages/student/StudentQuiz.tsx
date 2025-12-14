import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { certificatesService } from "@/services/api/certificates.service";
import { apiClient } from "@/lib/api.config";

interface QuestionOption {
  optionId: number;
  optionText: string;
  isCorrect?: boolean;
  sequenceOrder?: number;
}

interface Question {
  questionId: number;
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOption[];
  sequenceOrder?: number;
}

interface Quiz {
  quizId: number;
  courseId: number;
  title: string;
  description?: string;
  totalQuestions: number;
  durationMinutes?: number;
  passingPercentage: number;
  questions: Question[];
  allowRetake?: boolean;
  maxAttempts?: number;
}

interface QuizAttempt {
  attemptId?: number;
  quizId: number;
  studentId: number;
  courseId: number;
  answers: StudentAnswer[];
  totalScore?: number;
  maxScore?: number;
  percentageScore?: number;
  status: "in-progress" | "submitted" | "graded";
}

interface StudentAnswer {
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
}

interface QuizResult {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  attemptedAt: string;
  submittedAt: string;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  isPassed: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  canRetake: boolean;
  certificateIssued?: boolean;
  questionResults: QuestionResult[];
}

interface QuestionResult {
  questionId: number;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  pointsTotal: number;
}

export default function StudentQuizComponent() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number | string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (quizId) {
      fetchQuiz(parseInt(quizId));
    }
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || !quiz?.durationMinutes || quizResult) return;

    if (timeRemaining === null) {
      setTimeRemaining(quiz.durationMinutes * 60); // Convert to seconds
    }

    if (timeRemaining && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      toast({
        variant: "destructive",
        title: "Time's up!",
        description: "Submitting your answers...",
      });
      handleSubmitQuiz();
    }
  }, [timeRemaining, quizStarted, quiz?.durationMinutes, quizResult]);

  const fetchQuiz = async (id: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`quizzes/${id}`);
      console.log("Quiz data:", response.data);
      console.log("Questions:", response.data.questions);
      setQuiz(response.data);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load quiz",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionId: number) => {
    const newAnswers = new Map(answers);
    newAnswers.set(
      quiz!.questions[currentQuestionIndex].questionId,
      optionId
    );
    setAnswers(newAnswers);
  };

  const handleAnswerText = (text: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(quiz!.questions[currentQuestionIndex].questionId, text);
    setAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !courseId) return;

    setSubmitting(true);
    try {
      const answersList = Array.from(answers.entries()).map(([qId, answer]) => ({
        questionId: qId,
        selectedOptionId: typeof answer === "number" ? answer : null,
        textAnswer: typeof answer === "string" ? answer : null,
      }));

      const response = await apiClient.post(`quizzes/${quiz.quizId}/submit`, {
        quizId: quiz.quizId,
        answers: answersList,
      });

      const data = response.data;
      if (response.status === 200) {
        setQuizResult(data);
        if (data.isPassed) {
          const message = data.certificateIssued
            ? `You passed with ${data.percentageScore.toFixed(1)}% and earned a certificate!`
            : `You passed with ${data.percentageScore.toFixed(1)}%! Certificate will be issued shortly.`;

          toast({
            title: "Congratulations!",
            description: message,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Quiz Failed",
            description: `You scored ${data.percentageScore.toFixed(1)}%. Passing score is ${quiz.passingPercentage}%`,
          });
        }
      } else {
        throw new Error("Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit quiz",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertCircle className="w-8 h-8 text-red-600 mr-2" />
        <p>Quiz not found</p>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto my-8 space-y-6">
        <div className="border rounded-lg p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}

          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Questions</div>
              <div className="text-2xl font-bold">{quiz.totalQuestions}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Time Limit</div>
              <div className="text-2xl font-bold">
                {quiz.durationMinutes || "Unlimited"}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Pass Rate</div>
              <div className="text-2xl font-bold">{quiz.passingPercentage}%</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              You must score at least {quiz.passingPercentage}% to pass this quiz.
            </p>
          </div>

          <button
            onClick={() => setQuizStarted(true)}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizResult) {
    return (
      <div className="max-w-2xl mx-auto my-8 space-y-6">
        {/* Result Summary */}
        <div className={`border-2 rounded-lg p-8 text-center space-y-4 ${quizResult.isPassed
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
          }`}>
          <div className="flex justify-center">
            {quizResult.isPassed ? (
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            ) : (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>

          <h2 className={`text-3xl font-bold ${quizResult.isPassed ? "text-green-900" : "text-red-900"
            }`}>
            {quizResult.isPassed ? "Quiz Passed!" : "Quiz Failed"}
          </h2>

          <div className="text-4xl font-bold">
            {quizResult.percentageScore.toFixed(1)}%
          </div>

          <p className={`text-sm ${quizResult.isPassed ? "text-green-700" : "text-red-700"
            }`}>
            {quizResult.totalScore} out of {quizResult.maxScore} points
          </p>

          <p className="text-sm text-muted-foreground">
            Attempt {quizResult.attemptsUsed} of {quizResult.maxAttempts}
          </p>

          {!quizResult.isPassed && quizResult.canRetake && (
            <button
              onClick={() => {
                setAnswers(new Map());
                setCurrentQuestionIndex(0);
                setQuizStarted(true);
                setQuizResult(null);
                setTimeRemaining(quiz.durationMinutes ? quiz.durationMinutes * 60 : null);
              }}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Retake Quiz
            </button>
          )}
        </div>

        {/* Question Breakdown */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="font-bold text-lg">Answer Review</h3>
          <div className="space-y-4">
            {quizResult.questionResults.map((result, idx) => (
              <div key={result.questionId} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">Question {idx + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.questionText}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  {!result.isCorrect && (
                    <>
                      <p className="text-red-700">
                        Your answer: {result.studentAnswer || "Not answered"}
                      </p>
                      <p className="text-green-700">
                        Correct answer: {result.correctAnswer}
                      </p>
                    </>
                  )}
                  <p className="font-medium">
                    Points: {result.pointsEarned}/{result.pointsTotal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestion.questionId);
  const isAnswered = currentAnswer !== undefined;
  const allAnswered = answers.size === quiz.totalQuestions;

  return (
    <div className="max-w-3xl mx-auto my-8 space-y-6">
      {/* Header */}
      <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="font-bold">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.totalQuestions}
          </p>
        </div>
        {quiz.durationMinutes && (
          <div className={`text-right ${timeRemaining && timeRemaining < 300 ? "text-red-600" : ""}`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Time remaining</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round((answers.size / quiz.totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{
              width: `${(currentQuestionIndex + 1 / quiz.totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold">{currentQuestion.questionText}</h3>

        {currentQuestion.questionType === "MultipleChoice" ? (
          currentQuestion.options && currentQuestion.options.length > 0 ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.optionId}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.questionId}`}
                    checked={currentAnswer === option.optionId}
                    onChange={() => handleAnswerSelect(option.optionId)}
                    className="w-4 h-4"
                  />
                  <span>{option.optionText}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">No options available for this question.</p>
              <p className="text-sm text-yellow-600 mt-1">Question Type: {currentQuestion.questionType}</p>
            </div>
          )
        ) : (
          <textarea
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerText(e.target.value)}
            placeholder="Enter your answer here..."
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
          />
        )}

        <p className="text-sm text-muted-foreground">
          Points: {currentQuestion.points}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentQuestionIndex < quiz.totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting || !allAnswered}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-primary/50 font-medium flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </button>
        )}
      </div>

      {!allAnswered && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            You haven't answered all questions yet. Please answer all questions before submitting.
          </p>
        </div>
      )}
    </div>
  );
}

