# Changelog

All notable changes to TradeEasy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Implementación completa de arquitectura Feature-Sliced
- Sistema de gráficos de velas japonesas con react-native-svg
- Hook de contenido lazy (useContentLoader)
- Cache de módulos en memoria
- Índice de búsqueda full-text
- Sistema de skeleton loaders
- Microinteracciones con Reanimated
- FlashList para listas virtualizadas
- Selectores memoizados con useShallow
- Sistema de notificaciones por成就 (preparado)

### Changed
- Refactor completo de Zustand store con mejoras de rendimiento
- Actualización de package.json con nuevas dependencias (@shopify/flash-list, react-native-reanimated)
- Migraciónnavegación state-based a React Navigation
- Mejora de tipos TypeScript (readonly arrays, interfaces estrictas)
- HomeScreen renovado con estadísticas avanzadas
- LessonScreen con mejorfeedback visual
- LevelMapScreen con FlashList y headers progresivos

### Removed
- Código legacy sin usar
- Duplicación de estilos
- Imports circulares

## [1.0.0] - 2024-01-15

### Added
- MVP inicial con 10 lecciones de nivel 1
- Sistema básico de XP y niveles
- Persistencia con AsyncStorage
- Quiz interactivo con feedback
- Gamificación básica (streaks, logros)
- Estructura básica de componentes

---

**Nota:** Este changelog comenzará a partir de la versión 1.0.0 oficial cuando se publique en stores.
