// Constants centralizadas

export const COLORS = {
  // Primary palette
  primary: '#6C5CE7',
  primaryDark: '#5541D9',
  primaryLight: '#A29BFE',
  secondary: '#00CEC9',
  
  // Status
  success: '#00B894',
  successLight: '#E8F8F5',
  error: '#FF6B6B',
  errorLight: '#FDEDEC',
  warning: '#FDCB6E',
  warningLight: '#FEF9E7',
  
  // Neutrals
  background: '#F8F9FA',
  backgroundDark: '#1a1a2e',
  surface: '#FFFFFF',
  surfaceDark: '#2D3436',
  
  // Text
  text: '#2D3436',
  textLight: '#636E72',
  textMuted: '#B2BEC3',
  textInverse: '#FFFFFF',
  
  // Level colors
  level1: '#00CEC9',
  level2: '#6C5CE7',
  level3: '#FDCB6E',
  
  // Status colors
  streak: '#FF7675',
  xp: '#FDCB6E',
  
  // Chart colors
  candleGreen: '#00B894',
  candleRed: '#FF6B6B',
  supportLine: '#00B894',
  resistanceLine: '#FF6B6B',
  gridLine: '#2D3436',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const GAME_CONFIG = {
  xp: {
    lessonComplete: 50,
    exerciseCorrect: 10,
    streakBonus: 5,
    perfectLesson: 25,
  },
  levels: [
    { level: 1, minXP: 0, title: 'Novato', color: COLORS.level1 },
    { level: 2, minXP: 500, title: 'Aprendiz', color: COLORS.level2 },
    { level: 3, minXP: 1500, title: 'Analista', color: COLORS.secondary },
    { level: 4, minXP: 3500, title: 'Trader', color: COLORS.warning },
    { level: 5, minXP: 7000, title: 'Experto', color: COLORS.primary },
  ],
  streak: {
    maxDays: 365,
    freezeCost: 100,
  },
  achievements: [
    { id: 'first_lesson', type: 'lessons', value: 1, title: 'Primeros Pasos', icon: '🎯', reward: 50 },
    { id: 'ten_lessons', type: 'lessons', value: 10, title: 'Diez Lecciones', icon: '📚', reward: 100 },
    { id: 'week_streak', type: 'streak', value: 7, title: 'Semana Ganadora', icon: '🔥', reward: 200 },
    { id: 'month_streak', type: 'streak', value: 30, title: 'Mes de Fuego', icon: '⚡', reward: 500 },
    { id: 'perfect_quiz', type: 'perfect_quiz', value: 1, title: 'Exacto', icon: '💯', reward: 75 },
    { id: 'streak_5', type: 'streak', value: 5, title: 'Racha de 5', icon: '🌟', reward: 100 },
  ],
};

export const STORAGE_KEYS = {
  USER_PROGRESS: '@tradeeasy_user',
  CONTENT_CACHE: '@tradeeasy_cache',
  SETTINGS: '@tradeeasy_settings',
};

export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  spring: {
    damping: 15,
    stiffness: 150,
  },
};
