# Arquitectura de TradeEasy

## 🏛️ Arquitectura Feature-Sliced

### Organización
```
src/
├── features/              # Features independientes
│   ├── lessons/          # Funcionalidad de lecciones
│   │   ├── components/   # LessonCard, LessonContent
│   │   ├── hooks/        # useLessonCompletion, useLessonProgress
│   │   └── index.ts
│   ├── quiz/             # Sistema de ejercicios
│   │   ├── components/   # QuizCard, AnswerButtons
│   │   ├── hooks/        # useQuiz, useAnswerValidation
│   │   └── index.ts
│   ├── trading/          # Gráficos de trading
│   │   ├── components/   # CandlestickChart, MiniChart
│   │   ├── utils/        # indicadores.ts
│   │   └── index.ts
│   └── gamification/     # XP, niveles, logros
│       ├── components/   # LevelBadge, XPDisplay
│       ├── hooks/        # useXP, useStreak, useAchievements
│       └── index.ts
├── shared/               # Código compartido
│   ├── components/       # UI genéricos (Button, Card, ProgressBar)
│   ├── hooks/            # useStorage, useTimer, useContentLoader
│   ├── utils/            # Formatters, Validators
│   └── constants/        # Colores, Spacing, GAME_CONFIG
├── app/                  # Navegación y routing
│   ├── navigation/
│   ├── screens/
│   └── layout.tsx
└── store/                # Estado global
    ├── slices/           # userSlice, quizSlice, settingsSlice
    ├── selectors.ts
    └── index.ts
```

---

## 📦 Dependencias Principales

### UI & Animations
- `react-native-reanimated` - Animaciones nativas de alta performance
- `@shopify/flash-list` - Lista virtualizada (1000+ items)
- `react-native-svg` - Gráficos vectoriales

### State Management
- `zustand` - State management minimalista
- `zustand/middleware` - persist para AsyncStorage

### Navigation
- `@react-navigation/native` - Navegación principal
- `@react-navigation/native-stack` - Stack navigation

### Storage
- `@react-native-async-storage/async-storage` - Persistencia local

---

## 🎯 Patrones Recomendados

### 1. Container/Presentational Pattern
```typescript
// features/lessons/hooks/useLessonCompletion.ts
const useLessonCompletion = () => {
  const { completeLesson, addXP } = useUserStore();
  
  const complete = useCallback((lessonId: string) => {
    completeLesson(lessonId);
    addXP(50);
  }, []);
  
  return { complete };
};

// components/LessonCard.tsx - solo UI
export const LessonCard = ({ lesson, onPress }) => {
  const { complete } = useLessonCompletion();
  // ...
};
```

### 2. Memoización Agresiva
```typescript
export const LessonCard = memo<LessonCardProps>(({ lesson }) => {
  const completed = useMemo(() => 
    useUserStore.getState().lessonsCompleted.includes(lesson.id),
    [lesson.id]
  );
  // ...
}, (prev, next) => prev.lesson.id === next.lesson.id);
```

### 3. Selectores Optimizados
```typescript
export const useLessonProgress = (lessonId: string) => 
  useUserStore(
    useShallow(state => ({
      completed: state.lessonsCompleted.includes(lessonId),
      xp: state.totalXP,
    }))
  );
```

### 4. Carga Diferida de Contenido
```typescript
// content/ lazy loaded
const loadModule = async (moduleFile: string) => {
  const module = await import(`../../../content/${moduleFile}`);
  return module.default.lessons;
};
```

---

## 📊 Escalabilidad de Datos

### Estructura Modular de Contenido
```
content/
├── structure.json        # Índice de niveles y módulos
├── searchIndex.json      # Índice de búsqueda
├── level1/
│   ├── module1.json     # 10 lecciones
│   ├── module2.json     # 10 lecciones
│   └── module3.json     # 5 lecciones
├── level2/
│   └── ...
└── level3/
    └── ...
```

Cada módulo se carga bajo demanda. El archivo `structure.json` referencia todos los módulos disponibles y sus IDs.

### Búsqueda Full-Text
```json
{
  "index": {
    "velas": ["l1_04", "l1_05", "l1_06"],
    "soporte": ["l1_07", "l2_02"]
  },
  "tags": {
    "beginner": ["l1_01", ...],
    "chart_patterns": [...]
  }
}
```

---

## ⚡ Optimizaciones de Rendimiento

### 1. FlashList para Listas
```typescript
<FlashList
  data={lessons}
  renderItem={({ item }) => <LessonCard lesson={item} />}
  estimatedItemSize={80}
  keyExtractor={item => item.id}
/>
```

### 2. Memoización de Gráficos
```typescript
export const CandlestickChart = memo(({ data }) => {
  const memoizedData = useMemo(() => 
    processDataForRendering(data),
    [data]
  );
  // render
});
```

