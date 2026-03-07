// Types centralizados para la app

// ==================== LECCIONES ====================

export interface Lesson {
  id: string;
  level: 1 | 2 | 3;
  levelName: string;
  title: string;
  description: string;
  duration: number;
  xpReward: number;
  order: number;
  explanation: readonly ExplanationBlock[];
  example: Readonly<ExampleBlock>;
  exercise: Readonly<Exercise>;
  summary: string;
  requiredLessonIds?: readonly string[];
}

export interface ExplanationBlock {
  type: 'text' | 'tip' | 'warning' | 'chart';
  content: string;
}

export interface ExampleBlock {
  title: string;
  description: string;
  chartData?: readonly ChartDataPoint[];
  scenario?: string;
}

export interface ChartDataPoint {
  open: number;
  close: number;
  high: number;
  low: number;
}

// ==================== EJERCICIOS MEJORADOS ====================

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  scenario?: MarketScenario;
  options: readonly string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Feedback educativo completo (opcional para compatibilidad)
  feedback?: ExerciseFeedback;
  
  // Para spaced repetition
  topic?: string;
  relatedLessons?: string[];
  
  // Legacy: explicación simple (usar feedback en su lugar)
  explanation?: string;
  
  // Gráfico visual para preguntas
  chart?: CandleChartData;
}

export interface CandleChartData {
  candles: readonly Candle[];
  trend?: 'up' | 'down' | 'sideways';
  highlightIndex?: number;
}

export interface ExerciseFeedback {
  // Feedback básico
  shortExplanation: string;
  
  // Por qué cada opción es correcta/incorrecta
  optionExplanations?: readonly OptionExplanation[];
  
  // Error común relacionado
  commonMistake?: CommonMistake;
  
  // Consejo actionable
  tip?: string;
  
  // Contexto de mercado adicional
  marketContext?: string;
}

export interface OptionExplanation {
  optionIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface CommonMistake {
  title: string;
  description: string;
  whyWrong: string;
}

export type ExerciseType =
  | 'concept-quiz'
  | 'trend-identification'
  | 'trading-decision'
  | 'candle-interpretation'
  | 'market-scenario';

export interface MarketScenario {
  trend?: 'up' | 'down' | 'sideways';
  priceAction?: string;
  keyLevel?: 'support' | 'resistance';
  candlePattern?: string;
  description: string;
}

// ==================== NIVELES Y PROGRESO ====================

export interface Level {
  level: number;
  title: string;
  minXP: number;
  color: string;
}

export interface LevelStructure {
  id: string;
  level: number;
  title: string;
  description: string;
  modules: readonly ModuleStructure[];
  minXP: number;
  color: string;
}

export interface ModuleStructure {
  id: string;
  title: string;
  lessons: readonly string[];
  file: string;
}

// ==================== USUARIO ====================

export interface UserProgress {
  userId: string;
  currentStreak: number;
  maxStreak: number;
  totalXP: number;
  level: number;
  lessonsCompleted: readonly string[];
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  lastActiveDate: string;
  achievements: readonly string[];
}

// ==================== GAMIFICACIÓN ====================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: AchievementRequirement;
  reward: number;
}

export interface AchievementRequirement {
  type: 'streak' | 'lessons' | 'perfect_quiz' | 'consecutive_correct' | 'total_xp';
  value: number;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  unlockedAt?: string;
}

// ==================== TRADING ====================

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketData {
  symbol: string;
  candles: readonly Candle[];
  supportLevels: readonly number[];
  resistanceLevels: readonly number[];
}

// ==================== SPACED REPETITION ====================

export interface WeakConcept {
  conceptId: string;
  topic: string;
  errorCount: number;
  lastError: string;
  nextReviewAt: string;
  masteryLevel: number;
}

export interface QuizHistory {
  exerciseId: string;
  answeredAt: string;
  wasCorrect: boolean;
  selectedAnswer: number;
  timeSpentSeconds: number;
}

export interface TopicProgress {
  topic: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  weakConcepts: string[];
}

// ==================== CONTENIDO ====================

export interface ContentManifest {
  version: string;
  updatedAt: string;
  levels: readonly LevelStructure[];
}

export interface SearchIndex {
  index: Record<string, readonly string[]>;
  tags: Record<string, readonly string[]>;
}
