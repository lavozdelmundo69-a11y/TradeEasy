// Hook para gestionar la completación de lecciones
import { useCallback } from 'react';
import { useUserStore } from '../../../store/userStore';
import { GAME_CONFIG } from '../../../shared/constants';

interface UseLessonCompletionReturn {
  handleAnswer: (selectedIndex: number, correctIndex: number) => void;
  completeLesson: (lessonId: string, xpReward: number) => void;
  isCorrect: (selected: number, correct: number) => boolean;
}

export function useLessonCompletion(): UseLessonCompletionReturn {
  const { 
    correctAnswer, 
    wrongAnswer, 
    completeLesson: storeCompleteLesson,
    addXP,
  } = useUserStore();

  const handleAnswer = useCallback((selectedIndex: number, correctIndex: number) => {
    if (selectedIndex === correctIndex) {
      correctAnswer();
      addXP(GAME_CONFIG.xp.exerciseCorrect);
    } else {
      wrongAnswer();
    }
  }, [correctAnswer, wrongAnswer, addXP]);

  const completeLesson = useCallback((lessonId: string, xpReward: number) => {
    storeCompleteLesson(lessonId);
    addXP(xpReward);
  }, [storeCompleteLesson, addXP]);

  const isCorrect = useCallback((selected: number, correct: number) => {
    return selected === correct;
  }, []);

  return {
    handleAnswer,
    completeLesson,
    isCorrect,
  };
}

// Hook para obtener la siguiente lección
import { lessonsData } from '../../../data/lessons';

export function useNextLesson() {
  const { lessonsCompleted, getNextLesson } = useUserStore();
  
  const getNext = useCallback(() => {
    return getNextLesson(lessonsData);
  }, [lessonsCompleted, getNextLesson]);

  return { getNext };
}
