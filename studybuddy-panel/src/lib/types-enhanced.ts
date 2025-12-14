// Enhanced interfaces for comprehensive progress tracking
export interface DetailedProgressResponse {
  courseId: number;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lastAccessedAt?: string;
  modulesCompleted: number;
  totalModules: number;
  averageQuizScore: number;
  totalQuizzesTaken: number;
  timeSpent: number; // in minutes
  streak: number; // consecutive days
  lastActivityDate: string;
  nextLessonId?: number;
  courseThumbnail?: string;
  completionDate?: string;
  certificatesEarned: number;
}

export interface LearningGoal {
  goalId: number;
  title: string;
  description: string;
  type: "lessons" | "courses" | "time" | "streak" | "quiz_score";
  target: number;
  current: number;
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Achievement {
  achievementId: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  earnedAt?: string;
  progress: number;
  target: number;
  isEarned: boolean;
}

export interface WeeklyProgressData {
  date: string;
  lessonsCompleted: number;
  timeSpent: number;
  quizzesCompleted: number;
  streak: number;
}

export interface ProgressAnalytics {
  totalTimeSpent: number;
  averageSessionTime: number;
  mostActiveTime: string;
  completionRate: number;
  skillLevels: { [key: string]: number };
  learningVelocity: number; // lessons per week
  recommendedActions: string[];
}

// Export for backward compatibility
export * from "./types";
