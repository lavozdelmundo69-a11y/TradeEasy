// Tipos para Market Replay
// Añadir a src/types/replay.ts

import { Candle } from '../index';

// ==================== REPLAY ====================

export interface MarketReplay {
  id: string;
  title: string;
  description: string;
  symbol: string;
  timeframe: string;
  
  // Datos completos del mercado
  allCandles: Candle[];
  
  // Puntos de decisión (donde el usuario debe decidir)
  decisionPoints: DecisionPoint[];
  
  // Info adicional
  trend: 'up' | 'down' | 'sideways';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
}

export interface DecisionPoint {
  // Cuál vela es esta en el array
  candleIndex: number;
  
  // La pregunta
  question: string;
  
  // Contexto adicional
  context?: string;
  
  // La respuesta correcta
  correctAction: ReplayAction;
  
  // Feedback
  feedback: DecisionFeedback;
}

export type ReplayAction = 'buy' | 'sell' | 'wait';

export interface DecisionFeedback {
  title: string;
  explanation: string;
  whatHappened: string;
  keyLearning: string;
}

// ==================== ESTADO DEL REPLAY ====================

export interface ReplayState {
  // Replay actual
  replay: MarketReplay | null;
  currentIndex: number;          // Índice de la vela actual
  visibleCandles: Candle[];     // Velas mostradas hasta ahora
  
  // Trading durante replay
  hasOpenPosition: boolean;
  positionType: 'long' | 'short' | null;
  positionEntryIndex: number;
  positionEntryPrice: number;
  positionQuantity: number;
  
  // Resultados
  trades: ReplayTrade[];
  totalPnL: number;
  
  // Estado
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  currentDecision: DecisionPoint | null;
  showDecisionResult: boolean;
  wasDecisionCorrect: boolean | null;
}

export interface ReplayTrade {
  id: string;
  entryIndex: number;
  exitIndex: number;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
  reason: 'decision' | 'manual' | 'replay-end';
}

// ==================== CONFIG ====================

export const REPLAY_CONFIG = {
  INITIAL_CANDLES: 20,       // Velas iniciales mostradas
  AUTO_ADVANCE_DELAY: 2000,  // ms entre velas en modo auto
  SPEED_OPTIONS: [1, 2, 5], // velocidad 1x, 2x, 5x
};

// ==================== HELPERS ====================

// Generar replay aleatorio
export function generateRandomReplay(
  symbol: string,
  trend: 'up' | 'down' | 'sideways',
  candleCount: number = 30
): MarketReplay {
  const candles: Candle[] = [];
  let basePrice = 1.0850;
  
  // Generar tendencia
  for (let i = 0; i < candleCount; i++) {
    let change: number;
    
    switch (trend) {
      case 'up':
        change = Math.random() * 0.003 + 0.001; // Sesgo alcista
        break;
      case 'down':
        change = -(Math.random() * 0.003 + 0.001); // Sesgo bajista
        break;
      default:
        change = (Math.random() - 0.5) * 0.002;
    }
    
    // Añadir algo de ruido
    change += (Math.random() - 0.5) * 0.001;
    
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * 0.0005;
    const low = Math.min(open, close) - Math.random() * 0.0005;
    
    candles.push({
      time: new Date(Date.now() - (candleCount - i) * 3600000).toISOString(),
      open: Math.round(open * 100000) / 100000,
      close: Math.round(close * 100000) / 100000,
      high: Math.round(high * 100000) / 100000,
      low: Math.round(low * 100000) / 100000,
    });
    
    basePrice = close;
  }
  
  // Crear decision points
  const decisionPoints: DecisionPoint[] = [];
  
  // Punto de decisión en la vela 10
  decisionPoints.push({
    candleIndex: 10,
    question: 'El precio ha subido constantemente. ¿Qué harías ahora?',
    correctAction: 'wait',
    feedback: {
      title: 'La tendencia se está agotando',
      explanation: 'El precio ha subido mucho sin corrección. Espera un pullback.',
      whatHappened: 'El precio hizo un pullback en las siguientes velas.',
      keyLearning: 'No persigas el precio. Espera entradas en zonas de control.',
    },
  });
  
  // Punto de decisión en la vela 20
  decisionPoints.push({
    candleIndex: 20,
    question: 'El precio está en soporte. ¿Entrarías ahora?',
    correctAction: 'buy',
    feedback: {
      title: '¡Buena entrada en soporte!',
      explanation: 'El soporteholdió y había señales de compradores.',
      whatHappened: 'El precio rebotó desde el soporte.',
      keyLearning: 'Los rebotes en soportes son buenas oportunidades de compra.',
    },
  });
  
  return {
    id: `replay_${Date.now()}`,
    title: `Replay ${symbol} - Tendencia ${trend === 'up' ? 'Alcista' : trend === 'down' ? 'Bajista' : 'Lateral'}`,
    description: `Analiza el mercado y toma decisiones en tiempo real`,
    symbol,
    timeframe: '1h',
    allCandles: candles,
    decisionPoints,
    trend,
    difficulty: trend === 'sideways' ? 'beginner' : 'intermediate',
    xpReward: 50,
  };
}

// Generar ID único
export function generateReplayId(): string {
  return `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
