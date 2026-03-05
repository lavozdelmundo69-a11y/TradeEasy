// Types para TradeEasy

export interface UserProgress {
  userId: string;
  currentStreak: number;
  maxStreak: number;
  totalXP: number;
  level: number;
  lessonsCompleted: string[];
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  lastActiveDate: string;
  achievements: string[];
}

export interface Lesson {
  id: string;
  level: 1 | 2 | 3;
  levelName: string;
  title: string;
  description: string;
  duration: number;
  xpReward: number;
  order: number;
  explanation: ExplanationBlock[];
  example: ExampleBlock;
  exercise: Exercise;
  summary: string;
  requiredLessonIds?: string[];
}

export interface ExplanationBlock {
  type: 'text' | 'tip' | 'warning' | 'chart';
  content: string;
}

export interface ExampleBlock {
  title: string;
  description: string;
  chartData?: ChartDataPoint[];
  scenario?: string;
}

export interface ChartDataPoint {
  open: number;
  close: number;
  high: number;
  low: number;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  scenario?: MarketScenario;
  options: string[];
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

export interface Level {
  level: number;
  title: string;
  minXP: number;
  color: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
}
