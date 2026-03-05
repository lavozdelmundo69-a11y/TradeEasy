// Constants para TradeEasy

export const COLORS = {
  primary: '#6C5CE7',
  primaryDark: '#5541D9',
  secondary: '#00CEC9',
  success: '#00B894',
  error: '#FF6B6B',
  warning: '#FDCB6E',
  
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceDark: '#2D3436',
  
  text: '#2D3436',
  textLight: '#636E72',
  textInverse: '#FFFFFF',
  
  // Level colors
  level1: '#00CEC9',
  level2: '#6C5CE7',
  level3: '#FDCB6E',
  
  // Status
  streak: '#FF7675',
  xp: '#FDCB6E',
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
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
