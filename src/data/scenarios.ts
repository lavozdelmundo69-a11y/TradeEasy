// 5 Escenarios de Trading Completos - Ejemplos
import { TradingScenario } from '../types/trading';

export const SAMPLE_SCENARIOS: TradingScenario[] = [
  // ========== ESCENARIO 1: SOPORTE CON RECHAZO ==========
  {
    id: 'scenario_sr_01',
    title: 'El precio toca soporte',
    description: 'Identifica la acción correcta cuando el precio toca una zona de soporte',
    topic: 'soporte-resistencia',
    difficulty: 'beginner',
    xpReward: 50,
    
    marketContext: {
      timeframe: '1h',
      trend: 'sideways',
      volatility: 'medium',
      volume: 'high',
      supportLevels: [1.0850, 1.0830],
      resistanceLevels: [1.0920],
      narrative: 'El precio ha estado moviéndose en un rango entre 1.0830 y 1.0920 durante las últimas horas. Actualmente está bajando hacia el soporte en 1.0850 con volumen decreciente.',
    },
    
    candles: [
      { time: '2024-01-15T08:00:00Z', open: 1.0900, high: 1.0915, low: 1.0890, close: 1.0905 },
      { time: '2024-01-15T09:00:00Z', open: 1.0905, high: 1.0910, low: 1.0895, close: 1.0900 },
      { time: '2024-01-15T10:00:00Z', open: 1.0900, high: 1.0905, low: 1.0885, close: 1.0890 },
      { time: '2024-01-15T11:00:00Z', open: 1.0890, high: 1.0895, low: 1.0870, close: 1.0875 },
      { time: '2024-01-15T12:00:00Z', open: 1.0875, high: 1.0880, low: 1.0860, close: 1.0865 },
      { time: '2024-01-15T13:00:00Z', open: 1.0865, high: 1.0870, low: 1.0855, close: 1.0860 },
      { time: '2024-01-15T14:00:00Z', open: 1.0860, high: 1.0865, low: 1.0850, close: 1.0855 },
      { time: '2024-01-15T15:00:00Z', open: 1.0855, high: 1.0860, low: 1.0845, close: 1.0850 },
      { time: '2024-01-15T16:00:00Z', open: 1.0850, high: 1.0875, low: 1.0845, close: 1.0870 },
      { time: '2024-01-15T17:00:00Z', open: 1.0870, high: 1.0885, low: 1.0865, close: 1.0880 },
    ],
    
    question: {
      text: '¿Qué harías cuando el precio toca el soporte en 1.0850?',
      options: ['buy', 'sell', 'wait'],
      correctAction: 'wait',
      hint: 'Observa el volumen. ¿Confirmación de compradores?',
      hintCost: 5,
    },
    
    feedback: {
      immediate: {
        title: 'La mejor opción era ESPERAR',
        content: 'Aunque el precio toca soporte, no hay confirmación de reversión aun.',
      },
      technicalAnalysis: {
        title: 'Análisis Técnico',
        content: 'El soporte en 1.0850 es una zona importante. Sin embargo, el volumen decreasing durante la caída indica falta de convicción vendedor. Debes esperar: 1) Una vela de reversión (hammer, engulfing bullish) 2) Un rechazo claro del nivel 3) Confirmación con volumen',
      },
      commonMistake: {
        title: 'Error común: Comprar al soporte sin confirmación',
        whyWrong: 'El soporte puede romper. Comprar al primer toque es muy arriesgado porque no hay confirmación de que los compradores estén defendiendo el nivel.',
        tipToImprove: 'Espera una vela de confirmación compradores o un patrón de reversión antes de entrar.',
      },
      whatHappened: {
        priceAction: 'El precio rechazó el soporte con una vela hammer y rebotó hasta 1.0920 (+0.65%)',
        result: 'profit',
        profitPercent: 0.65,
        keyObservation: 'La vela hammer en el soporte confirmó la presencia de compradores.',
      },
      lessons: [
        'Siempre espera confirmación antes de operar en niveles clave',
        'El volumen es crucial para validar movimientos',
        'Los soportes no son líneas exactas, son ZONAS',
      ],
      nextStep: 'Practica identificando zonas de soporte en gráficos históricos',
    },
    tags: ['soporte', 'confirmacion', 'volumen'],
    relatedLessons: ['l1_07', 'l1_08'],
  },

  // ========== ESCENARIO 2: BREAKOUT FALSO ==========
  {
    id: 'scenario_breakout_01',
    title: 'El falso breakout',
    description: 'Aprende a identificar breakouts falsos',
    topic: 'breakout',
    difficulty: 'intermediate',
    xpReward: 75,
    
    marketContext: {
      timeframe: '4h',
      trend: 'sideways',
      volatility: 'low',
      volume: 'low',
      resistanceLevels: [1.2500],
      pattern: 'range-bound',
      narrative: 'El precio ha estado consolidando entre 1.2400 y 1.2500 durante varios días. Rompe la resistencia con una vela larga, pero el volumen es bajo.',
    },
    
    candles: [
      { time: '2024-01-10T00:00:00Z', open: 1.2420, high: 1.2450, low: 1.2410, close: 1.2445 },
      { time: '2024-01-10T04:00:00Z', open: 1.2445, high: 1.2460, low: 1.2435, close: 1.2450 },
      { time: '2024-01-10T08:00:00Z', open: 1.2450, high: 1.2470, low: 1.2445, close: 1.2465 },
      { time: '2024-01-10T12:00:00Z', open: 1.2465, high: 1.2480, low: 1.2460, close: 1.2475 },
      { time: '2024-01-10T16:00:00Z', open: 1.2475, high: 1.2490, low: 1.2470, close: 1.2485 },
      { time: '2024-01-10T20:00:00Z', open: 1.2485, high: 1.2510, low: 1.2480, close: 1.2505 },
      { time: '2024-01-11T00:00:00Z', open: 1.2505, high: 1.2550, low: 1.2500, close: 1.2540 },
      { time: '2024-01-11T04:00:00Z', open: 1.2540, high: 1.2545, low: 1.2490, close: 1.2500 },
      { time: '2024-01-11T08:00:00Z', open: 1.2500, high: 1.2510, low: 1.2450, close: 1.2460 },
      { time: '2024-01-11T12:00:00Z', open: 1.2460, high: 1.2470, low: 1.2420, close: 1.2430 },
    ],
    
    question: {
      text: 'El precio acaba de romper 1.2500 con una vela grande. ¿Qué haces?',
      options: ['buy', 'sell', 'wait'],
      correctAction: 'wait',
      hint: 'Falta un elemento clave para confirmar el breakout...',
      hintCost: 10,
    },
    
    feedback: {
      immediate: {
        title: '¡Sospechoso!',
        content: 'El breakout tiene muchas señales de alerta. ¿Te diste cuenta?',
      },
      technicalAnalysis: {
        title: 'Análisis Técnico',
        content: 'Aunque el precio rompió la resistencia, hay 3 señales de alerta: 1) Volumen BAJO durante el breakout (debería ser alto) 2) La vela de breakout es muy larga (potencial agotamiento) 3) No hubo retest del nivel roto. Los breakouts falsos suelen ocurrir con bajo volumen.',
      },
      commonMistake: {
        title: 'Error común: Comprar en cualquier breakout',
        whyWrong: 'El 70% de los breakouts fallan. Sin volumen confirmado, es una apuesta muy arriesgada.',
        tipToImprove: 'Espera un retest exitoso del nivel o confirmación con volumen alto antes de entrar.',
      },
      whatHappened: {
        priceAction: 'Falso breakout: el precio volvió por debajo de 1.2500 y cayó a 1.2430 (-0.95%)',
        result: 'loss',
        profitPercent: -0.95,
        keyObservation: 'Quien compró en el breakout perdió. Quien vendió después del rechazo ganó.',
      },
      lessons: [
        'Los breakouts necesitan volumen alto para ser válidos',
        'El precio puede ir muy arriba antes de volver',
        'Siempre hay más gente atrapada en el lado equivocado',
      ],
      nextStep: 'Busca patrones de acumulación antes de breakout en tus análisis',
    },
    tags: ['breakout', 'volumen', 'falso'],
    relatedLessons: ['l2_01', 'l2_02'],
  },

  // ========== ESCENARIO 3: TENDENCIA CON PULLBACK ==========
  {
    id: 'scenario_trend_01',
    title: 'Entrar en tendencia',
    description: 'Aprende a identificar puntos de entrada en tendencias',
    topic: 'tendencia',
    difficulty: 'beginner',
    xpReward: 50,
    
    marketContext: {
      timeframe: '1h',
      trend: 'up',
      volatility: 'medium',
      volume: 'normal',
      supportLevels: [1.1780],
      narrative: 'Hay una tendencia alcista clara. El precio hace un pullback hacia el soporte dinámico (media móvil) en 1.1780.',
    },
    
    candles: [
      { time: '2024-01-12T10:00:00Z', open: 1.1700, high: 1.1720, low: 1.1690, close: 1.1715 },
      { time: '2024-01-12T11:00:00Z', open: 1.1715, high: 1.1740, low: 1.1710, close: 1.1735 },
      { time: '2024-01-12T12:00:00Z', open: 1.1735, high: 1.1760, low: 1.1730, close: 1.1755 },
      { time: '2024-01-12T13:00:00Z', open: 1.1755, high: 1.1780, low: 1.1750, close: 1.1775 },
      { time: '2024-01-12T14:00:00Z', open: 1.1775, high: 1.1790, low: 1.1770, close: 1.1785 },
      { time: '2024-01-12T15:00:00Z', open: 1.1785, high: 1.1790, low: 1.1760, close: 1.1765 },
      { time: '2024-01-12T16:00:00Z', open: 1.1765, high: 1.1775, low: 1.1755, close: 1.1770 },
      { time: '2024-01-12T17:00:00Z', open: 1.1770, high: 1.1780, low: 1.1765, close: 1.1775 },
      { time: '2024-01-12T18:00:00Z', open: 1.1775, high: 1.1800, low: 1.1770, close: 1.1795 },
      { time: '2024-01-12T19:00:00Z', open: 1.1795, high: 1.1820, low: 1.1790, close: 1.1815 },
    ],
    
    question: {
      text: 'El precio hace pullback hacia 1.1780. ¿Cuál es la mejor estrategia?',
      options: ['buy', 'sell', 'wait'],
      correctAction: 'buy',
      hint: 'La tendencia es tu amiga. Busca entrada en...',
      hintCost: 5,
    },
    
    feedback: {
      immediate: {
        title: '¡Correcto!',
        content: 'En tendencia alcista, los pullbacks son oportunidades de compra.',
      },
      technicalAnalysis: {
        title: 'Análisis Técnico',
        content: 'Esta es una configuración clásica: 1) Tendencia alcista clara (HH/HL) 2) Pullback a soporte (1.1780) 3) Vela de rechazo comprador 4) Continuidad de tendencia. El mejor punto de entrada es cuando el precio respeta el soporte y gira al alza.',
      },
      commonMistake: {
        title: 'Error común: No operar a favor de la tendencia',
        whyWrong: 'La tendencia tiene inertia. Operar contra ella es como nadar contra la corriente.',
        tipToImprove: 'En tendencias alcistas, busca compras en retrocesos. En bajistas, busca ventas en rebotes.',
      },
      whatHappened: {
        priceAction: 'El precio rebotó en 1.1780 y continuó subiendo hasta 1.1850 (+0.55%)',
        result: 'profit',
        profitPercent: 0.55,
        keyObservation: 'El soporte dinámico acted como trampolín para la siguiente pierna.',
      },
      lessons: [
        'La tendencia es tu aliada',
        'Los pullbacks son oportunidades, no señales de reversal',
        'Usa Soportes dinámicos (medias móviles) para entrar',
      ],
      nextStep: 'Practica identificar tendencias en múltiples timeframes',
    },
    tags: ['tendencia', 'pullback', 'soporte-dinamico'],
    relatedLessons: ['l1_05', 'l1_06'],
  },

  // ========== ESCENARIO 4: VOLUMEN CONFIRMA BREAKOUT ==========
  {
    id: 'scenario_volume_01',
    title: 'Volumen = Confirmación',
    description: 'Entiende la relación entre volumen y movimientos de precio',
    topic: 'volumen',
    difficulty: 'intermediate',
    xpReward: 75,
    
    marketContext: {
      timeframe: '1h',
      trend: 'up',
      volatility: 'high',
      volume: 'high',
      resistanceLevels: [1.3200],
      pattern: 'breakout',
      narrative: 'El precio rompe resistencia clave en 1.3200 con aumento significativo de volumen. Es una señal muy bullish.',
    },
    
    candles: [
      { time: '2024-01-18T08:00:00Z', open: 1.3150, high: 1.3170, low: 1.3145, close: 1.3165, volume: 1200 },
      { time: '2024-01-18T09:00:00Z', open: 1.3165, high: 1.3180, low: 1.3160, close: 1.3175, volume: 1100 },
      { time: '2024-01-18T10:00:00Z', open: 1.3175, high: 1.3190, low: 1.3170, close: 1.3185, volume: 1300 },
      { time: '2024-01-18T11:00:00Z', open: 1.3185, high: 1.3210, low: 1.3180, close: 1.3205, volume: 2500 },
      { time: '2024-01-18T12:00:00Z', open: 1.3205, high: 1.3250, low: 1.3200, close: 1.3240, volume: 3200 },
      { time: '2024-01-18T13:00:00Z', open: 1.3240, high: 1.3270, low: 1.3235, close: 1.3265, volume: 2800 },
      { time: '2024-01-18T14:00:00Z', open: 1.3265, high: 1.3280, low: 1.3255, close: 1.3275, volume: 2400 },
      { time: '2024-01-18T15:00:00Z', open: 1.3275, high: 1.3290, low: 1.3265, close: 1.3285, volume: 2100 },
    ],
    
    question: {
      text: 'El precio acaba de romper 1.3200 con alto volumen. ¿Qué haces?',
      options: ['buy', 'sell', 'wait'],
      correctAction: 'buy',
      hint: 'El volumen confirma la fuerza del movimiento...',
      hintCost: 10,
    },
    
    feedback: {
      immediate: {
        title: '¡Excelente lectura!',
        content: 'El alto volumen en el breakout es una señal muy fuerte.',
      },
      technicalAnalysis: {
        title: 'Análisis Técnico',
        content: 'Este breakout tiene TODOS los elementos válidos: 1) Volumen ALTO (3x promedio) 2) Vela fuerte de ruptura 3) Continuidad con alto volumen 4) No hay rechazo inmediato. El volumen es la validación de que el movimiento es real.',
      },
      commonMistake: {
        title: 'Error común: Ignorar el volumen',
        whyWrong: 'Sin volumen, el precio puede easily revertirse. Alto volumen = convicción.',
        tipToImprove: 'Siempre compara el volumen actual con el promedio de los últimas 20 velas.',
      },
      whatHappened: {
        priceAction: 'Breakout válido: el precio continuó subiendo hasta 1.3350 (+1.1%) con volumen sostenido',
        result: 'profit',
        profitPercent: 1.1,
        keyObservation: 'El alto volumen desde el inicio confirmó que era un movimiento real.',
      },
      lessons: [
        'Volumen alto =movimiento válido',
        'Volumen bajo = probabilidad de falso breakout',
        'Compara volumen actual con promedio histórico',
      ],
      nextStep: 'Practica agregando el indicador de volumen a tus gráficos',
    },
    tags: ['volumen', 'breakout', 'confirmacion'],
    relatedLessons: ['l2_07', 'l2_08'],
  },

  // ========== ESCENARIO 5: GESTIÓN DE RIESGO ==========
  {
    id: 'scenario_risk_01',
    title: ' ¿Cuánto arriesgas?',
    description: 'Aprende a calcular posición y stop loss',
    topic: 'gestion-riesgo',
    difficulty: 'advanced',
    xpReward: 100,
    
    marketContext: {
      timeframe: '1h',
      trend: 'up',
      volatility: 'high',
      volume: 'normal',
      supportLevels: [1.1550],
      narrative: 'Quieres comprar en 1.1600 con stop en 1.1550 (50 pips de riesgo). Tu cuenta tiene $10,000 y arriesgas máximo 2%.',
    },
    
    candles: [
      { time: '2024-01-20T10:00:00Z', open: 1.1580, high: 1.1610, low: 1.1575, close: 1.1605 },
      { time: '2024-01-20T11:00:00Z', open: 1.1605, high: 1.1620, low: 1.1595, close: 1.1610 },
      { time: '2024-01-20T12:00:00Z', open: 1.1610, high: 1.1615, low: 1.1585, close: 1.1590 },
      { time: '2024-01-20T13:00:00Z', open: 1.1590, high: 1.1600, low: 1.1580, close: 1.1595 },
      { time: '2024-01-20T14:00:00Z', open: 1.1595, high: 1.1605, low: 1.1590, close: 1.1600 },
    ],
    
    question: {
      text: 'Con $10,000 de cuenta y 2% de riesgo máximo, ¿cuántos lotes/minilotes operarías? (1 miniloto = $1/pip)',
      options: ['buy', 'sell', 'wait'],
      correctAction: 'wait', // Esta es una pregunta de cálculo, no de dirección
      hint: 'Riesgo = $10,000 x 2% = $200. Con 50 pips de stop...',
      hintCost: 10,
    },
    
    feedback: {
      immediate: {
        title: 'Cálculo correcto',
        content: '$200 / 50 pips = 4 mini-lotes (0.4 lotes estándar)',
      },
      technicalAnalysis: {
        title: 'Gestión de Riesgo',
        content: 'Cálculo: 1. Riesgo máximo: $10,000 x 2% = $200 2. Distancia stop: 50 pips 3. Tamaño posición: $200 / 50 = 4 mini-lotes. Esto te da un ratio riesgo:beneficio de 1:2 si tomas profit en 1.1700 (100 pips).',
      },
      commonMistake: {
        title: 'Error común: Arriesgar más del 2%',
        whyWrong: 'Arriesgar más puede vaciar tu cuenta con una racha perdedora.',
        tipToImprove: 'Nunca arriesgues más del 2% por trade. Usa stops siempre.',
      },
      whatHappened: {
        priceAction: 'El precio subió a 1.1700 (+100 pips). Con tu gestión, ganaste $400 (4% de la cuenta)',
        result: 'profit',
        profitPercent: 4,
        keyObservation: 'La buena gestión de riesgo te permitió dormir tranquilo mientras el trade evolucionaba.',
      },
      lessons: [
        'Nunca arriesgues más del 2% por trade',
        'Calcula siempre el tamaño de posición ANTES de entrar',
        'El ratio riesgo:beneficio debe ser al menos 1:2',
        'La supervivencia es más importante que la ganancia rápida',
      ],
      nextStep: 'Crea una hoja de cálculo para calcular tamaño de posición automáticamente',
    },
    tags: ['riesgo', 'gestion-capital', 'tamanio-posicion'],
    relatedLessons: ['l3_01'],
  },
];
