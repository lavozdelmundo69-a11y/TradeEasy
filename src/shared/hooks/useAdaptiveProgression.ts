// Hook de Progresión Adaptativa
import { useCallback, useMemo } from 'react';
import { useUserStore } from '../../store/userStore';
import { 
  TopicPerformance, 
  LearningRecommendation,
  CourseTopic,
  LESSON_TOPIC_MAP,
  COURSE_TOPICS,
  ADAPTIVE_CONFIG 
} from '../../types/adaptive';
import { Lesson } from '../../types';

export function useAdaptiveProgression() {
  const {
    quizHistory,
    weakConcepts,
    lessonsCompleted,
    level,
  } = useUserStore();

  // Helper: convertir readonly a mutable
  const completedLessons = useMemo(() => [...lessonsCompleted], [lessonsCompleted]);

  // ==================== 1. Calcular accuracy por tema ====================
  const calculateTopicPerformance = useCallback((): TopicPerformance[] => {
    // Agrupar intentos por tema
    const topicStats = new Map<string, { total: number; correct: number; attempts: string[] }>();

    for (const entry of quizHistory) {
      // Extraer topic del exercise ID
      const topicIds = getTopicsForExercise(entry.exerciseId);
      
      for (const topicId of topicIds) {
        if (!topicStats.has(topicId)) {
          topicStats.set(topicId, { total: 0, correct: 0, attempts: [] });
        }
        const stats = topicStats.get(topicId)!;
        stats.total++;
        if (entry.wasCorrect) stats.correct++;
        stats.attempts.push(entry.answeredAt);
      }
    }

    // Convertir a TopicPerformance
    const performances: TopicPerformance[] = [];
    
    for (const [topicId, stats] of topicStats) {
      const topic = COURSE_TOPICS.find((t: CourseTopic) => t.id === topicId);
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      
      // Determinar estado
      let status: TopicPerformance['status'] = 'learning';
      if (accuracy >= ADAPTIVE_CONFIG.masteryThreshold && stats.total >= ADAPTIVE_CONFIG.minAttemptsForProgression) {
        status = 'mastered';
      } else if (accuracy >= ADAPTIVE_CONFIG.proficientThreshold) {
        status = 'proficient';
      } else if (accuracy < ADAPTIVE_CONFIG.learningThreshold) {
        status = 'learning';
      }

      // Calcular trend (últimos 5 intentos)
      const recentAttempts = stats.attempts.slice(-5);
      const recentCorrect = recentAttempts.filter((_, i) => 
        quizHistory.find(h => h.answeredAt === recentAttempts[i])?.wasCorrect
      ).length;
      const recentAccuracy = recentAttempts.length > 0 
        ? Math.round((recentCorrect / recentAttempts.length) * 100) 
        : accuracy;
      
      let trend: TopicPerformance['trend'] = 'stable';
      if (recentAccuracy > accuracy + 10) trend = 'improving';
      else if (recentAccuracy < accuracy - 10) trend = 'declining';

      // Weak concepts en este tema
      const topicWeakConcepts = weakConcepts
        .filter(w => w.topic === topicId)
        .map(w => w.conceptId);

      performances.push({
        topicId,
        topicName: topic?.name || topicId,
        totalAttempts: stats.total,
        correctAttempts: stats.correct,
        accuracy,
        status,
        trend,
        lastAttemptAt: stats.attempts[stats.attempts.length - 1] || '',
        weakConceptIds: topicWeakConcepts,
      });
    }

    // Añadir temas sin actividad
    for (const topic of COURSE_TOPICS) {
      if (!performances.find(p => p.topicId === topic.id)) {
        performances.push({
          topicId: topic.id,
          topicName: topic.name,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
          status: level >= topic.level ? 'learning' : 'locked',
          trend: 'stable',
          lastAttemptAt: '',
          weakConceptIds: [],
        });
      }
    }

    return performances;
  }, [quizHistory, weakConcepts, level]);

  // ==================== 2. Obtener recomendaciones ====================
  const getRecommendations = useCallback((
    allLessons: Lesson[]
  ): LearningRecommendation[] => {
    const recommendations: LearningRecommendation[] = [];
    const performances = calculateTopicPerformance();

    // Priority 1: Temas con < 60% accuracy (learning)
    const weakTopics = performances
      .filter(p => p.status === 'learning' && p.totalAttempts > 0)
      .sort((a, b) => a.accuracy - b.accuracy);

    for (const weak of weakTopics.slice(0, 2)) {
      // Buscar lección del tema no completada
      const topicLesson = findLessonForTopic(allLessons, weak.topicId, completedLessons);
      if (topicLesson) {
        recommendations.push({
          id: `practice_${weak.topicId}`,
          type: 'practice_topic',
          priority: 'high',
          title: `Practicar ${weak.topicName}`,
          description: `Tu accuracy está en ${weak.accuracy}%. Necesitas mejorar.`,
          topicId: weak.topicId,
          lessonId: topicLesson.id,
          reason: `Accuracy bajo (${weak.accuracy}%)`,
        });
      }
    }

    // Priority 2: Revisar weak concepts
    const highPriorityWeak = weakConcepts
      .filter(w => w.errorCount >= 2)
      .slice(0, 3);

    if (highPriorityWeak.length > 0) {
      recommendations.push({
        id: 'review_weak',
        type: 'review_weak',
        priority: 'high',
        title: 'Repasar errores',
        description: `${highPriorityWeak.length} conceptos necesitan refuerzo`,
        reason: `${highPriorityWeak.length} preguntas falladas 2+ veces`,
      });
    }

    // Priority 3: Desbloquear contenido avanzado
    const proficientTopics = performances.filter(p => p.status === 'proficient' || p.status === 'mastered');
    
    for (const prof of proficientTopics) {
      const topic = COURSE_TOPICS.find((t: CourseTopic) => t.id === prof.topicId);
      if (topic?.nextTopics && topic.nextTopics.length > 0) {
        for (const nextId of [...topic.nextTopics]) {
          const nextTopicPerf = performances.find(p => p.topicId === nextId);
          if (nextTopicPerf?.status === 'locked') {
            const nextTopic = COURSE_TOPICS.find((t: CourseTopic) => t.id === nextId);
            recommendations.push({
              id: `unlock_${nextId}`,
              type: 'unlock_advanced',
              priority: 'medium',
              title: `Desbloquear: ${nextTopic?.name}`,
              description: `Has dominado ${prof.topicName}. ¡Puedes avanzar!`,
              topicId: nextId,
              reason: `Tema ${prof.topicName} dominado (${prof.accuracy}%)`,
            });
          }
        }
      }
    }

    // Priority 4: Continuar progreso normal
    const nextLesson = findNextLesson(allLessons, completedLessons, level);
    if (nextLesson && !recommendations.find(r => r.lessonId === nextLesson.id)) {
      recommendations.push({
        id: `continue_${nextLesson.id}`,
        type: 'continue_lesson',
        priority: 'low',
        title: 'Continuar aprendizaje',
        description: nextLesson.title,
        lessonId: nextLesson.id,
        reason: 'Siguiente lección en el camino',
        xpReward: nextLesson.xpReward,
      });
    }

    // Ordenar por prioridad
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [calculateTopicPerformance, completedLessons, level, weakConcepts]);

  // ==================== 3. Selector de siguiente contenido ====================
  const getNextContent = useCallback((
    allLessons: Lesson[],
    exerciseIds: string[]
  ): { type: 'lesson' | 'exercise'; id: string } => {
    const performances = calculateTopicPerformance();
    
    // 60% weak concepts, 20% nuevo, 20% aleatorio
    const shouldPracticeWeak = Math.random() < ADAPTIVE_CONFIG.weakConceptRatio;
    
    if (shouldPracticeWeak && weakConcepts.length > 0) {
      // Practicar weak concept
      const worstWeak = [...weakConcepts]
        .filter(w => w.masteryLevel < ADAPTIVE_CONFIG.masteryThreshold)
        .sort((a, b) => a.masteryLevel - b.masteryLevel)[0];
      
      if (worstWeak) {
        // Buscar ejercicio relacionado
        const relatedExercise = exerciseIds.find(id => id.includes(worstWeak.topic));
        if (relatedExercise) {
          return { type: 'exercise', id: relatedExercise };
        }
      }
    }

    // Buscar lección de tema débil
    const weakTopicsList = performances
      .filter(p => p.accuracy < ADAPTIVE_CONFIG.learningThreshold)
      .map(p => p.topicId);

    if (weakTopicsList.length > 0) {
      for (const topicId of weakTopicsList) {
        const lesson = findLessonForTopic(allLessons, topicId, completedLessons);
        if (lesson) {
          return { type: 'lesson', id: lesson.id };
        }
      }
    }

    // Continuar normalmente
    const nextLesson = findNextLesson(allLessons, completedLessons, level);
    if (nextLesson) {
      return { type: 'lesson', id: nextLesson.id };
    }

    // Default: ejercicio aleatorio
    return { type: 'exercise', id: exerciseIds[0] || '' };
  }, [calculateTopicPerformance, weakConcepts, completedLessons, level]);

  // ==================== 4. Stats resumidas ====================
  const overallStats = useMemo(() => {
    const performances = calculateTopicPerformance();
    const active = performances.filter(p => p.totalAttempts > 0);
    
    if (active.length === 0) {
      return { avgAccuracy: 0, masteredTopics: 0, weakTopics: 0 };
    }

    const avgAccuracy = Math.round(
      active.reduce((sum, p) => sum + p.accuracy, 0) / active.length
    );
    const masteredTopics = active.filter(p => p.status === 'mastered').length;
    const weakTopics = active.filter(p => p.status === 'learning').length;

    return { avgAccuracy, masteredTopics, weakTopics };
  }, [calculateTopicPerformance]);

  return {
    calculateTopicPerformance,
    getRecommendations,
    getNextContent,
    overallStats,
    performances: calculateTopicPerformance(),
  };
}

// ==================== Helpers ====================

function getTopicsForExercise(exerciseId: string): string[] {
  // Intentar extraer del ID: ex_l1_03 -> l1 -> buscar en mapa
  const match = exerciseId.match(/ex_(l\d+)/);
  if (match) {
    const lessonId = match[1];
    return LESSON_TOPIC_MAP[lessonId] || ['general'];
  }
  return ['general'];
}

function findLessonForTopic(
  lessons: Lesson[], 
  topicId: string, 
  completedLessons: string[]
): Lesson | undefined {
  return lessons.find(l => {
    const topics = LESSON_TOPIC_MAP[l.id] || [];
    return topics.includes(topicId) && !completedLessons.includes(l.id);
  });
}

function findNextLesson(
  lessons: Lesson[], 
  completedLessons: string[],
  userLevel: number
): Lesson | undefined {
  return lessons
    .filter(l => l.level <= userLevel && !completedLessons.includes(l.id))
    .sort((a, b) => a.order - b.order)[0];
}
