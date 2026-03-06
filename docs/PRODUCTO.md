# TradeEasy - Estrategia de Producto y Roadmap

## Estado Actual

La app tiene:
- Sistema de lecciones con quizzes
- Gráficos de velas SVG
- Gamificación (XP, niveles, rachas)
- Carga lazy de contenido
- 20 lecciones en 2 niveles

---

## 1️⃣ Mejoras en el Sistema de Aprendizaje

### Progresión de Dificultad

**Sistema de 3 Tracks:**
```
Beginner Track (Nivel 1-2)
├── Conceptos básicos
├── Vocabulario trading
└── Primeros gráficos

Intermediate Track (Nivel 3-4)
├── Lectura de velas
├── Soportes/Resistencias
└── Tendencias

Advanced Track (Nivel 5+)
├── Estrategias SMC
├── Gestión de riesgo
└── Psicotecnia
```

**Implementación:**
- Cada lección tiene difficulty: easy/medium/hard
- El usuario no puede saltar difficulty
- Debe aprobar 70%+ para pasar al siguiente nivel

### Repetición de Errores (Spaced Repetition)

**Sistema de "Errores Débiles":**
- Cada pregunta tiene un "peso de debilidad"
- Si fallas, weight += 1
- Las preguntas con weight alto aparecen más seguido
- Se guarda en AsyncStorage: `weakQuestions: { [questionId]: weight }`

**Algoritmo Simple:**
```typescript
const getNextQuestion = (userHistory) => {
  // 70% probabilidad de pregunta débil
  // 30% probabilidad de pregunta aleatoria
  if (Math.random() < 0.7) {
    return getHighestWeightQuestion(userHistory.weakQuestions);
  }
  return getRandomQuestion();
}
```

### Aprendizaje Adaptativo

**Medir comprensión por tema:**
```typescript
const topicUnderstanding = {
  'velas': { total: 10, correct: 8 },  // 80%
  'soportes': { total: 5, correct: 2 },  // 40%
};
// Si < 60%, mostrar más contenido de ese tema
```

**Acciones automáticas:**
- Si accuracy < 60% en un tema → bloquear siguiente nivel
- Si accuracy > 80% → permitir accelerate (saltar ejercicios)

### Feedback Educativo Tras Cada Respuesta

**Estructura de feedback mejorada:**
```typescript
interface AnswerFeedback {
  correct: boolean;
  explanation: string;           // WHY (la explicación)
  marketContext?: string;        // Contexto del mercado
  tipForNextTime?: string;        //Consejo actionable
  relatedLesson?: string;         // Lecciones relacionadas
  commonMistake?: string;         // Error común que comete la gente
}
```

**Tipos de feedback:**
1. **Inmediato** → "¡Correcto! / Incorrecto porque..."
2. **Post-decisión** → Análisis de trading
3. **Diario** → Resumen de weak spots
4. **Semanal** → Reporte de progreso

---

## 2️⃣ Sistema de Escenarios de Trading Avanzado

### Estructura de Escenarios

```typescript
interface TradingScenario {
  id: string;
  title: string;
  type: 'analisis' | 'decision' | 'revision';
  
  // Contexto del mercado
  marketData: {
    candles: Candle[];        // 20-50 velas
    timeframe: '1h' | '4h' | '1d';
    trend: 'up' | 'down' | 'sideways';
    keyLevel?: number;        // Soporte/resistencia
    pattern?: string;        // Doble suelo, HCH, etc.
  };
  
  // La decisión del usuario
  userDecision?: {
    action: 'buy' | 'sell' | 'wait';
    entry?: number;
    stopLoss?: number;
    takeProfit?: number;
  };
  
  // Feedback post-decisión
  analysis: {
    correctAction: 'buy' | 'sell' | 'wait';
    reason: string;
    whatHappened: string;     // Qué pasó después
    lesson: string;
  };
}
```

### Tipos de Escenarios

**1. Análisis (el más básico)**
- "Mira este gráfico y decide: ¿qué harías?"
- Sin presión de tiempo
- Feedback inmediato

**2. Decisión (con consecuencias)**
- Tienes $10,000 virtuales
- Decide: buy/sell/wait
- Ver resultado después (simulated)

**3. Revisión (análisis post-mercado)**
- "Ayer el precio hizo X. ¿Qué hubieras hecho?"
- Analiza sin presión

### Detectar Errores Comunes

**Errores predefinidos por tema:**
```typescript
const commonMistakes = {
  'soporte': [
    'Comprar inmediatamente al tocar soporte sin esperar confirmación',
    'No poner stop loss en soporte',
    'Comprar sin verificar volumen',
  ],
  'tendencia': [
    'Contra-tendencia en mercado fuerte',
    'No identificar el timeframe mayor',
  ],
};
```

**Feedback personalizado:**
- Si el usuario falla en soporte
- "Error común:Comprar al tocar soporte. ¿Por qué es peligroso?"

---

## 3️⃣ Features Diferenciales

### Feature 1: Simulador de Trading Real

**MVP:**
- $10,000 virtuales inicial
- Solo 1 operación a la vez
- Sin leverage (simplificado)
- Solo instrumentos principales (EUR/USD, BTC)

**Experiencia:**
1. Estás en una lección de "Soportes"
2. "Practica": abre simulador
3. Gráfico en tiempo real (datos históricos)
4. Ejecuta operación
5. Mira el resultado en las siguientes velas
6. Recibes feedback educativo

**Beneficio:** El usuario aprende haciendo, no solo leyendo.

### Feature 2: Market Replay

