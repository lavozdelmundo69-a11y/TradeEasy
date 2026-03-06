// Exportaciones principales
export * from './types';
export * from './shared/constants';

// Store
export { useUserStore, useUserProgress, useLessonProgress, useXPProgress, useIsHydrated } from './store/userStore';

// Components
export { AnimatedButton, ProgressBar, Card, Badge, Skeleton } from './shared/components';
