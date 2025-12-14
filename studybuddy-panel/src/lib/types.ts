// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role?: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Course Types
export interface CourseListDto {
  courseId: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  level: string;
  category?: string;
  estimatedDurationHours?: number;
  createdAt: string;
  enrollmentCount: number;
  isPublished: boolean;
}

export interface LessonDto {
  lessonId: number;
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  contentType: "text" | "video" | "pdf" | "interactive";
  orderIndex: number;
  duration?: number;
  isCompleted?: boolean;
}

export interface CreateModuleRequest {
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface UpdateModuleRequest {
  moduleId: number;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface CreateLessonRequest {
  moduleId: number;
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  contentType: "text" | "video" | "pdf" | "interactive";
  orderIndex: number;
  duration?: number;
}

export interface UpdateLessonRequest {
  lessonId: number;
  title: string;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  contentType: "text" | "video" | "pdf" | "interactive";
  orderIndex: number;
  duration?: number;
}

// Quiz Management Types
export interface CreateQuizRequest {
  courseId: number;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
  questionText: string;
  questionType: "MultipleChoice";
  points: number;
  orderIndex: number;
  options: CreateQuestionOptionRequest[];
}

export interface CreateQuestionOptionRequest {
  optionText: string;
  orderIndex: number;
  isCorrect: boolean;
}

export interface UpdateQuizRequest {
  quizId: number;
  title: string;
  description?: string;
  courseId?: number;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  isActive: boolean;
}

// Admin User Management Types
export interface AdminUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ModuleDto {
  moduleId: number;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: LessonDto[];
}

export interface CourseDetailDto {
  courseId: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  level: string;
  category?: string;
  estimatedDurationHours?: number;
  prerequisites?: string;
  learningObjectives?: string;
  isPublished: boolean;
  createdAt: string;
  enrollmentCount: number;
  modules: ModuleDto[];
}

// Enrollment Types
export interface EnrollmentRequest {
  courseId: number;
}

export interface EnrollmentResponse {
  enrollmentId: number;
  courseId: number;
  studentId: number;
  enrolledAt: string;
  status: string;
  course?: CourseListDto;
  progressPercentage?: number;
}

// Progress Types
export interface ProgressUpdateRequest {
  lessonId: number;
  isCompleted: boolean;
}

export interface ProgressResponse {
  courseId: number;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lastAccessedAt?: string;
}

// Quiz Types
export interface QuestionOptionDto {
  isCorrect: any;
  optionId: number;
  optionText: string;
  orderIndex: number;
}

export interface QuestionDto {
  questionId: number;
  questionText: string;
  questionType: string;
  points: number;
  orderIndex: number;
  options: QuestionOptionDto[];
}

export interface QuizDto {
  isActive: boolean;
  courseId: number;
  quizId: number;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  questions: QuestionDto[];
}

export interface QuizAnswerDto {
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
}

export interface QuizSubmissionRequest {
  quizId: number;
  answers: QuizAnswerDto[];
}

export interface QuestionResultDto {
  questionId: number;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  pointsTotal: number;
}

export interface QuizResultDto {
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
  questionResults: QuestionResultDto[];
}

export interface QuizAttemptDto {
  attemptId: number;
  quizId: number;
  attemptNumber: number;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
}

// Certificate Types
export interface CertificateDto {
  certificateId: number;
  certificateNumber: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  issuedAt: string;
  certificateUrl?: string;
}

// Chat Types
export interface ChatSessionDto {
  sessionId: number;
  studentId: number;
  studentName: string;
  courseId?: number;
  courseName?: string;
  startedAt: string;
  endedAt?: string;
  status: string;
  totalMessages: number;
}

export interface ChatMessageDto {
  messageId: number;
  sessionId: number;
  senderType: string; // 'Student' or 'AI'
  senderUserId?: number;
  senderName: string;
  messageText: string;
  messageType: string;
  sentAt: string;
}

export interface SendMessageResponseDto {
  userMessage: ChatMessageDto;
  aiResponse: ChatMessageDto;
}

export interface ChatHistoryResponseDto {
  messages: ChatMessageDto[];
  session: ChatSessionDto;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateChatSessionRequest {
  studentId: number;
  courseId?: number;
  initialMessage?: string;
}

export interface SendMessageRequest {
  sessionId: number;
  messageText: string;
  messageType?: string;
}

export interface GetChatHistoryRequest {
  sessionId: number;
  pageNumber?: number;
  pageSize?: number;
}
