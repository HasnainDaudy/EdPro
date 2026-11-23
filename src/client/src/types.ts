export interface User {
  id: string;
  username: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  displayName: string;
  age?: number;
  ageTrack?: 'early_childhood_6_9' | 'middle_school_10_13' | 'high_school_14_17';
  passionTrack?: string;
  focusArtRatio?: number;
  focusMathRatio?: number;
  avatarSeed?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  age_track: string;
  passion_cluster: string;
  icon_name: string;
  badge_color: string;
  progress?: {
    currentLesson: number;
    completedLessons: number[];
    streakDays: number;
  };
}

export interface LessonSummary {
  id: string;
  course_id: string;
  lesson_number: number;
  title: string;
  duration_minutes: number;
  spark_hook: string;
  objective: string;
  keyConcepts: string[];
  allowedVocab: string[];
  analogies: string[];
  simulation_type: string;
}

export interface LessonDetail {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonNumber: number;
  title: string;
  durationMinutes: number;
  sparkHook: string;
  objective: string;
  keyConcepts: string[];
  allowedVocab: string[];
  analogies: string[];
  readerContent: string;
  videoUrl?: string;
  videoTitle?: string;
  simulationType?: string;
  simulationConfig?: Record<string, any>;
  audioSummaryText?: string;
  worksheetTitle?: string;
  worksheetMarkdown?: string;
  pulseQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    hint: string;
  };
}

export interface MilestoneAssessment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  passingScore: number;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    correctIndex?: number;
  }>;
  performanceTask: {
    prompt: string;
    rubric: Array<{
      criteria: string;
      maxPoints: number;
      description: string;
    }>;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  suggestions?: string[];
  isBlockedAnswer?: boolean;
}

export type LLMProvider = 'offline' | 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
}
