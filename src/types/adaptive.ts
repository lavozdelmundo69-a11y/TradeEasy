// Tipos para Progresión Adaptativa
// Añadir a src/types/index.ts

// ==================== TEMAS DEL CURSO ====================

export interface CourseTopic {
  id: string;                    // 'soporte', 'tendencia', 'liquidez', 'wyckoff'
  name: string;                  // 'Soporte y Resistencia'
  description: string;            // Breve descripción
  level: number;                 // Nivel mínimo requerido
  prerequisites?: string[];       // Temas que deben dominarse primero
  lessonIds: string[];           // Lecciones que incluyen este tema
  nextTopics?: string[];          // Temas avanzados disponibles
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  
  // Métricas
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;              // Porcentaje 0-100
  
  // Estado del tema
  status: 'locked' | 'learning' | 'proficient' | 'mastered';
  
  // Evolución
  trend: 'improving' | 'stable' | 'declining';
  lastAttemptAt: string;
  
  // weak concepts en este tema
  weakConceptIds: string[];
}

// ==================== RECOMENDACIONES ====================

export interface LearningRecommendation {
  id: string;
  type: 'practice_topic' | 'review_weak' | 'unlock_advanced' | 'continue_lesson';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  topicId?: string;
  lessonId?: string;
  reason: string;                 // Por qué se recomienda
  xpReward?: number;
}

// ==================== PROGRESIÓN ADAPTATIVA ====================

export interface AdaptiveConfig {
  // Thresholds
  proficientThreshold: number;    // >80% = proficient
  learningThreshold: number;      // 60-80% = learning  
  masteryThreshold: number;       // >90% con 20+ intentos = mastered
  
  // Distribución del quiz
  weakConceptRatio: number;       // 0.6 = 60% weak concepts
  newContentRatio: number;        // 0.2 = 20% contenido nuevo
  
  // Repetición
  minAttemptsForProgression: number;  // Mínimo intentos antes de avanzar
}

export const ADAPTIVE_CONFIG: AdaptiveConfig = {
  proficientThreshold: 80,
  learningThreshold: 60,
  masteryThreshold: 90,
  weakConceptRatio: 0.6,
  newContentRatio: 0.2,
  minAttemptsForProgression: 5,
};

// ==================== LECCIONES Y TEMAS ====================

export interface LessonTopic {
  lessonId: string;
  topicId: string;
  weight: number;                // Cuánto权重 de la lección es de este tema (0-1)
}

// Mapa de lecciones a temas (para referencia rápida)
export const LESSON_TOPIC_MAP: Record<string, string[]> = {
  // Nivel 1: Fundamentos
  'l1_01': ['introduccion'],
  'l1_02': ['introduccion'],
  'l1_03': ['velas'],
  'l1_04': ['velas'],
  'l1_05': ['tendencia'],
  'l1_06': ['tendencia'],
  'l1_07': ['soporte'],
  'l1_08': ['soporte'],
  'l1_09': ['resistencia'],
  'l1_10': ['resistencia'],
  
  // Nivel 2: Análisis Técnico
  'l2_01': ['soporte', 'resistencia'],
  'l2_02': ['soporte', 'resistencia'],
  'l2_03': ['tendencia'],
  'l2_04': ['tendencia'],
  'l2_05': ['liquidez'],
  'l2_06': ['liquidez'],
  'l2_07': ['volumen'],
  'l2_08': ['volumen'],
  'l2_09': ['patrones'],
  'l2_10': ['patrones'],
};

// ==================== TOPICS DEFINITION ====================

export const COURSE_TOPICS: CourseTopic[] = [
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
    id: 'soporte',
    name: 'Soportes',
    description: 'Zonas de demanda y soporte',
    level: 1,
    prerequisites: ['velas'],
    lessonIds: ['l1_07', 'l1_08', 'l2_01', 'l2_02'],
    nextTopics: ['resistencia', 'liquidez'],
  },
  {
    id: 'resistencia',
    name: 'Resistencias',
    description: 'Zonas de oferta y resistencia',
    level: 1,
    prerequisites: ['soporte'],
    lessonIds: ['l1_09', 'l1_10', 'l2_01', 'l2_02'],
    nextTopics: ['liquidez'],
  },
  {
    id: 'liquidez',
    name: 'Zonas de Liquidez',
    description: 'Identificar zonas de liquidez',
    level: 2,
    prerequisites: ['tendencia', 'soporte', 'resistencia'],
    lessonIds: ['l2_05', 'l2_06'],
    nextTopics: ['wyckoff'],
  },
  {
    id: 'volumen',
    name: 'Volumen',
    description: 'Análisis de volumen',
    level: 2,
    lessonIds: ['l2_07', 'l2_08'],
    nextTopics: ['patrones'],
  },
  {
    id: 'patrones',
    name: 'Patrones Chartistas',
    description: 'Figuras chartistas',
    level: 2,
    prerequisites: ['tendencia'],
    lessonIds: ['l2_09', 'l2_10'],
  },
  {
    id: 'wyckoff',
    name: 'Método Wyckoff',
    description: 'Análisis Wyckoff avanzado',
    level: 3,
    prerequisites: ['liquidez', 'volumen'],
    lessonIds: [],
  },
];
