// ==================== TEMAS DEL CURSO ====================

export interface CourseTopic {
  id: string;
  name: string;
  description: string;
  level: number;
  prerequisites?: string[];
  lessonIds: string[];
  nextTopics?: string[];
}

// ==================== RENDIMIENTO POR TEMA ====================

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  
  // Métricas
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  
  // Estado
  status: 'locked' | 'learning' | 'proficient' | 'mastered';
  
  // Evolución (últimos 10 intentos)
  recentAccuracy: number;
  trend: 'improving' | 'stable' | 'declining';
  
  // Errores recientes
  recentErrors: number;
  lastAttemptAt: string;
  
  // Weak concepts en este tema
  weakConceptIds: string[];
  
  // Lecciones recomendadas
  recommendedLessons: string[];
}

// ==================== TOPICS DEFINITION ====================

export const TRADING_TOPICS: CourseTopic[] = [
  // Nivel 1 - Fundamentos
  {
    id: 'introduccion',
    name: 'Introducción al Trading',
    description: 'Conceptos básicos y vocabulario',
    level: 1,
    lessonIds: ['l1_01', 'l1_02'],
    nextTopics: ['velas'],
  },
  {
    id: 'velas',
    name: 'Velas Japonesas',
    description: 'Lectura e interpretación de velas',
    level: 1,
    prerequisites: ['introduccion'],
    lessonIds: ['l1_03', 'l1_04'],
    nextTopics: ['tendencia', 'soporte'],
  },
  {
    id: 'tendencia',
    name: 'Tendencias',
    description: 'Identificar tendencias alcistas, bajistas y laterales',
    level: 1,
    prerequisites: ['velas'],
    lessonIds: ['l1_05', 'l1_06', 'l2_03', 'l2_04'],
    nextTopics: ['soporte', 'resistencia', 'liquidez'],
  },
  {
    id: 'soporte_resistencia',
    name: 'Soporte y Resistencia',
    description: 'Zonas de demanda y oferta',
    level: 1,
    prerequisites: ['velas'],
    lessonIds: ['l1_07', 'l1_08', 'l1_09', 'l1_10', 'l2_01', 'l2_02'],
    nextTopics: ['liquidez', 'estructura_mercado'],
  },
  
  // Nivel 2 - Análisis Técnico
  {
    id: 'liquidez',
    name: 'Zonas de Liquidez',
    description: 'Identificar zonas de liquidez',
    level: 2,
    prerequisites: ['tendencia', 'soporte_resistencia'],
    lessonIds: ['l2_05', 'l2_06'],
    nextTopics: ['estructura_mercado', 'wyckoff'],
  },
  {
    id: 'volumen',
    name: 'Volumen',
    description: 'Análisis de volumen',
    level: 2,
    lessonIds: ['l2_07', 'l2_08'],
    nextTopics: ['estructura_mercado'],
  },
  {
    id: 'patrones',
    name: 'Patrones Chartistas',
    description: 'Figuras chartistas',
    level: 2,
    prerequisites: ['tendencia'],
    lessonIds: ['l2_09', 'l2_10'],
    nextTopics: ['estructura_mercado'],
  },
  
  // Nivel 3 - Avanzado
  {
    id: 'estructura_mercado',
    name: 'Estructura de Mercado',
    description: 'Identificar estructura y swing highs/lows',
    level: 3,
    prerequisites: ['liquidez', 'soporte_resistencia'],
    lessonIds: [],
    nextTopics: ['smc', 'wyckoff'],
  },
  {
    id: 'smc',
    name: 'Smart Money Concepts',
    description: 'Análisis de flujo de órdenes',
    level: 3,
    prerequisites: ['estructura_mercado', 'liquidez'],
    lessonIds: [],
    nextTopics: ['ict'],
  },
  {
    id: 'wyckoff',
    name: 'Método Wyckoff',
    description: 'Análisis Wyckoff avanzado',
    level: 3,
    prerequisites: ['liquidez', 'estructura_mercado'],
    lessonIds: [],
  },
  {
    id: 'ict',
    name: 'ICT Trading',
    description: 'Inner Circle Trader methodology',
    level: 3,
    prerequisites: ['smc', 'estructura_mercado'],
    lessonIds: [],
  },
];

// ==================== MAPA DE LECCIONES A TEMAS ====================

export const LESSON_TOPIC_MAP: Record<string, string[]> = {
  // Nivel 1
  'l1_01': ['introduccion'],
  'l1_02': ['introduccion'],
  'l1_03': ['velas'],
  'l1_04': ['velas'],
  'l1_05': ['tendencia'],
  'l1_06': ['tendencia'],
  'l1_07': ['soporte_resistencia'],
  'l1_08': ['soporte_resistencia'],
  'l1_09': ['soporte_resistencia'],
  'l1_10': ['soporte_resistencia'],
  
  // Nivel 2
  'l2_01': ['soporte_resistencia'],
  'l2_02': ['soporte_resistencia'],
  'l2_03': ['tendencia'],
  'l2_04': ['tendencia'],
  'l2_05': ['liquidez'],
  'l2_06': ['liquidez'],
  'l2_07': ['volumen'],
  'l2_08': ['volumen'],
  'l2_09': ['patrones'],
  'l2_10': ['patrones'],
};

// ==================== RECOMENDACIONES ====================

export interface LearningRecommendation {
  id: string;
  type: 'practice_topic' | 'review_weak' | 'unlock_advanced' | 'continue_lesson' | 'scenario_practice';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  topicId?: string;
  lessonId?: string;
  scenarioId?: string;
  reason: string;
  xpReward?: number;
  estimatedMinutes?: number;
}

// ==================== CONFIGURACIÓN ====================

export interface AdaptiveConfig {
  // Thresholds
  proficientThreshold: number;    // >80% = proficient
  learningThreshold: number;      // <60% = learning (refuerzo)
  masteryThreshold: number;       // >90% + 10 intentos = mastered
  
  // Distribución del quiz
  weakConceptRatio: number;       // 50% weak concepts
  newContentRatio: number;        // 25% contenido nuevo
  reviewRatio: number;            // 25% revisión
  
  // Progresión
  minAttemptsForProgression: number;
  minAccuracyForUnlock: number;
}

export const ADAPTIVE_CONFIG: AdaptiveConfig = {
  proficientThreshold: 80,
  learningThreshold: 60,
  masteryThreshold: 90,
  weakConceptRatio: 0.5,
  newContentRatio: 0.25,
  reviewRatio: 0.25,
  minAttemptsForProgression: 5,
  minAccuracyForUnlock: 70,
};

// ==================== EJERCICIO SELECCIONADO ====================

export interface SelectedExercise {
  exerciseId: string;
  lessonId: string;
  topics: string[];
  source: 'weak' | 'new' | 'review' | 'normal';
  priority: number;
}
