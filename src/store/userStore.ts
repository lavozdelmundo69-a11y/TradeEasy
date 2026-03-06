// Store de Zustand mejorado con estructura de slices
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, Achievement, AchievementProgress } from '../types';
import { GAME_CONFIG } from '../shared/constants';

// ==================== STATE ====================

interface UserState extends UserProgress {
  achievementsProgress: AchievementProgress[];
  isHydrated: boolean; // Track if AsyncStorage has loaded
}

// ==================== ACTIONS ====================

interface UserActions {
  addXP: (amount: number) => void;
  getCurrentLevelConfig: () => typeof GAME_CONFIG.levels[0];
  getXPToNextLevel: () => number;
  getProgressToNextLevel: () => number;
  completeLesson: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  getNextLesson: (allLessons: { id: string }[]) => { id: string } | null;
  correctAnswer: () => void;
  wrongAnswer: () => void;
  getAccuracy: () => number;
  updateStreak: () => void;
  getStreakStatus: () => { active: boolean; days: number; max: number };
  checkAchievements: () => AchievementProgress[];
  unlockAchievement: (achievementId: string) => void;
  getUnlockedAchievements: () => Achievement[];
  loadProgress: () => Promise<void>;
  resetProgress: () => void;
  setHydrated: (hydrated: boolean) => void;
}

// ==================== HELPERS ====================

const getToday = () => new Date().toISOString().split('T')[0];

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

// ==================== STORAGE HELPERS ====================

const STORAGE_KEY = '@tradeeasy_user';

const saveToStorage = async (data: Partial<UserProgress>) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to AsyncStorage:', error);
  }
};

const loadFromStorage = async (): Promise<Partial<UserProgress> | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.warn('Failed to load from AsyncStorage:', error);
    return null;
  }
};

// ==================== STORE ====================

export const useUserStore = create<UserState & UserActions>()(
  (set, get) => ({
    ...initialState,

    setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),

    loadProgress: async () => {
      try {
        const saved = await loadFromStorage();
        if (saved) {
          set({ 
            ...initialState,
            ...saved,
            isHydrated: true,
          });
        } else {
          set({ isHydrated: true });
        }
      } catch (error) {
        console.warn('Error loading progress:', error);
        set({ isHydrated: true });
      }
    },

    addXP: (amount: number) => {
      set((state) => {
        const newXP = state.totalXP + amount;
        let newLevel = state.level;
        
        for (const lvl of GAME_CONFIG.levels) {
          if (newXP >= lvl.minXP) {
            newLevel = lvl.level;
          }
        }
        
        const newState = { totalXP: newXP, level: newLevel };
        saveToStorage(newState);
        return newState;
      });
    },

    getCurrentLevelConfig: () => {
      const state = get();
      return GAME_CONFIG.levels.find((l) => l.level === state.level) || GAME_CONFIG.levels[0];
    },

    getXPToNextLevel: () => {
      const state = get();
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

    completeLesson: (lessonId: string) => {
      set((state) => {
        if (state.lessonsCompleted.includes(lessonId)) {
          return state;
        }
        const newState = {
          lessonsCompleted: [...state.lessonsCompleted, lessonId],
        };
        saveToStorage(newState);
        return newState;
      });
      get().updateStreak();
    },

    isLessonCompleted: (lessonId: string) => {
      return get().lessonsCompleted.includes(lessonId);
    },

    getNextLesson: (allLessons) => {
      const completed = get().lessonsCompleted;
      return allLessons.find(l => !completed.includes(l.id)) || null;
    },

    correctAnswer: () => {
      set((state) => {
        const newState = {
          correctAnswers: state.correctAnswers + 1,
          totalAnswers: state.totalAnswers + 1,
          exercisesCompleted: state.exercisesCompleted + 1,
        };
        saveToStorage(newState);
        return newState;
      });
    },

    wrongAnswer: () => {
      set((state) => {
        const newState = {
          totalAnswers: state.totalAnswers + 1,
          exercisesCompleted: state.exercisesCompleted + 1,
        };
        saveToStorage(newState);
        return newState;
      });
    },

    getAccuracy: () => {
      const { correctAnswers, totalAnswers } = get();
      if (totalAnswers === 0) return 0;
      return Math.round((correctAnswers / totalAnswers) * 100);
    },

    updateStreak: () => {
      const today = getToday();
      set((state) => {
        if (state.lastActiveDate === today) {
          return state;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = 1;
        if (state.lastActiveDate === yesterdayStr) {
          newStreak = state.currentStreak + 1;
        }
        
        const newState = {
          currentStreak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lastActiveDate: today,
        };
        saveToStorage(newState);
        return newState;
      });
    },

    getStreakStatus: () => {
      const { currentStreak, maxStreak, lastActiveDate } = get();
      const today = getToday();
      const active = lastActiveDate === today || lastActiveDate === getYesterday();
      return { active, days: currentStreak, max: maxStreak };
    },

    checkAchievements: () => {
      const state = get();
      const progress: AchievementProgress[] = [];
      
      GAME_CONFIG.achievements.forEach(achievement => {
        if (state.achievements.includes(achievement.id)) {
          progress.push({ achievementId: achievement.id, progress: 100, unlockedAt: new Date().toISOString() });
          return;
        }

        let currentProgress = 0;
        switch (achievement.type) {
          case 'lessons':
            currentProgress = (state.lessonsCompleted.length / achievement.value) * 100;
            break;
          case 'streak':
            currentProgress = (state.currentStreak / achievement.value) * 100;
            break;
          case 'total_xp':
            currentProgress = (state.totalXP / achievement.value) * 100;
            break;
        }

        progress.push({ 
          achievementId: achievement.id, 
          progress: Math.min(100, currentProgress),
        });

        if (currentProgress >= 100) {
          get().unlockAchievement(achievement.id);
          get().addXP(achievement.reward);
        }
      });

      set({ achievementsProgress: progress });
      return progress;
    },

    unlockAchievement: (achievementId: string) => {
      set((state) => {
        if (state.achievements.includes(achievementId)) {
          return state;
        }
        const newState = { achievements: [...state.achievements, achievementId] };
        saveToStorage(newState);
        return newState;
      });
    },

    getUnlockedAchievements: () => {
      const unlocked = get().achievements;
      return GAME_CONFIG.achievements.filter(a => unlocked.includes(a.id));
    },

    resetProgress: () => {
      set(initialState);
      saveToStorage({} as Partial<UserProgress>);
    },
  })
);

// Helper
function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Selectores memoizados
export const useUserProgress = () => useUserStore(state => ({
  totalXP: state.totalXP,
  level: state.level,
  lessonsCompleted: state.lessonsCompleted,
  currentStreak: state.currentStreak,
  isHydrated: state.isHydrated,
}));

export const useLessonProgress = (lessonId: string) => useUserStore(
  state => state.lessonsCompleted.includes(lessonId)
);

export const useXPProgress = () => useUserStore(state => {
  const lastLevel = GAME_CONFIG.levels[GAME_CONFIG.levels.length - 1];
  const isMaxLevel = state.totalXP >= lastLevel.minXP;
  
  const current = GAME_CONFIG.levels.find(l => l.level === state.level);
  const next = GAME_CONFIG.levels.find(l => l.level === state.level + 1);
  
  return {
    xpToNext: isMaxLevel ? 0 : (next?.minXP || 0) - state.totalXP,
    progress: isMaxLevel ? 100 : current && next 
      ? ((state.totalXP - current.minXP) / (next.minXP - current.minXP)) * 100
      : 100,
  };
});

export const useIsHydrated = () => useUserStore(state => state.isHydrated);
