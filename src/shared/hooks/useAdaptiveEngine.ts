// Adaptive Learning Engine - Motor de Aprendizaje Adaptativo
import { useCallback, useMemo } from 'react';
import { useUserStore } from '../../store/userStore';
import {
  TopicPerformance,
  LearningRecommendation,
  SelectedExercise,
  TRADING_TOPICS,
  LESSON_TOPIC_MAP,
  ADAPTIVE_CONFIG,
} from '../../types/adaptive';
import { Exercise, Lesson } from '../../types';

export function useAdaptiveEngine() {
  const {
    quizHistory,
    weakConcepts,
    lessonsCompleted,
    level,
    totalXP,
  } = useUserStore();

  // ==================== 1. Calcular rendimiento por tema ====================
  const calculateTopicPerformance = useCallback((): TopicPerformance[] => {
    const topicStats = new Map<string, {
      total: number;
      correct: number;
      recentCorrect: number;
      recentTotal: number;
      lastDate: string;
    }>();

    // Agregar intentos por tema
    for (const entry of quizHistory) {
      const topics = getTopicsForExercise(entry.exerciseId);
      
      for (const topicId of topics) {
        if (!topicStats.has(topicId)) {
          topicStats.set(topicId, { total: 0, correct: 0, recentCorrect: 0, recentTotal: 0, lastDate: '' });
        }
        const stats = topicStats.get(topicId)!;
        stats.total++;
        if (entry.wasCorrect) stats.correct++;
        
        // Últimos 10 intentos para trend
        if (stats.recentTotal < 10) {
          stats.recentTotal++;
          if (entry.wasCorrect) stats.recentCorrect++;
        }
        
        if (entry.answeredAt > stats.lastDate) {
          stats.lastDate = entry.answeredAt;
        }
      }
    }

    // Convertir a TopicPerformance
    const performances: TopicPerformance[] = [];
    
    for (const [topicId, stats] of topicStats) {
      const topic = TRADING_TOPICS.find(t => t.id === topicId);
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      const recentAccuracy = stats.recentTotal > 0 
        ? Math.round((stats.recentCorrect / stats.recentTotal) * 100) 
        : accuracy;
      
      // Determinar estado
      let status: TopicPerformance['status'] = 'learning';
      if (accuracy >= ADAPTIVE_CONFIG.masteryThreshold && stats.total >= ADAPTIVE_CONFIG.minAttemptsForProgression) {
        status = 'mastered';
      } else if (accuracy >= ADAPTIVE_CONFIG.proficientThreshold) {
        status = 'proficient';
      } else if (accuracy < ADAPTIVE_CONFIG.learningThreshold) {
        status = 'learning';
      }

      // Calcular trend
      let trend: TopicPerformance['trend'] = 'stable';
      if (recentAccuracy > accuracy + 10) trend = 'improving';
      else if (recentAccuracy < accuracy - 10) trend = 'declining';

      // Weak concepts en este tema
      const topicWeakConcepts = weakConcepts
        .filter(w => w.topic === topicId && w.masteryLevel < 80)
        .map(w => w.conceptId);

      // Lecciones recomendadas (no completadas del tema)
      const recommendedLessons = (topic?.lessonIds || [])
        .filter(id => !lessonsCompleted.includes(id))
        .slice(0, 3);

      performances.push({
        topicId,
        topicName: topic?.name || topicId,
        totalAttempts: stats.total,
        correctAttempts: stats.correct,
        accuracy,
        status,
        recentAccuracy,
        trend,
        recentErrors: stats.total - stats.correct,
        lastAttemptAt: stats.lastDate,
        weakConceptIds: topicWeakConcepts,
        recommendedLessons,
      });
    }

    // Añadir temas sin actividad
    for (const topic of TRADING_TOPICS) {
      if (!performances.find(p => p.topicId === topic.id)) {
        const isUnlocked = level >= topic.level;
        
        performances.push({
          topicId: topic.id,
          topicName: topic.name,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
          status: isUnlocked ? 'learning' : 'locked',
          recentAccuracy: 0,
          trend: 'stable',
          recentErrors: 0,
          lastAttemptAt: '',
          weakConceptIds: [],
          recommendedLessons: isUnlocked ? topic.lessonIds.slice(0, 3) : [],
        });
      }
    }

    return performances;
  }, [quizHistory, weakConcepts, lessonsCompleted, level]);

  // ==================== 2. Obtener siguiente ejercicio ====================
  const selectNextExercise = useCallback((
    allExercises: Exercise[]
  ): SelectedExercise | null => {
    const performances = calculateTopicPerformance();
    
    // Recolectar ejercicios por categoría
    const weakExercises: { exercise: Exercise; priority: number; id: string }[] = [];
    const newExercises: { exercise: Exercise; priority: number; id: string }[] = [];
    const reviewExercises: { exercise: Exercise; priority: number; id: string }[] = [];
    const normalExercises: { exercise: Exercise; priority: number; id: string }[] = [];

    for (const ex of allExercises) {
      const topics = getTopicsForExercise(ex.id);
      const topicPerf = topics.map(t => performances.find(p => p.topicId === t)).filter(Boolean) as TopicPerformance[];
      
      // Skip completed lessons
      const lessonId = ex.id.replace('ex_', '');
      if (lessonsCompleted.includes(lessonId)) continue;

      // Verificar si es weak concept
      const isWeak = weakConcepts.some(w => 
        w.conceptId === ex.id && w.masteryLevel < 80
      );

      if (isWeak) {
        // Prioridad: más errores = más prioridad
        const weak = weakConcepts.find(w => w.conceptId === ex.id);
        weakExercises.push({ 
          exercise: ex, 
          priority: (weak?.errorCount || 1) * 10,
          id: ex.id,
        });
      } else if (topicPerf.some(t => t.totalAttempts === 0)) {
        // Tema nuevo
        newExercises.push({ exercise: ex, priority: 5, id: ex.id });
      } else if (topicPerf.some(t => t.status === 'proficient' || t.status === 'mastered')) {
        // Repaso de temas dominados
        reviewExercises.push({ exercise: ex, priority: 3, id: ex.id });
      } else {
        normalExercises.push({ exercise: ex, priority: 1, id: ex.id });
      }
    }

    // Distribución: 50% weak, 25% new, 25% review/random
    const rand = Math.random();
    
    // 50% - Weak concepts
    if (rand < ADAPTIVE_CONFIG.weakConceptRatio && weakExercises.length > 0) {
      const selected = selectWeightedRandom(weakExercises);
      return {
        exerciseId: selected.id,
        lessonId: selected.id.replace('ex_', ''),
        topics: getTopicsForExercise(selected.id),
        source: 'weak',
        priority: 10,
      };
    }
    
    // 25% - New content
    if (rand < ADAPTIVE_CONFIG.weakConceptRatio + ADAPTIVE_CONFIG.newContentRatio && newExercises.length > 0) {
      const selected = selectWeightedRandom(newExercises);
      return {
        exerciseId: selected.id,
        lessonId: selected.id.replace('ex_', ''),
        topics: getTopicsForExercise(selected.id),
        source: 'new',
        priority: 5,
      };
    }
    
    // 25% - Review or normal
    const pool = reviewExercises.length > 0 ? reviewExercises : normalExercises;
    if (pool.length > 0) {
      const selected = selectWeightedRandom(pool);
      return {
        exerciseId: selected.id,
        lessonId: selected.id.replace('ex_', ''),
        topics: getTopicsForExercise(selected.id),
        source: reviewExercises.length > 0 ? 'review' : 'normal',
        priority: 1,
      };
    }

    return null;
  }, [calculateTopicPerformance, weakConcepts, lessonsCompleted]);

  // ==================== 3. Obtener recomendaciones ====================
  const getRecommendations = useCallback((
    allLessons: Lesson[]
  ): LearningRecommendation[] => {
    const recommendations: LearningRecommendation[] = [];
    const performances = calculateTopicPerformance();

    // PRIORITY 1: Temas con < 60% (necesitan refuerzo)
    const weakTopics = performances
      .filter(p => p.status === 'learning' && p.totalAttempts > 0)
      .sort((a, b) => a.accuracy - b.accuracy);

    for (const weak of weakTopics.slice(0, 2)) {
      if (weak.recommendedLessons.length > 0) {
        const lesson = allLessons.find(l => l.id === weak.recommendedLessons[0]);
        if (lesson) {
          recommendations.push({
            id: `practice_${weak.topicId}`,
            type: 'practice_topic',
            priority: 'high',
            title: `Reforzar: ${weak.topicName}`,
            description: `Accuracy: ${weak.accuracy}%. Necesitas mejorar.`,
            topicId: weak.topicId,
            lessonId: lesson.id,
            reason: `Tema con ${weak.accuracy}% de accuracy`,
            xpReward: lesson.xpReward,
            estimatedMinutes: lesson.duration,
          });
        }
      }
    }

    // PRIORITY 2: Revisar errores específicos
    const criticalWeak = weakConcepts
      .filter(w => w.errorCount >= 2)
      .slice(0, 3);

    if (criticalWeak.length > 0) {
      recommendations.push({
        id: 'review_errors',
        type: 'review_weak',
        priority: 'high',
        title: 'Repasar conceptos fallados',
        description: `${criticalWeak.length} preguntas con 2+ errores`,
        reason: 'Errores repetidos requieren refuerzo',
      });
    }

    // PRIORITY 3: Desbloquear contenido avanzado
    const proficientTopics = performances.filter(p => p.status === 'proficient' || p.status === 'mastered');
    
    for (const prof of proficientTopics) {
      const topic = TRADING_TOPICS.find(t => t.id === prof.topicId);
      if (topic?.nextTopics) {
        for (const nextId of topic.nextTopics) {
          const nextPerf = performances.find(p => p.topicId === nextId);
          if (nextPerf?.status === 'locked') {
            const nextTopic = TRADING_TOPICS.find(t => t.id === nextId);
            recommendations.push({
              id: `unlock_${nextId}`,
              type: 'unlock_advanced',
              priority: 'medium',
              title: `Desbloquear: ${nextTopic?.name}`,
              description: `Has dominado ${prof.topicName}`,
              topicId: nextId,
              reason: `Tema ${prof.topicName} con ${prof.accuracy}%`,
            });
          }
        }
      }
    }

    // PRIORITY 4: Continuar lección actual
    const nextLesson = findNextLesson(allLessons);
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
        estimatedMinutes: nextLesson.duration,
      });
    }

    // Ordenar por prioridad
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [calculateTopicPerformance, weakConcepts, lessonsCompleted, level]);

  // ==================== 4. Stats globales ====================
  const globalStats = useMemo(() => {
    const performances = calculateTopicPerformance();
    const active = performances.filter(p => p.totalAttempts > 0);
    
    if (active.length === 0) {
      return {
        avgAccuracy: 0,
        masteredTopics: 0,
        proficientTopics: 0,
        learningTopics: 0,
        weakTopics: 0,
        totalAttempts: 0,
        strongestTopic: null as string | null,
        weakestTopic: null as string | null,
      };
    }

    const avgAccuracy = Math.round(
      active.reduce((sum, p) => sum + p.accuracy, 0) / active.length
    );
    
    const sortedByAccuracy = [...active].sort((a, b) => b.accuracy - a.accuracy);

    return {
      avgAccuracy,
      masteredTopics: active.filter(p => p.status === 'mastered').length,
      proficientTopics: active.filter(p => p.status === 'proficient').length,
      learningTopics: active.filter(p => p.status === 'learning').length,
      weakTopics: active.filter(p => p.accuracy < ADAPTIVE_CONFIG.learningThreshold).length,
      totalAttempts: active.reduce((sum, p) => sum + p.totalAttempts, 0),
      strongestTopic: sortedByAccuracy[0]?.topicId || null,
      weakestTopic: sortedByAccuracy[sortedByAccuracy.length - 1]?.topicId || null,
    };
  }, [calculateTopicPerformance]);

  // ==================== 5. Obtener siguiente lección recomendada ====================
  const getNextLesson = useCallback((
    allLessons: Lesson[]
  ): Lesson | null => {
    const recommendations = getRecommendations(allLessons);
    const lessonRec = recommendations.find(r => r.lessonId);
    if (lessonRec) {
      return allLessons.find(l => l.id === lessonRec.lessonId) || null;
    }
    return findNextLesson(allLessons);
  }, [getRecommendations]);

  return {
    // Datos
    performances: calculateTopicPerformance(),
    globalStats,
    
    // Funciones
    calculateTopicPerformance,
    selectNextExercise,
    getRecommendations,
    getNextLesson,
  };
}

// ==================== HELPERS ====================

function getTopicsForExercise(exerciseId: string): string[] {
  // Intentar del mapa
  const match = exerciseId.match(/ex_(l\d+)/);
  if (match) {
    return LESSON_TOPIC_MAP[match[1]] || ['general'];
  }
  return ['general'];
}

function findNextLesson(lessons: Lesson[]): Lesson | null {
  const { lessonsCompleted, level } = useUserStore.getState();
  
  return lessons
    .filter(l => l.level <= level && !lessonsCompleted.includes(l.id))
    .sort((a, b) => a.order - b.order)[0] || null;
}

function selectWeightedRandom<T extends { priority: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.priority, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.priority;
    if (random <= 0) return item;
  }
  
  return items[0];
}
