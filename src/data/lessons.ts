// lessons.ts - Datos de lecciones

import { Lesson } from '../types';
import level1Data from './level1.json';
import level2Data from './level2.json';

// Combinar niveles
export const lessonsData: Lesson[] = [
  ...(level1Data.lessons as Lesson[]),
  ...(level2Data.lessons as Lesson[]),
];

export const getLessonsByLevel = (level: number): Lesson[] => {
  return lessonsData.filter(l => l.level === level);
};

export const getLessonById = (id: string): Lesson | undefined => {
  return lessonsData.find(l => l.id === id);
};
