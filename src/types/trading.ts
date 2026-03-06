// Tipos para Escenarios de Trading Interactivos
// Añadir a src/types/trading.ts

import { Candle } from '../index';

// ==================== ESCENARIO DE TRADING ====================

export interface TradingScenario {
  id: string;
  title: string;
  description: string;
  
  // Metadatos
  topic: TradingTopic;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  
  // Contexto del mercado
  marketContext: MarketContext;
  
  // Gráfico
  candles: Candle[];
  
  // La decisión
  question: ScenarioQuestion;
  
  // Feedback post-decisión
  feedback: ScenarioFeedback;
  
  // Tags para filtering
  tags?: string[];
  relatedLessons?: string[];
}

export interface MarketContext {
  timeframe: Timeframe;
  trend: TrendDirection;
  volatility: 'low' | 'medium' | 'high';
  volume: 'low' | 'normal' | 'high';
  
  // Niveles técnicos
  supportLevels?: number[];
  resistanceLevels?: number[];
  
  // Patrón identificado (opcional)
  pattern?: ChartPattern;
  
  // Contexto narrativo
  narrative: string;
}

export type Timeframe = '5m' | '15m' | '1h' | '4h' | '1d';
export type TrendDirection = 'up' | 'down' | 'sideways';
export type ChartPattern = 
  | 'double-bottom'
  | 'double-top'
  | 'head-shoulders'
  | 'inverse-head-shoulders'
  | 'ascending-triangle'
  | 'descending-triangle'
  | 'bull-flag'
  | 'bear-flag'
  | 'breakout'
  | 'breakdown'
  | 'range-bound';

export interface ScenarioQuestion {
  text: string;
  options: readonly TradingAction[];
  correctAction: TradingAction;
  
  // Hint opcional (desbloqueable)
  hint?: string;
  hintCost?: number; // XP cost to reveal
}

export type TradingAction = 'buy' | 'sell' | 'wait' | 'buy-limit' | 'sell-limit';

export interface ScenarioFeedback {
  // Feedback inmediato
  immediate: FeedbackBlock;
  
  // Análisis técnico
  technicalAnalysis: FeedbackBlock;
  
  // Error común (si falló)
  commonMistake?: CommonMistakeFeedback;
  
  // Qué pasó después (simulado)
  whatHappened?: WhatHappenedBlock;
  
  // Lecciones aprendidas
  lessons: readonly string[];
  
  // Mejor próximo paso
  nextStep?: string;
}

export interface FeedbackBlock {
  title: string;
  content: string;
}

export interface CommonMistakeFeedback {
  title: string;
  description?: string;
  whyWrong: string;
  tipToImprove: string;
}

export interface WhatHappenedBlock {
  priceAction: string;      // "El precio rompió el soporte y cayó un 2%"
  result: 'profit' | 'loss' | 'breakeven';
  profitPercent?: number;
  keyObservation: string;
}

// ==================== TIPOS DE ESCENARIOS ====================

export type ScenarioType = 
  | 'analysis'        // Analizar y decidir
  | 'decision'        // Ejecutar operación
  | 'revision'        // Revisar qué pasó
  | 'prediction'      // Predecir siguiente movimiento
  | 'risk-management'; // Gestión de riesgo

// ==================== RESULTADO DEL USUARIO ====================

export interface ScenarioResult {
  scenarioId: string;
  userAction: TradingAction;
  isCorrect: boolean;
  answeredAt: string;
  timeSpentSeconds: number;
  xpEarned: number;
  
  // Para analytics
  confidence?: number;     // 1-5 cómo de seguro estaba
  wouldTradeAgain?: boolean;
}

// ==================== DATOS DE ESCENARIOS ====================

export const SCENARIO_TOPICS = {
  SUPPORT_RESISTANCE: 'soporte-resistencia',
  TREND: 'tendencia',
  PATTERNS: 'patrones',
  VOLUME: 'volumen',
  BREAKOUT: 'breakout',
  LIQUIDITY: 'liquidez',
  RISK: 'gestion-riesgo',
  PSYCHOLOGY: 'psicologia',
} as const;

export type TradingTopic = typeof SCENARIO_TOPICS[keyof typeof SCENARIO_TOPICS];

// ==================== HELPERS ====================

// Generar candles para un escenario
export function generateScenarioCandles(
  type: 'trend-up' | 'trend-down' | 'range' | 'breakout-up' | 'breakout-down',
  count: number = 30
): Candle[] {
  const candles: Candle[] = [];
  let basePrice = 100;
  
  for (let i = 0; i < count; i++) {
    let change = 0;
    let volatility = 0.5;
    
    switch (type) {
      case 'trend-up':
        change = Math.random() * 0.8 + 0.2;
        volatility = 0.6;
        break;
      case 'trend-down':
        change = -(Math.random() * 0.8 + 0.2);
        volatility = 0.6;
        break;
      case 'range':
        change = (Math.random() - 0.5) * 0.4;
        volatility = 0.3;
        break;
      case 'breakout-up':
        if (i < count - 5) {
          change = (Math.random() - 0.5) * 0.3;
        } else {
          change = Math.random() * 1.5 + 0.5;
        }
        volatility = i >= count - 5 ? 1.2 : 0.4;
        break;
      case 'breakout-down':
        if (i < count - 5) {
          change = (Math.random() - 0.5) * 0.3;
        } else {
          change = -(Math.random() * 1.5 + 0.5);
        }
        volatility = i >= count - 5 ? 1.2 : 0.4;
        break;
    }
    
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    
    candles.push({
      time: new Date(Date.now() - (count - i) * 3600000).toISOString(),
      open: Math.round(open * 100) / 100,
      close: Math.round(close * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
    });
    
    basePrice = close;
  }
  
  return candles;
}
