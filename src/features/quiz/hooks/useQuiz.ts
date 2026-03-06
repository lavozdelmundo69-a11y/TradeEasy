// Hook para gestión de quizzes
import { useState, useCallback, useEffect } from 'react';
import { Exercise } from '../../types';
import { useUserStore } from '../../store/userStore';
import { useTimer } from '../shared/hooks/useTimer';

interface UseQuizReturn {
  exercise: Exercise;
  selectedIndex: number | null;
  showResult: boolean;
  timeLeft: number;
  progress: number;
  isExpired: boolean;
  handleSelect: (index: number) => void;
  reset: () => void;
  getResult: () => 'correct' | 'wrong' | 'timeout' | null;
}

export function useQuiz(exercise: Exercise, timeLimit?: number): UseQuizReturn {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  
  const showTimer = !!timeLimit;
  const { seconds, progress, isExpired, reset: resetTimer } = useTimer(timeLimit || 0);
  
  const { correctAnswer, wrongAnswer } = useUserStore();

  const handleSelect = useCallback((index: number) => {
    if (showResult) return;
    
    setSelectedIndex(index);
    setShowResult(true);
    
    if (index === exercise.correctAnswer) {
      setResult('correct');
      correctAnswer();
    } else {
      setResult('wrong');
      wrongAnswer();
    }
  }, [showResult, exercise.correctAnswer, correctAnswer, wrongAnswer]);

  const handleTimeout = useCallback(() => {
    if (showResult) return;
    setSelectedIndex(-1);
    setShowResult(true);
    setResult('timeout');
    wrongAnswer();
  }, [showResult, wrongAnswer, setResult]);

  useEffect(() => {
    if (isExpired && !showResult) {
      handleTimeout();
    }
  }, [isExpired, showResult, handleTimeout]);

  const reset = useCallback(() => {
    setSelectedIndex(null);
    setShowResult(false);
    setResult(null);
    resetTimer();
  }, [resetTimer]);

  const getResult = useCallback(() => result, [result]);

  return {
    exercise,
    selectedIndex,
    showResult,
    timeLeft: seconds,
    progress,
    isExpired,
    handleSelect,
    reset,
    getResult,
  };
}
