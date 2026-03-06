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

// ==================== EJERCICIOS ====================

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  scenario?: MarketScenario;
  options: readonly string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
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
  progress: number; // 0-100
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
