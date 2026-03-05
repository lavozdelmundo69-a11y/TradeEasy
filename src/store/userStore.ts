// User Store - Zustand para progreso del usuario

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, Level } from '../types';
import { GAME_CONFIG } from '../constants';

interface UserStore extends UserProgress {
  // Actions
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  correctAnswer: () => void;
  wrongAnswer: () => void;
  updateStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  resetProgress: () => void;
  loadProgress: () => Promise<void>;
  getCurrentLevel: () => Level;
  getXPToNextLevel: () => number;
  getProgressToNextLevel: () => number;
  saveProgress: () => Promise<void>;
}

const getToday = () => new Date().toISOString().split('T')[0];

const initialState: UserProgress = {
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
};

export const useUserStore = create<UserStore>((set, get) => ({
  ...initialState,

  addXP: (amount: number) => {
    set((state) => {
      const newXP = state.totalXP + amount;
      let newLevel = state.level;
      
      // Check for level up
      for (const lvl of GAME_CONFIG.levels) {
        if (newXP >= lvl.minXP) {
          newLevel = lvl.level;
        }
      }
      
      return { totalXP: newXP, level: newLevel };
    });
    get().saveProgress();
  },

  completeLesson: (lessonId: string) => {
    set((state) => {
      if (state.lessonsCompleted.includes(lessonId)) {
        return state;
      }
      return {
        lessonsCompleted: [...state.lessonsCompleted, lessonId],
      };
    });
    get().updateStreak();
    get().saveProgress();
  },

  correctAnswer: () => {
    set((state) => ({
      correctAnswers: state.correctAnswers + 1,
      totalAnswers: state.totalAnswers + 1,
      exercisesCompleted: state.exercisesCompleted + 1,
    }));
    get().saveProgress();
  },

  wrongAnswer: () => {
    set((state) => ({
      totalAnswers: state.totalAnswers + 1,
      exercisesCompleted: state.exercisesCompleted + 1,
    }));
    get().saveProgress();
  },

  updateStreak: () => {
    const today = getToday();
    set((state) => {
      if (state.lastActiveDate === today) {
        return state; // Already active today
      }
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = 1;
      if (state.lastActiveDate === yesterdayStr) {
        newStreak = state.currentStreak + 1;
      }
      
      return {
        currentStreak: newStreak,
        maxStreak: Math.max(state.maxStreak, newStreak),
        lastActiveDate: today,
      };
    });
  },

  unlockAchievement: (achievementId: string) => {
    set((state) => {
      if (state.achievements.includes(achievementId)) {
        return state;
      }
      return { achievements: [...state.achievements, achievementId] };
    });
    get().saveProgress();
  },

  resetProgress: () => {
    set(initialState);
    get().saveProgress();
  },

  loadProgress: async () => {
    try {
      const saved = await AsyncStorage.getItem('@tradeeasy_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ ...initialState, ...parsed });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  },

  getCurrentLevel: () => {
    const state = get();
    return GAME_CONFIG.levels.find((l) => l.level === state.level) || GAME_CONFIG.levels[0];
  },

  getXPToNextLevel: () => {
    const state = get();
    const currentLevelConfig = GAME_CONFIG.levels.find((l) => l.level === state.level);
    const nextLevelConfig = GAME_CONFIG.levels.find((l) => l.level === state.level + 1);
    
    if (!nextLevelConfig) return 0;
    
    return nextLevelConfig.minXP - state.totalXP;
  },

  getProgressToNextLevel: () => {
    const state = get();
    const currentLevelConfig = GAME_CONFIG.levels.find((l) => l.level === state.level);
    const nextLevelConfig = GAME_CONFIG.levels.find((l) => l.level === state.level + 1);
    
    if (!nextLevelConfig) return 100;
    
    const levelXP = currentLevelConfig?.minXP || 0;
    const xpInLevel = state.totalXP - levelXP;
    const xpNeeded = nextLevelConfig.minXP - levelXP;
    
    return Math.min(100, (xpInLevel / xpNeeded) * 100);
  },

  saveProgress: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem('@tradeeasy_user', JSON.stringify({
        userId: state.userId,
        currentStreak: state.currentStreak,
        maxStreak: state.maxStreak,
        totalXP: state.totalXP,
        level: state.level,
        lessonsCompleted: state.lessonsCompleted,
        exercisesCompleted: state.exercisesCompleted,
        correctAnswers: state.correctAnswers,
        totalAnswers: state.totalAnswers,
        lastActiveDate: state.lastActiveDate,
        achievements: state.achievements,
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },
}));
