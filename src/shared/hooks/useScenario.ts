// Hook para Escenarios de Trading
import { useState, useCallback, useMemo } from 'react';
import { useUserStore } from '../../store/userStore';
import { 
  TradingScenario, 
  ScenarioResult, 
  TradingAction,
  ScenarioType 
} from '../../types/trading';

interface UseScenarioOptions {
  scenario: TradingScenario;
  onComplete?: (result: ScenarioResult) => void;
}

export function useScenario({ scenario, onComplete }: UseScenarioOptions) {
  const [selectedAction, setSelectedAction] = useState<TradingAction | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  
  const { addXP } = useUserStore();

  // Evaluar respuesta del usuario
  const evaluateAnswer = useCallback((action: TradingAction): boolean => {
    return action === scenario.question.correctAction;
  }, [scenario]);

  // Seleccionar acción
  const selectAction = useCallback((action: TradingAction) => {
    if (showResult) return;
    
    setSelectedAction(action);
    setShowResult(true);
    
    // Calcular resultado
    const isCorrect = evaluateAnswer(action);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    // Calcular XP
    let xpEarned = 0;
    if (isCorrect) {
      xpEarned = scenario.xpReward;
      // Bonus por no usar hints
      if (hintsUsed === 0) xpEarned += 10;
      // Bonus por tiempo rápido (< 30s)
      if (timeSpent < 30) xpEarned += 5;
    } else {
      // XP de consolación por participar
      xpEarned = Math.floor(scenario.xpReward * 0.2);
    }
    
    // Guardar XP
    if (xpEarned > 0) {
      addXP(xpEarned);
    }
    
    const result: ScenarioResult = {
      scenarioId: scenario.id,
      userAction: action,
      isCorrect,
      answeredAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
      xpEarned,
    };
    
    onComplete?.(result);
  }, [showResult, evaluateAnswer, scenario, hintsUsed, startTime, addXP, onComplete]);

  // Usar hint
  const useHint = useCallback(() => {
    if (!scenario.question.hint || hintsUsed > 0) return;
    setHintsUsed(1);
  }, [scenario.question.hint, hintsUsed]);

  // Reiniciar escenario
  const reset = useCallback(() => {
    setSelectedAction(null);
    setShowResult(false);
    setHintsUsed(0);
  }, []);

  // Feedback para mostrar
  const feedback = useMemo(() => {
    if (!showResult || !selectedAction) return null;
    
    const isCorrect = selectedAction === scenario.question.correctAction;
    
    return {
      isCorrect,
      action: selectedAction,
      correctAction: scenario.question.correctAction,
      xpEarned: isCorrect 
        ? scenario.xpReward + (hintsUsed === 0 ? 10 : 0)
        : Math.floor(scenario.xpReward * 0.2),
      feedback: isCorrect 
        ? scenario.feedback.immediate 
        : scenario.feedback.commonMistake 
          ? scenario.feedback.commonMistake
          : scenario.feedback.immediate,
      technicalAnalysis: scenario.feedback.technicalAnalysis,
      whatHappened: scenario.feedback.whatHappened,
      lessons: scenario.feedback.lessons,
    };
  }, [showResult, selectedAction, scenario, hintsUsed]);

  return {
    selectedAction,
    showResult,
    hintsUsed,
    feedback,
    selectAction,
    useHint,
    reset,
  };
}

// ==================== Hook para gestionar lista de escenarios ====================

export function useScenarioLibrary(scenarios: TradingScenario[]) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Map<string, ScenarioResult>>(new Map());

  const markCompleted = useCallback((result: ScenarioResult) => {
    setCompletedIds(prev => new Set([...prev, result.scenarioId]));
    setResults(prev => new Map([...prev, [result.scenarioId, result]]));
  }, []);

  const getNextScenario = useCallback((
    topic?: string,
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  ): TradingScenario | null => {
    const available = scenarios.filter(s => {
      if (completedIds.has(s.id)) return false;
      if (topic && s.topic !== topic) return false;
      if (difficulty && s.difficulty !== difficulty) return false;
      return true;
    });
    
    if (available.length === 0) return null;
    
    // Priorizar por dificultad
    const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    available.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    
    return available[0];
  }, [scenarios, completedIds]);

  const getByTopic = useCallback((topic: string): TradingScenario[] => {
    return scenarios.filter(s => s.topic === topic);
  }, [scenarios]);

  const getStats = useCallback(() => {
    const total = scenarios.length;
    const completed = completedIds.size;
    const correct = [...results.values()].filter(r => r.isCorrect).length;
    const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 0;
    
    return { total, completed, correct, accuracy };
  }, [scenarios, completedIds, results]);

  return {
    completedIds,
    results,
    markCompleted,
    getNextScenario,
    getByTopic,
    getStats,
  };
}
