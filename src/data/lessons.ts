// Sistema de carga de lecciones con soporte para módulos
import { Lesson } from '../types';

// Importar datos legacy (mantenemos compatibilidad)
import level1Data from './level1.json';
import level2Data from './level2.json';

// Reconstruir lessonsData desde la estructura original por simplicidad MVP
export const lessonsData: Lesson[] = [
  ...(level1Data.lessons as Lesson[]),
  ...(level2Data.lessons as Lesson[]),
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

export const getLessonsByModule = (moduleId: string): Lesson[] => {
  // TODO: implementar cuando tengamos modules
  return lessonsData;
};

export const getNextLessonId = (completedIds: string[]): string | null => {
  for (const lesson of lessonsData) {
    if (!completedIds.includes(lesson.id)) {
      // Verificar prerequisitos si existen
      if (lesson.requiredLessonIds) {
        const hasPrereqs = lesson.requiredLessonIds.every(id => completedIds.includes(id));
        if (!hasPrereqs) continue;
      }
      return lesson.id;
    }
  }
  return null;
};

export const getLessonsCount = (): number => {
  return lessonsData.length;
};

export const getCompletedCount = (completedIds: string[]): number => {
  return completedIds.filter(id => lessonsData.some(l => l.id === id)).length;
};

export const getXPToNextLevel = (xp: number): { nextXP: number; level: number } => {
  const levels = [
    { level: 1, minXP: 0 },
    { level: 2, minXP: 500 },
    { level: 3, minXP: 1500 },
    { level: 4, minXP: 3500 },
    { level: 5, minXP: 7000 },
  ];
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) {
      if (i === levels.length - 1) {
        return { nextXP: 0, level: levels[i].level };
      }
      return { nextXP: levels[i + 1].minXP - xp, level: levels[i].level };
    }
  }
  
  return { nextXP: levels[0].minXP - xp, level: 1 };
};

export const searchLessons = (query: string): Lesson[] => {
  const q = query.toLowerCase().trim();
  if (!q) return lessonsData;
  
  return lessonsData.filter(lesson => 
    lesson.title.toLowerCase().includes(q) ||
    lesson.description.toLowerCase().includes(q) ||
    lesson.summary.toLowerCase().includes(q)
  );
};
