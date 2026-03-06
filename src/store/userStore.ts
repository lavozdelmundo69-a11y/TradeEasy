// Store de Zustand mejorado con estructura de slices
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, Achievement, AchievementProgress } from '../types';
import { GAME_CONFIG } from '../shared/constants';

// ==================== STATE ====================

interface UserState extends UserProgress {
  // Estado derivado
  achievementsProgress: AchievementProgress[];
}

// ==================== ACTIONS ====================

interface UserActions {
  // XP y nivel
  addXP: (amount: number) => void;
  getCurrentLevelConfig: () => typeof GAME_CONFIG.levels[0];
  getXPToNextLevel: () => number;
  getProgressToNextLevel: () => number;
  
  // Lecciones
  completeLesson: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  getNextLesson: (allLessons: { id: string }[]) => { id: string } | null;
  
  // Ejercicios
  correctAnswer: () => void;
  wrongAnswer: () => void;
  getAccuracy: () => number;
  
  // Rachas
  updateStreak: () => void;
  getStreakStatus: () => { active: boolean; days: number; max: number };
  
  // Logros
  checkAchievements: () => AchievementProgress[];
  unlockAchievement: (achievementId: string) => void;
  getUnlockedAchievements: () => Achievement[];
  
  // Persistencia
  loadProgress: () => Promise<void>;
  resetProgress: () => void;
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
};

// ==================== STORE ====================

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // XP y nivel
      addXP: (amount: number) => {
        set((state) => {
          const newXP = state.totalXP + amount;
          let newLevel = state.level;
          
          for (const lvl of GAME_CONFIG.levels) {
            if (newXP >= lvl.minXP) {
              newLevel = lvl.level;
            }
          }
          
          return { totalXP: newXP, level: newLevel };
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

      // Lecciones
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
      },

      isLessonCompleted: (lessonId: string) => {
        return get().lessonsCompleted.includes(lessonId);
      },

      getNextLesson: (allLessons) => {
        const completed = get().lessonsCompleted;
        return allLessons.find(l => !completed.includes(l.id)) || null;
      },

      // Ejercicios
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

      // Rachas
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
          
          return {
            currentStreak: newStreak,
            maxStreak: Math.max(state.maxStreak, newStreak),
            lastActiveDate: today,
          };
        });
      },

      getStreakStatus: () => {
        const { currentStreak, maxStreak, lastActiveDate } = get();
        const today = getToday();
        const active = lastActiveDate === today || lastActiveDate === getYesterday();
        return { active, days: currentStreak, max: maxStreak };
      },

      // Logros
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

          // Auto-unlock
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
          return { achievements: [...state.achievements, achievementId] };
        });
      },

      getUnlockedAchievements: () => {
        const unlocked = get().achievements;
        return GAME_CONFIG.achievements.filter(a => unlocked.includes(a.id));
      },

      // Persistencia
      loadProgress: async () => {
        // Zustand persist lo hace automáticamente, pero puedes añadir lógica adicional aquí
      },

      resetProgress: () => {
        set(initialState);
      },
    }),
    {
      name: '@tradeeasy_user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
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
      }),
    }
  )
);

// Helper
function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

// Selectores memoizados para rendimiento
export const useUserProgress = () => useUserStore(state => ({
  totalXP: state.totalXP,
  level: state.level,
  lessonsCompleted: state.lessonsCompleted,
  currentStreak: state.currentStreak,
}));

export const useLessonProgress = (lessonId: string) => useUserStore(
  state => state.lessonsCompleted.includes(lessonId)
);

export const useXPProgress = () => useUserStore(state => ({
  xpToNext: state.totalXP >= GAME_CONFIG.levels[GAME_CONFIG.levels.length - 1].minXP 
    ? 0 
    : (GAME_CONFIG.levels.find(l => l.level === state.level + 1)?.minXP || 0) - state.totalXP,
  progress: state.totalXP >= GAME_CONFIG.levels[GAME_CONFIG.levels.length - 1].minXP 
    ? 100 
    : (() => {
        const current = GAME_CONFIG.levels.find(l => l.level === state.level);
        const next = GAME_CONFIG.levels.find(l => l.level === state.level + 1);
        if (!current || !next) return 100;
        return ((state.totalXP - current.minXP) / (next.minXP - current.minXP)) * 100;
      })(),
}));
