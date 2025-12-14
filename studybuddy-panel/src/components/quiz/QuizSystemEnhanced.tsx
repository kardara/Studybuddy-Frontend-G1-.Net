import React, { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle,
    XCircle,
    Award,
    RotateCcw,
    Download,
    Share2,
    TrendingUp,
    Target,
    BookOpen,
    AlertCircle,
    PlayCircle,
    Pause,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import {
    QuizDto,
    QuizSubmissionRequest,
    QuizResultDto,
    QuizAttemptDto
} from '@/lib/types';
import { quizzesService } from '@/services/api/quizzes.service';
import { certificatesService } from '@/services/api/certificates.service';
import { ProgressBar } from '@/components/dashboard/ProgressBar';

interface QuizSystemEnhancedProps {
    quizId: number;
    onComplete?: (result: QuizResultDto) => void;
    showAnalytics?: boolean;
}

interface QuestionState {
    questionId: number;
    selectedOptionId?: number;
    answerText?: string;
    timeSpent: number;
    flagged: boolean;
}

export function QuizSystemEnhanced({ quizId, onComplete, showAnalytics = false }: QuizSystemEnhancedProps) {
    const [quiz, setQuiz] = useState<QuizDto | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<QuestionState[]>([]);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResultDto | null>(null);
    const [attempts, setAttempts] = useState<QuizAttemptDto[]>([]);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuizData();
    }, [quizId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (quizStarted && !quizCompleted && timeRemaining !== null && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev && prev <= 1) {
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev ? prev - 1 : null;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [quizStarted, quizCompleted, timeRemaining]);

    const loadQuizData = async () => {
        try {
            const [quizData, attemptsData] = await Promise.all([
                quizzesService.getQuiz(quizId),
                quizzesService.getQuizAttempts(quizId).catch(() => [])
            ]);

            setQuiz(quizData);
            setAttempts(attemptsData);

            // Initialize question states
            const initialQuestions: QuestionState[] = quizData.questions.map(q => ({
                questionId: q.questionId,
                timeSpent: 0,
                flagged: false
            }));
            setQuestions(initialQuestions);

            if (quizData.timeLimit) {
                setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
            }

        } catch (error) {
            console.error('Error loading quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        setQuizStarted(true);
        setCurrentQuestionIndex(0);
    };

    const handleAnswerChange = (questionId: number, answer: { selectedOptionId?: number; answerText?: string }) => {
        setQuestions(prev => prev.map(q =>
            q.questionId === questionId
                ? { ...q, ...answer }
                : q
        ));
    };

    const toggleFlag = (questionId: number) => {
        setQuestions(prev => prev.map(q =>
            q.questionId === questionId
                ? { ...q, flagged: !q.flagged }
                : q
        ));
    };

    const goToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const nextQuestion = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quiz) return;

        setIsSubmitting(true);
        try {
            const answers = questions.map(q => ({
                questionId: q.questionId,
                selectedOptionId: q.selectedOptionId,
                answerText: q.answerText
            }));

            const submission: QuizSubmissionRequest = {
                quizId: quiz.quizId,
                answers
            };

            const result = await quizzesService.submitQuiz(quiz.quizId, submission);
            setResult(result);
            setQuizCompleted(true);

            // Check if user passed and can get certificate
            if (result.passed) {
                // Auto-issue certificate if course is completed
                // This would typically be handled by the backend
            }

            onComplete?.(result);

            // Reload attempts to show latest
            const updatedAttempts = await quizzesService.getQuizAttempts(quiz.quizId);
            setAttempts(updatedAttempts);

        } catch (error) {
            console.error('Error submitting quiz:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getAnsweredCount = (): number => {
        return questions.filter(q => q.selectedOptionId !== undefined || q.answerText?.trim()).length;
    };

    const getFlaggedCount = (): number => {
        return questions.filter(q => q.flagged).length;
    };

    const downloadCertificate = async () => {
        if (!result?.passed) return;

        try {
            // This would trigger certificate download
            console.log('Downloading certificate...');
        } catch (error) {
            console.error('Error downloading certificate:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quiz Not Found</h3>
                <p className="text-muted-foreground">The requested quiz could not be loaded.</p>
            </div>
        );
    }

    // Quiz Completed State
    if (quizCompleted && result) {
        const passed = result.passed;
        return (
            <div className="max-w-2xl mx-auto">
                <div className="dashboard-card p-8 text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${passed ? 'bg-success/10' : 'bg-destructive/10'
                        }`}>
                        {passed ? (
                            <Award className="w-10 h-10 text-success" />
                        ) : (
                            <XCircle className="w-10 h-10 text-destructive" />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold mb-4">
                        {passed ? 'Congratulations!' : 'Quiz Completed'}
                    </h2>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{result.score}</div>
                            <div className="text-sm text-muted-foreground">Your Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{result.percentage}%</div>
                            <div className="text-sm text-muted-foreground">Percentage</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{quiz.questions.length}</div>
                            <div className="text-sm text-muted-foreground">Total Questions</div>
                        </div>
                    </div>

                    {passed ? (
                        <div className="space-y-4">
                            <p className="text-success font-medium">
                                You passed the quiz! A certificate will be issued shortly.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={downloadCertificate} className="btn-primary">
                                    <Download className="w-4 h-4" />
                                    Download Certificate
                                </button>
                                <button className="btn-outline">
                                    <Share2 className="w-4 h-4" />
                                    Share Achievement
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                You need {quiz.passingScore}% to pass. You can retake the quiz.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => {
                                        setQuizCompleted(false);
                                        setResult(null);
                                        setQuestions(questions.map(q => ({ ...q, selectedOptionId: undefined, answerText: undefined, flagged: false })));
                                        if (quiz.timeLimit) setTimeRemaining(quiz.timeLimit * 60);
                                    }}
                                    className="btn-primary"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Retake Quiz
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quiz Analytics */}
                    {showAnalytics && attempts.length > 1 && (
                        <div className="mt-8 pt-6 border-t border-border">
                            <h3 className="font-semibold mb-4">Performance History</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Best Score</div>
                                    <div className="font-medium">{Math.max(...attempts.map(a => a.score))}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Average Score</div>
                                    <div className="font-medium">
                                        {Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Attempts</div>
                                    <div className="font-medium">{attempts.length}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Pass Rate</div>
                                    <div className="font-medium">
                                        {Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Quiz Not Started State
    if (!quizStarted) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="dashboard-card p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
                        {quiz.description && (
                            <p className="text-muted-foreground">{quiz.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-primary">{quiz.questions.length}</div>
                            <div className="text-sm text-muted-foreground">Questions</div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-warning">{quiz.passingScore}%</div>
                            <div className="text-sm text-muted-foreground">To Pass</div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-success">{quiz.timeLimit || '∞'}</div>
                            <div className="text-sm text-muted-foreground">Minutes</div>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-chart-4">{quiz.maxAttempts || '∞'}</div>
                            <div className="text-sm text-muted-foreground">Max Attempts</div>
                        </div>
                    </div>

                    {attempts.length > 0 && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-semibold mb-2">Previous Attempts</h3>
                            <div className="space-y-2">
                                {attempts.slice(-3).map((attempt, index) => (
                                    <div key={attempt.attemptId} className="flex justify-between items-center text-sm">
                                        <span>Attempt {attempt.attemptNumber}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={attempt.passed ? 'text-success' : 'text-destructive'}>
                                                {attempt.percentage}%
                                            </span>
                                            <span className="text-muted-foreground">
                                                {new Date(attempt.completedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-center">
                        <button onClick={startQuiz} className="btn-primary btn-lg">
                            <PlayCircle className="w-5 h-5" />
                            Start Quiz
                        </button>
                        <p className="text-sm text-muted-foreground mt-3">
                            Make sure you have a stable internet connection before starting.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Active State
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentQuestionState = questions[currentQuestionIndex];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Quiz Header */}
            <div className="dashboard-card p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">{quiz.title}</h2>
                        <p className="text-sm text-muted-foreground">
                            Question {currentQuestionIndex + 1} of {quiz.questions.length}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {timeRemaining !== null && (
                            <div className={`flex items-center gap-2 ${timeRemaining < 300 ? 'text-destructive' : ''}`}>
                                <Clock className="w-4 h-4" />
                                <span className="font-mono font-medium">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        )}

                        <div className="text-sm text-muted-foreground">
                            {getAnsweredCount()}/{quiz.questions.length} answered
                        </div>

                        <div className="text-sm text-muted-foreground">
                            {getFlaggedCount()} flagged
                        </div>
                    </div>
                </div>

                <ProgressBar
                    value={((currentQuestionIndex + 1) / quiz.questions.length) * 100}
                    className="mt-3"
                    showLabel={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Navigator */}
                <div className="lg:col-span-1">
                    <div className="dashboard-card p-4">
                        <h3 className="font-semibold mb-3">Questions</h3>
                        <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                            {quiz.questions.map((_, index) => {
                                const questionState = questions[index];
                                const isAnswered = questionState.selectedOptionId !== undefined || questionState.answerText?.trim();
                                const isCurrent = index === currentQuestionIndex;
                                const isFlagged = questionState.flagged;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => goToQuestion(index)}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${isCurrent
                                            ? 'bg-primary text-primary-foreground'
                                            : isAnswered
                                                ? 'bg-success/10 text-success border border-success/20'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                            } ${isFlagged ? 'ring-2 ring-warning' : ''}`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Current Question */}
                <div className="lg:col-span-3">
                    <div className="dashboard-card p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold flex-1">
                                {currentQuestion.questionText}
                            </h3>
                            <button
                                onClick={() => toggleFlag(currentQuestion.questionId)}
                                className={`ml-4 p-2 rounded-lg transition-colors ${currentQuestionState.flagged
                                    ? 'bg-warning/10 text-warning'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                title={currentQuestionState.flagged ? 'Unflag question' : 'Flag for review'}
                            >
                                <AlertCircle className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {currentQuestion.options.map((option) => (
                                <label
                                    key={option.optionId}
                                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${currentQuestionState.selectedOptionId === option.optionId
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:bg-muted/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.questionId}`}
                                        value={option.optionId}
                                        checked={currentQuestionState.selectedOptionId === option.optionId}
                                        onChange={() => handleAnswerChange(currentQuestion.questionId, { selectedOptionId: option.optionId })}
                                        className="sr-only"
                                    />
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${currentQuestionState.selectedOptionId === option.optionId
                                        ? 'border-primary bg-primary'
                                        : 'border-muted-foreground'
                                        }`}>
                                        {currentQuestionState.selectedOptionId === option.optionId && (
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                    <span className="flex-1">{option.optionText}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <button
                                onClick={previousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="btn-outline"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </button>

                            <div className="flex gap-2">
                                {currentQuestionIndex === quiz.questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmitQuiz}
                                        disabled={isSubmitting}
                                        className="btn-primary"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={nextQuestion}
                                        className="btn-primary"
                                    >
                                        Next
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}