**Qué es:**
- Grabar sesiones de trading
- Ver el mercado "en vivo" sin presión
- Pausar, analizar, decidir

**Estructura:**
```typescript
interface MarketReplay {
  id: string;
  title: string;                    // "EUR/USD - Reversión en soporte"
  date: string;
  duration: number;                  // minutos
  startPrice: number;
  candles: Candle[];               // Todo el replay
  decisionPoints: DecisionPoint[];  // Dónde pararse y decidir
}

interface DecisionPoint {
  candleIndex: number;
  price: number;
  question: string;
  userAnswer?: string;
  correctAnswer: string;
}
```

**Experiencia de usuario:**
1. Selecciona un replay
2. El mercado avanza candle a candle
3. En decision points, el replay se pausa
4. "¿Qué harías ahora?"
5. Reveals what actually happened

### Feature 3: Análisis Automático de Decisiones

**Qué hace:**
- Después de cada operación en simulador
- Analiza: ¿entrada buena? ¿stop correcto? ¿ timeframe correcto?

**Métricas a analizar:**
```typescript
interface TradeAnalysis {
  // Entrada
  entryQuality: 'good' | 'ok' | 'poor';
  entryReason: string;
  
  // Gestión
  riskRewardRatio: number;
  stopDistance: number;        // % desde entrada
  
  // Contexto
  alignedWithTrend: boolean;
  respectedSupport: boolean;
  volumeConfirmed: boolean;
  
  // Feedback
  feedback: string;            // "Tu stop estaba muy ajustado..."
}
```

**Output para usuario:**
- Después de 10 operaciones: "Reporte de trading"
- "Has trades con buen risk/reward"
- "Necesitas mejorar en: reconocer tendencia"

---

## 4️⃣ Sistema de Contenido Escalable

### Estructura de Niveles

```
content/
├── structure.json              # Índice maestro
├── searchIndex.json           # Búsqueda full-text
├── levels/
│   ├── level-1/              # Fundamentos
│   │   ├── module-1.json     # 10 lecciones
│   │   ├── module-2.json
│   │   └── quizzes.json      # 50+ preguntas
│   │
│   ├── level-2/              # Análisis Técnico
│   │   ├── module-1.json
│   │   ├── module-2.json
│   │   ├── scenarios/        # 30+ escenarios
│   │   │   ├── soporte.json
│   │   │   ├── resistencia.json
│   │   │   └── tendencias.json
│   │   └── quizzes.json
│   │
│   └── level-3/              # Estrategias
│       ├── smc/
│       ├── wyckoff/
│       └── backtests/
├── replays/                   # Market Replays
│   ├── eurusd-reversal.json
│   └── btc-breakout.json
└── common-mistakes/
    └── errors.json
```

### Sistema de Tags para Búsqueda

```json
{
  "tags": {
    "beginner": ["l1_01", "l1_02", ...],
    "soporte": ["l1_07", "l2_01", ...],
    "swing-trading": ["l3_01", "l3_02", ...],
    "psicologia": ["l3_10", ...]
  },
  "skills": {
    "lectura-velas": 15,
    "soportes-resistencias": 12,
    "gestion-riesgo": 8
  }
}
```

### Progresión de Dificultad por Tema

```typescript
const topicProgression = {
  'velas': {
    beginner: ['tipos-vela', 'cuerpo-sombra'],
    intermediate: ['patrones', 'multi-timeframe'],
    advanced: ['orden-blocks', 'liquidity-zones']
  }
};
```

---

## 5️⃣ Roadmap de Desarrollo

### Semana 1: Sistema de Aprendizaje Core

**Día 1-2: Feedback Educativo Mejorado**
- [ ] Añadir commonMistake a cada ejercicio
- [ ] Añadir relatedLesson links
- [ ] Feedback estructurado post-respuesta

**Día 3-4: Sistema de Errores Débiles**
- [ ] Guardar preguntas falladas en store
- [ ] Algoritmo de repetición
- [ ] Dashboard de "mis debilidades"

**Día 5: Progresión Adaptativa**
- [ ] Medir accuracy por tema
- [ ] Bloquear niveles si < 60%
- [ ] Mostrar weak spots al usuario

### Semana 2: Simulador y Escenarios

**Día 6-8: Simulador Basic**
- [ ] Pantalla de simulador
- [ ] $10,000 virtual
- [ ] Buy/Sell/Wait buttons
- [ ] Mostrar resultado post-decisión

**Día 9-10: Escenarios de Trading**
- [ ] Crear 10 escenarios iniciales
- [ ] Integrar con lecciones
- [ ] Feedback post-decisión

### Post-MVP (Semana 3-4)

- Market Replay
- Análisis automático de trades
- Más escenarios (50+)
- Más lecciones (100+)

---

## Métricas de Éxito del MVP

1. **Engagement:**
   - 5+ lecciones/día por usuario
   - 70%+ accuracy en quizzes

2. **Aprendizaje:**
   - 50% mejora en weak spots tras repetición
   - 3+ operaciones en simulador

3. **Retención:**
   - 7-day streak
   - Retouren 3+ veces/semana

---

## Resumen de Prioridades

| Prioridad | Feature | Impacto | Esfuerzo |
|----------|---------|----------|-----------|
| 1 | Feedback post-respuesta | Alto | Bajo |
| 2 | Errores débiles (spaced repetition) | Alto | Medio |
| 3 | Simulador básico | Alto | Alto |
| 4 | Escenarios de trading | Medio | Medio |
| 5 | Progresión adaptativa | Alto | Medio |

---

*Documento creado: 2026-03-06*
