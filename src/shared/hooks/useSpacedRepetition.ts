// Hook para Spaced Repetition y Aprendizaje Inteligente
import { useCallback } from 'react';
import { useUserStore } from '../../store/userStore';
import { Exercise, WeakConcept, TopicProgress, QuizHistory } from '../../types';

// Configuración del spaced repetition
const SPACING_CONFIG = {
  initialDelay: 3,
  secondDelay: 2,
  thirdDelay: 0,
  masteryIncrease: 20,
  masteryDecrease: -15,
  masteredThreshold: 80,
};

function getNextReviewDate(delay: number): string {
  const nextDate = new Date();
  nextDate.setHours(nextDate.getHours() + delay);
  return nextDate.toISOString();
}

export function useSpacedRepetition() {
  const { 
    weakConcepts, 
    quizHistory, 
    addWeakConcept,
    updateWeakConcept,
    addQuizHistory,
  } = useUserStore();

  // Registrar respuesta y actualizar spaced repetition
  const recordAnswer = useCallback((
    exercise: Exercise,
    selectedAnswer: number,
    isCorrect: boolean,
    timeSpentSeconds: number
  ) => {
    // 1. Guardar en historial
    const historyEntry: QuizHistory = {
      exerciseId: exercise.id,
      answeredAt: new Date().toISOString(),
      wasCorrect: isCorrect,
      selectedAnswer,
      timeSpentSeconds,
    };
    addQuizHistory(historyEntry);

    // 2. Actualizar weak concept
    const existingWeak = weakConcepts.find(w => w.conceptId === exercise.id);
    const topic = exercise.topic || 'general';
    
    if (!isCorrect) {
      if (existingWeak) {
        const newErrorCount = existingWeak.errorCount + 1;
        let delay = SPACING_CONFIG.initialDelay;
        if (newErrorCount >= 3) delay = SPACING_CONFIG.thirdDelay;
        else if (newErrorCount >= 2) delay = SPACING_CONFIG.secondDelay;
        
        const newMastery = Math.max(0, existingWeak.masteryLevel + SPACING_CONFIG.masteryDecrease);
        
        updateWeakConcept(exercise.id, {
          errorCount: newErrorCount,
          lastError: new Date().toISOString(),
          nextReviewAt: getNextReviewDate(delay),
          masteryLevel: newMastery,
        });
      } else {
        addWeakConcept({
          conceptId: exercise.id,
          topic,
          errorCount: 1,
          lastError: new Date().toISOString(),
          nextReviewAt: getNextReviewDate(SPACING_CONFIG.initialDelay),
          masteryLevel: 50,
        });
      }
    } else {
      if (existingWeak) {
        const newMastery = Math.min(100, existingWeak.masteryLevel + SPACING_CONFIG.masteryIncrease);
        
        const newDelay = newMastery >= SPACING_CONFIG.masteredThreshold ? 10 : SPACING_CONFIG.initialDelay;
        
        updateWeakConcept(exercise.id, {
          masteryLevel: newMastery,
          nextReviewAt: getNextReviewDate(newDelay),
        });
      }
    }
  }, [weakConcepts, addQuizHistory, addWeakConcept, updateWeakConcept]);

  // Obtener preguntas priorizadas
  const getPrioritizedQuestions = useCallback((
    allExercises: Exercise[],
    limit: number = 10
  ): Exercise[] => {
    const now = new Date().toISOString();
    
    // Weak concepts pendientes
    const dueForReview = weakConcepts
      .filter(w => w.nextReviewAt <= now)
      .sort((a, b) => {
        if (a.errorCount !== b.errorCount) return b.errorCount - a.errorCount;
        return a.masteryLevel - b.masteryLevel;
      })
      .slice(0, Math.ceil(limit * 0.6));

    const prioritized: Exercise[] = [];
    
    for (const weak of dueForReview) {
      const exercise = allExercises.find(e => e.id === weak.conceptId);
      if (exercise) prioritized.push(exercise);
    }
    
    // Llenar con aleatorios
    const available = allExercises.filter(e => !prioritized.includes(e));
    while (prioritized.length < limit && available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      prioritized.push(available.splice(idx, 1)[0]);
    }

    return prioritized.slice(0, limit);
  }, [weakConcepts]);

  // Obtener progreso por tema
  const getTopicStats = useCallback((): TopicProgress[] => {
    const topicMap = new Map<string, TopicProgress>();

    for (const entry of quizHistory) {
      const topic = entry.exerciseId.split('_')[1] || 'general';
      
      if (!topicMap.has(topic)) {
        topicMap.set(topic, {
          topic,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
          weakConcepts: [],
        });
      }

      const progress = topicMap.get(topic)!;
      progress.totalAttempts++;
      if (entry.wasCorrect) progress.correctAttempts++;
      progress.accuracy = progress.totalAttempts > 0
        ? Math.round((progress.correctAttempts / progress.totalAttempts) * 100)
        : 0;
    }

    for (const [topic, progress] of topicMap) {
      progress.weakConcepts = weakConcepts
        .filter(w => w.topic === topic && w.masteryLevel < SPACING_CONFIG.masteredThreshold)
        .map(w => w.conceptId);
    }

    return Array.from(topicMap.values());
  }, [quizHistory, weakConcepts]);

  return {
    recordAnswer,
    getPrioritizedQuestions,
    getTopicStats,
    weakConcepts,
    quizHistory,
  };
}
