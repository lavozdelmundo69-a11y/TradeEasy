// Store simplificado sin problemas de renderizado
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, Achievement, AchievementProgress } from '../types';
import { GAME_CONFIG } from '../shared/constants';

const STORAGE_KEY = '@tradeeasy_user';

interface UserState extends UserProgress {
  achievementsProgress: AchievementProgress[];
  isHydrated: boolean;
}

interface UserActions {
  addXP: (amount: number) => void;
  getCurrentLevelConfig: () => typeof GAME_CONFIG.levels[0];
  getXPToNextLevel: () => number;
  getProgressToNextLevel: () => number;
  completeLesson: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  correctAnswer: () => void;
  wrongAnswer: () => void;
  getAccuracy: () => number;
  updateStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  loadProgress: () => void;
  resetProgress: () => void;
}

const initialState: UserState = {
  userId: '1',
  currentStreak: 0,
  maxStreak: 0,
  totalXP: 0,
  level: 1,
  lessonsCompleted: [],
  exercisesCompleted: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  lastActiveDate: '',
  achievements: [],
  achievementsProgress: [],
  isHydrated: false,
};

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  ...initialState,

  loadProgress: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({ 
          ...parsed, 
          isHydrated: true 
        });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  addXP: (amount: number) => {
    const state = get();
    const newXP = state.totalXP + amount;
    let newLevel = state.level;
    
    for (const lvl of GAME_CONFIG.levels) {
      if (newXP >= lvl.minXP) {
        newLevel = lvl.level;
      }
    }
    
    set({ totalXP: newXP, level: newLevel });
    
    // Guardar en background
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      totalXP: newXP,
      level: newLevel,
    })).catch(() => {});
  },

  getCurrentLevelConfig: () => {
    const level = get().level;
    return GAME_CONFIG.levels.find((l) => l.level === level) || GAME_CONFIG.levels[0];
  },

  getXPToNextLevel: () => {
    const { totalXP, level } = get();
    const next = GAME_CONFIG.levels.find((l) => l.level === level + 1);
    return next ? next.minXP - totalXP : 0;
  },

  getProgressToNextLevel: () => {
    const { totalXP, level } = get();
    const current = GAME_CONFIG.levels.find((l) => l.level === level);
    const next = GAME_CONFIG.levels.find((l) => l.level === level + 1);
    if (!next) return 100;
    
    const levelXP = current?.minXP || 0;
    const xpInLevel = totalXP - levelXP;
    const xpNeeded = next.minXP - levelXP;
    
    return Math.min(100, (xpInLevel / xpNeeded) * 100);
  },

  completeLesson: (lessonId: string) => {
    const state = get();
    if (state.lessonsCompleted.includes(lessonId)) return;
    
    const newLessons = [...state.lessonsCompleted, lessonId];
    set({ lessonsCompleted: newLessons });
    
    // Actualizar racha
    const today = new Date().toISOString().split('T')[0];
    if (state.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = 1;
      if (state.lastActiveDate === yesterdayStr) {
        newStreak = state.currentStreak + 1;
      }
      
      set({
        currentStreak: newStreak,
        maxStreak: Math.max(state.maxStreak, newStreak),
        lastActiveDate: today,
      });
    }
    
    // Guardar
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      lessonsCompleted: newLessons,
    })).catch(() => {});
  },

  isLessonCompleted: (lessonId: string) => {
    return get().lessonsCompleted.includes(lessonId);
  },

  correctAnswer: () => {
    set((state) => ({
      correctAnswers: state.correctAnswers + 1,
      totalAnswers: state.totalAnswers + 1,
      exercisesCompleted: state.exercisesCompleted + 1,
    }));
  },

  wrongAnswer: () => {
    set((state) => ({
      totalAnswers: state.totalAnswers + 1,
      exercisesCompleted: state.exercisesCompleted + 1,
    }));
  },

  getAccuracy: () => {
    const { correctAnswers, totalAnswers } = get();
    if (totalAnswers === 0) return 0;
    return Math.round((correctAnswers / totalAnswers) * 100);
  },

  updateStreak: () => {
    // Ya se hace en completeLesson
  },

  unlockAchievement: (achievementId: string) => {
    const state = get();
    if (state.achievements.includes(achievementId)) return;
    
    const newAchievements = [...state.achievements, achievementId];
    set({ achievements: newAchievements });
    
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      achievements: newAchievements,
    })).catch(() => {});
  },

  resetProgress: () => {
    set(initialState);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  },
}));

// Selectores optimizados
export const useUserProgress = () => useUserStore(state => ({
  totalXP: state.totalXP,
  level: state.level,
  lessonsCompleted: state.lessonsCompleted,
  currentStreak: state.currentStreak,
}));

export const useLessonProgress = (lessonId: string) => 
  useUserStore(state => state.lessonsCompleted.includes(lessonId));

export const useXPProgress = () => {
  const totalXP = useUserStore(state => state.totalXP);
  const level = useUserStore(state => state.level);
  
  const lastLevel = GAME_CONFIG.levels[GAME_CONFIG.levels.length - 1];
  const isMaxLevel = totalXP >= lastLevel.minXP;
  
  const current = GAME_CONFIG.levels.find(l => l.level === level);
  const next = GAME_CONFIG.levels.find(l => l.level === level + 1);
  
  return {
    xpToNext: isMaxLevel ? 0 : (next?.minXP || 0) - totalXP,
    progress: isMaxLevel ? 100 : current && next 
      ? ((totalXP - current.minXP) / (next.minXP - current.minXP)) * 100
      : 100,
  };
};

export const useIsHydrated = () => useUserStore(state => state.isHydrated);