### 3. Virtualización de Gráficos
- Solo renderizar velas visibles en viewport
- Usar `react-native-gesture-handler` con `scroll` para charts grandes

### 4. Cache de Datos
```typescript
const contentCache = new Map<string, Lesson[]>();
// Llenado en useContentLoader
```

---

## 🎮 Gamificación

### Sistema de XP
- Lección completada: 50 XP
- Ejercicio correcto: 10 XP
- Racha diaria: +5 XP por día consecutivo
- Logros: 100-500 XP

### Niveles
| Nivel | Título | XP Requerido |
|-------|--------|--------------|
| 1 | Novato | 0 |
| 2 | Aprendiz | 500 |
| 3 | Analista | 1500 |
| 4 | Trader | 3500 |
| 5 | Experto | 7000 |

### Logros (ejemplos)
- Primer día: 50 XP
- 7 días seguidos (Semana): 200 XP
- 10 lecciones: 100 XP
- 100% precisión en quiz: 75 XP

---

## 📱 UX/UI Guidelines

### Design System
- **Colores:** Purple primary (#6C5CE7), Green success (#00B894), Red error (#FF6B6B)
- **Spacing:** xs(4), sm(8), md(16), lg(24), xl(32)
- **Border radius:** sm(8), md(12), lg(16), full(9999)
- **Font sizes:** xs(12) a xxl(32)

### Microinteracciones
- Scale animation en botones al presionar
- Fade/slide en transiciones de pantalla
- Confetti en logros desbloqueados
- Haptic feedback en respuestas correctas/incorrectas

### Estados de Carga
- Shimmer effect en skeleton loaders
- Pull-to-refresh en LevelMapScreen
- Infinite scroll preparado para futuros feeds

---

## 🔧 Testing Strategy

### Unit Tests
```typescript
// __tests__/indicators.test.ts
describe('calculateSMA', () => {
  it('calculates 5-period SMA correctly', () => {
    const data = [1, 2, 3, 4, 5];
    expect(calculateSMA(data, 3)).toBe([3, 4]);
  });
});
```

### Integration Tests
```typescript
describe('Lesson Completion Flow', () => {
  it('completes lesson and awards XP', async () => {
    // Mock store
    // Render LessonScreen
    // Press complete button
    // Assert XP increased
  });
});
```

### E2E (Detox)
```typescript
describe('TradeEasy App', () => {
  it('should complete a lesson', async () => {
    await element(by.id('home_screen')).tap();
    await element(by.id('continue_button')).tap();
    await element(by.text('Ejercicio')).tap();
    await element(by.text('Opción correcta')).tap();
    await expect(element(by.text('¡Correcto!'))).toBeVisible();
  });
});
```

---

## 🚀 Deployment

### Build Variants
- **development:** Debug, hot reload
- **staging:** QA, limited data
- **production:** App Store / Play Store

### EAS Build
```json
{
  "build": {
    "production": {
      "env": {
        "NODE_ENV": "production"
      },
      "ios": {
        "simulator": false
      },
      "android": {
        "gradleProperties": {
          "android.injected.signing.store.file": "keystore.jks"
        }
      }
    }
  }
}
```

### OTA Updates
- Usar `expo-updates` para hotfixes de código JS
- Datos de lecciones en servidor (fetch bajo demanda)

---

## 📈 Roadmap

### Fase 1 (MVP) - Implementado
- ✅ Estructura Feature-Sliced
- ✅ Zustand store con persistencia
- ✅ Navegación básica
- ✅ Sistema de XP y niveles
- ✅ 10 lecciones nivel 1
- ✅ Candlestick chart básico

### Fase 2 (Escalabilidad)
- [ ] Carga modular de contenido (fetch desde servidor)
- [ ] 20+ lecciones nivel 2
- [ ] Sistema de logros completo
- [ ] Rapidez en charts con WebGL (react-native-webgl)
- [ ] Tests unitarios y E2E

### Fase 3 (Avanzado)
- [ ] Modo Practice: Simulador de trading con datos históricos
- [ ] Social features: Leaderboards, grupos
- [ ] Modo offline completo
- [ ] i18n: Inglés, Español, Portugués
- [ ] Integración con APIs de brokers (demo)

---

## 📚 Recursos

### Documentación Oficial
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Navigation](https://reactnavigation.org/)

### Trading Education
- Baby Pips (textbooks)
- Investopedia
- Naked Forex (book)

---

## 🤝 Contributing

```bash
# Instalar dependencias
npm install

# Copiar .env.example a .env
cp .env.example .env

# Iniciar desarrollo
npm start

# Android
npm run android

# iOS
npm run ios
```

---

**Autor:** Jose (@aspectz)
**License:** MIT
