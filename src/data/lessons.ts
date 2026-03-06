// Sistema de carga de lecciones
import { Lesson } from '../types';

// Importar datos legacy
import level1Data from './level1.json';
import level2Data from './level2.json';

// Reconstruir lessonsData usando any para evitar problemas de tipos con JSON
const rawLessons1 = level1Data.lessons as any[];
const rawLessons2 = level2Data.lessons as any[];

// Agregar level y levelName a cada lección
const processLessons = (lessons: any[], level: number, levelName: string): Lesson[] => {
  return lessons.map((l: any) => ({
    id: l.id,
    level: level as 1 | 2 | 3,
    levelName,
    title: l.title,
    description: l.description,
    duration: l.duration,
    xpReward: l.xpReward,
    order: l.order,
    explanation: l.explanation || [],
    example: l.example || { title: '', description: '' },
    exercise: l.exercise || { id: '', type: 'concept-quiz', question: '', options: [], correctAnswer: 0, explanation: '', difficulty: 'easy' },
    summary: l.summary || '',
    requiredLessonIds: l.requiredLessonIds,
  }));
};

export const lessonsData: Lesson[] = [
  ...processLessons(rawLessons1, 1, 'Fundamentos'),
  ...processLessons(rawLessons2, 2, 'Análisis Técnico'),
];

// Ordenar por level y order
lessonsData.sort((a, b) => {
  if (a.level !== b.level) return a.level - b.level;
  return a.order - b.order;
});

// Funciones de utilidad
export const getLessonsByLevel = (level: number): Lesson[] => {
  return lessonsData.filter(l => l.level === level);
};

export const getLessonById = (id: string): Lesson | undefined => {
  return lessonsData.find(l => l.id === id);
};

export const getNextLessonId = (completedIds: string[]): string | null => {
  for (const lesson of lessonsData) {
    if (!completedIds.includes(lesson.id)) {
      if (lesson.requiredLessonIds) {
        const hasPrereqs = lesson.requiredLessonIds.every(id => completedIds.includes(id));
        if (!hasPrereqs) continue;
      }
      return lesson.id;
    }
  }
  return null;
};

export const getLessonsCount = (): number => lessonsData.length;

export const getCompletedCount = (completedIds: string[]): number => 
  completedIds.filter(id => lessonsData.some(l => l.id === id)).length;

export const searchLessons = (query: string): Lesson[] => {
  const q = query.toLowerCase().trim();
  if (!q) return lessonsData;
  
  return lessonsData.filter(lesson => 
    lesson.title.toLowerCase().includes(q) ||
    lesson.description.toLowerCase().includes(q) ||
    lesson.summary.toLowerCase().includes(q)
  );
};
