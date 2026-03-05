# TradeEasy - Arquitectura de la App

## 1. Stack Tecnológico

- **Framework**: React Native + Expo (SDK 52+)
- **Language**: TypeScript
- **State Management**: Zustand (lightweight, perfecto para gamificación)
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage (progreso local) + SQLite si se necesita más adelante
- **Animations**: Reanimated 3 + Moti
- **Charts**: react-native-wagmi-charts (gráficos educativos)

---

## 2. Estructura del Proyecto

```
TradeEasy/
├── app/                          # Expo Router (pantallas)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home
│   │   ├── map.tsx               # Mapa de aprendizaje
│   │   ├── profile.tsx           # Perfil y estadísticas
│   │   └── settings.tsx
│   ├── lesson/
│   │   └── [lessonId].tsx        # Pantalla de lección
│   ├── exercise/
│   │   └── [exerciseId].tsx      # Ejercicio interactivo
│   └── result/
│       └── [lessonId].tsx        # Resultado de lección
├── src/
│   ├── components/               # Componentes reutilizables
│   │   ├── ui/                   # UI base (Button, Card, etc.)
│   │   ├── lesson/               # Componentes de lección
│   │   ├── exercise/             # Tipos de ejercicios
│   │   └── gamification/         # XP, niveles, logros
│   ├── data/                     # Datos estáticos
│   │   ├── lessons/              # Lecciones por nivel
│   │   └── achievements.ts       # Logros
│   ├── store/                    # Zustand stores
│   │   ├── userStore.ts          # Progreso del usuario
│   │   └── lessonStore.ts        # Estado de lecciones
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Utilidades
│   ├── constants/                # Constantes (colors, XP, etc.)
│   └── types/                    # TypeScript types
├── assets/                       # Imágenes, iconos, fuentes
└── data/                         # JSON con contenido (opcional external)
```

---

## 3. Pantallas Principales

### 3.1 Home (Dashboard)
- Bienvenida con nombre de usuario
- Racha diaria actual (🔥 X días)
- XP total y nivel
- "Continuar aprendiendo" (última lección)
- Progreso del nivel actual (barra)
- Botón rápido al mapa de lecciones

### 3.2 Mapa de Aprendizaje
- Vista de nodos interconectados (tipo Duolingo)
- Niveles como secciones解锁ables
- Lecciones como círculos/nodos
- Líneas de conexión entre lecciones
- Indicador de progreso por nivel
- Animaciones al completar

### 3.3 Lección
- Título y descripción
- Explicación (máximo 3-5 párrafos)
- Ejemplo práctico con visualización
- Ejercicio interactivo
- Resumen al final

### 3.4 Ejercicio Interactivo
-题型 según tipo (quiz, identificación, decisión)
- Opciones de respuesta
- Feedback inmediato (correcto/incorrecto)
- Explicación de la respuesta
- XP ganado / racha actualizada

### 3.5 Resultado
- XP ganado en la lección
- Lecciones completadas hoy
- Racha actualizada
- "Siguiente lección" o "Volver al mapa"

### 3.6 Perfil
- Avatar y nivel
- XP total y XP para siguiente nivel
- Racha máxima (record)
- Lecciones completadas
- Tiempo total de aprendizaje
- Logros desbloqueados
- Estadísticas detalladas

---

## 4. Componentes Principales

### UI Base
- `Button` - Primary, Secondary, Ghost variants
- `Card` - Container con sombra
- `ProgressBar` - Barra de progreso
- `Badge` - Insignias (XP, nivel, racha)
- `Icon` - Iconos (Expo Vector Icons)

### Lesson Components
- `LessonCard` - Tarjeta en el mapa
- `LessonHeader` - Título y progreso
- `ExplanationBlock` - Texto con formato
- `ExampleCard` - Ejemplo práctico
- `SummaryBlock` - Resumen al final

### Exercise Components
- `QuizQuestion` - Pregunta con opciones
- `TrendIdentification` - Identificar tendencia
- `TradingDecision` - Decisión de trading
- `CandleInterpretation` - Interpretar vela
- `MarketScenario` - Simulación de mercado
- `AnswerButton` - Botón de respuesta

### Gamification
- `XPIndicator` - Muestra XP ganado
- `StreakCounter` - Contador de racha
- `LevelBadge` - Insignia de nivel
- `ProgressCircle` - Círculo de progreso
- `AchievementCard` - Logro desbloqueado

---

## 5. Estructura de Datos

### 5.1 Lecciones (JSON)

