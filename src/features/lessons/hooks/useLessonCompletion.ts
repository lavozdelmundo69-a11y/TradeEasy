// Hook para gestionar la completación de lecciones
import { useCallback } from 'react';
import { useUserStore } from '../../../store/userStore';
import { GAME_CONFIG } from '../../../shared/constants';
import { lessonsData, getNextLessonId } from '../../../data/lessons';

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
    lessonsCompleted,
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
export function useNextLesson() {
  const lessonsCompleted = useUserStore(state => state.lessonsCompleted);
  
  const getNext = useCallback(() => {
    const nextId = getNextLessonId([...lessonsCompleted]);
    if (nextId) {
      return lessonsData.find(l => l.id === nextId);
    }
    return null;
  }, [lessonsCompleted]);

  return { getNext };
}