```typescript
interface Lesson {
  id: string;
  level: 1 | 2 | 3;
  levelName: string;
  title: string;
  description: string;
  duration: number; // minutos estimados
  xpReward: number;
  order: number;
  
  // Contenido
  explanation: ExplanationBlock[];
  example: ExampleBlock;
  exercise: Exercise;
  summary: string;
  
  // Requisitos
  requiredLessonIds?: string[]; // Lecciones previas necesarias
  unlockedBy?: string; // Qué lección desbloquea esta
}

interface ExplanationBlock {
  type: 'text' | 'tip' | 'warning' | 'chart';
  content: string;
}

interface ExampleBlock {
  title: string;
  description: string;
  chartData?: ChartDataPoint[]; // Para visualizaciones
  scenario?: string;
}
```

### 5.2 Ejercicios

```typescript
type ExerciseType = 
  | 'concept-quiz'
  | 'trend-identification'
  | 'trading-decision'
  | 'candle-interpretation'
  | 'market-scenario';

interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  scenario?: MarketScenario;
  options: string[];
  correctAnswer: number; // índice
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface MarketScenario {
  trend?: 'up' | 'down' | 'sideways';
  priceAction?: string;
  keyLevel?: 'support' | 'resistance';
  candlePattern?: string;
  description: string;
}
```

### 5.3 Progreso de Usuario

```typescript
interface UserProgress {
  userId: string;
  currentStreak: number;
  maxStreak: number;
  totalXP: number;
  level: number;
  lessonsCompleted: string[]; // IDs
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  lastActiveDate: string;
  achievements: string[];
  dailyXP: { [date: string]: number };
}
```

### 5.4 Configuración de Gamificación

```typescript
const GAME_CONFIG = {
  xp: {
    lessonComplete: 50,
    exerciseCorrect: 10,
    streakBonus: 5, // por día de racha
    perfectLesson: 25, // bonus por todo correcto
  },
  levels: [
    { level: 1, minXP: 0, title: 'Novato' },
    { level: 2, minXP: 500, title: 'Aprendiz' },
    { level: 3, minXP: 1500, title: 'Analista' },
    { level: 4, minXP: 3500, title: 'Trader' },
    { level: 5, minXP: 7000, title: 'Experto' },
  ],
  streak: {
    maxDays: 365,
    freezeCost: 100, // XP para proteger racha
  },
};
```

---

## 6. Navegación

```
Root (Stack)
├── (Tabs) - Bottom Tab Navigator
│   ├── Home
│   ├── Mapa (Learning Map)
│   ├── Perfil
│   └── Ajustes
├── Lesson (Modal/Push)
│   └── [lessonId]
├── Exercise (Modal)
│   └── [exerciseId]
└── Result (Modal)
    └── [lessonId]
```

---

## 7. Estado Global (Zustand)

### User Store
```typescript
interface UserStore {
  // State
  user: UserProgress;
  
  // Actions
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  correctAnswer: () => void;
  updateStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  resetProgress: () => void;
}
```

### Lesson Store
```typescript
interface LessonStore {
  currentLesson: Lesson | null;
  currentExercise: Exercise | null;
  answeredExercises: string[];
  correctAnswers: number;
  
  setCurrentLesson: (lesson: Lesson) => void;
  answerExercise: (exerciseId: string, answer: number) => boolean;
  resetLesson: () => void;
}
```

---

## 8. MVP - Funcionalidades Esenciales

### Fase 1 (MVP)
- [ ] Navegación entre pantallas
- [ ] Mostrar 10 lecciones del Nivel 1
- [ ] Sistema de progreso (XP, nivel)
- [ ] Quizzes interactivos básicos
- [ ] Mapa de lecciones simple
- [ ] Almacenamiento local (AsyncStorage)

### Fase 2
- [ ] Sistema de rachas
- [ ] Más lecciones (Nivel 1 completo)
- [ ] Ejercicios de identificación de tendencia
- [ ] Animaciones y transiciones

### Fase 3
- [ ] Nivel 2 completo
- [ ] Simulaciones de mercado
- [ ] Logros y recompensas
- [ ] Estadísticas detalladas

---

## 9. Consideraciones Técnicas

### Rendimiento
- Lazy loading de lecciones
- Virtualización de listas largas
- Memoización de componentes pesados

### Accesibilidad
- Soporte para screen readers
- Contraste de colores adecuado
- Tamaño de touch targets (min 44px)

### Offline
- Todo el contenido en la app
- Sincronización cuando hay conexión (futuro)

### Animaciones
- Usar Reanimated para流畅
- Evitar animaciones bloqueantes
- Reducir en modo "bajo consumo"
