// Tipos para el Simulador de Trading
// Añadir a src/types/simulator.ts

import { Candle } from '../index';

// ==================== CUENTA VIRTUAL ====================

export interface VirtualAccount {
  balance: number;           // Saldo actual
  initialBalance: number;    // Saldo inicial ($10,000)
  equity: number;            // Balance + PnL abierto
  openPositions: OpenPosition[];
  closedTrades: ClosedTrade[];
  totalPnL: number;          // PnL total acumulado
  winRate: number;          // Porcentaje de wins
  totalTrades: number;      // Total de trades cerrados
}

export const INITIAL_BALANCE = 10000;

// ==================== POSICIONES ====================

export interface OpenPosition {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;          // Cantidad/lotes
  stopLoss?: number;
  takeProfit?: number;
  openedAt: string;
  pnl: number;               // PnL no realizado
  pnlPercent: number;       // PnL en porcentaje
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
  closedAt: string;
  duration: number;          // Minutos
  reason: 'manual' | 'stop-loss' | 'take-profit';
}

// ==================== ORDENES ====================

export interface TradeOrder {
  type: 'long' | 'short';
  symbol: string;
  quantity: number;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface OrderConfirmation {
  order: TradeOrder;
  estimatedPnL?: EstimatedPnL;
  riskReward?: number;
  accountBalance: number;
}

// ==================== CÁLCULOS DE PnL ====================

export interface EstimatedPnL {
  atStopLoss: number;
  atStopLossPercent: number;
  atTakeProfit: number;
  atTakeProfitPercent: number;
  riskRewardRatio: number;
  riskAmount: number;
  rewardAmount: number;
}

// ==================== INSTRUMENTOS ====================

export interface TradingInstrument {
  symbol: string;
  name: string;
  type: 'forex' | 'crypto' | 'stock';
  pipValue: number;          // Valor de 1 pip
  minQuantity: number;
  examplePrice: number;
}

export const TRADING_INSTRUMENTS: TradingInstrument[] = [
  { symbol: 'EUR/USD', name: 'Euro/Dólar', type: 'forex', pipValue: 10, minQuantity: 0.01, examplePrice: 1.0850 },
  { symbol: 'GBP/USD', name: 'Libra/Dólar', type: 'forex', pipValue: 10, minQuantity: 0.01, examplePrice: 1.2650 },
  { symbol: 'BTC/USD', name: 'Bitcoin', type: 'crypto', pipValue: 1, minQuantity: 0.001, examplePrice: 43000 },
  { symbol: 'ETH/USD', name: 'Ethereum', type: 'crypto', pipValue: 0.1, minQuantity: 0.01, examplePrice: 2500 },
];

// ==================== HELPERS DE CÁLCULO ====================

// Calcular PnL para posición long
export function calculateLongPnL(
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  pipValue: number
): { pnl: number; pnlPercent: number } {
  const pips = (currentPrice - entryPrice) / entryPrice * 10000; // Pips reales
  const pnl = pips * pipValue * quantity;
  const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
  return { pnl, pnlPercent };
}

// Calcular PnL para posición short
export function calculateShortPnL(
  entryPrice: number,
  currentPrice: number,
  quantity: number,
  pipValue: number
): { pnl: number; pnlPercent: number } {
  const pips = (entryPrice - currentPrice) / entryPrice * 10000;
  const pnl = pips * pipValue * quantity;
  const pnlPercent = ((entryPrice - currentPrice) / entryPrice) * 100;
  return { pnl, pnlPercent };
}

// Estimar PnL con SL/TP
export function estimatePnL(
  entryPrice: number,
  quantity: number,
  pipValue: number,
  stopLoss?: number,
  takeProfit?: number
): EstimatedPnL | undefined {
  if (!stopLoss && !takeProfit) return undefined;
  
  const riskAmount = stopLoss 
    ? Math.abs(entryPrice - stopLoss) * quantity * pipValue * 100
    : 0;
  
  const rewardAmount = takeProfit
    ? Math.abs(takeProfit - entryPrice) * quantity * pipValue * 100
    : 0;
  
  const atStopLoss = stopLoss 
    ? (stopLoss > entryPrice 
        ? Math.abs(stopLoss - entryPrice) * quantity * pipValue * 100
        : -Math.abs(entryPrice - stopLoss) * quantity * pipValue * 100)
    : 0;
  
  const atTakeProfit = takeProfit
    ? (takeProfit > entryPrice
        ? Math.abs(takeProfit - entryPrice) * quantity * pipValue * 100
        : -Math.abs(entryPrice - takeProfit) * quantity * pipValue * 100)
    : 0;
  
  const atStopLossPercent = stopLoss
    ? ((stopLoss - entryPrice) / entryPrice) * 100
    : 0;
  
  const atTakeProfitPercent = takeProfit
    ? ((takeProfit - entryPrice) / entryPrice) * 100
    : 0;
  
  const riskRewardRatio = riskAmount > 0 && rewardAmount > 0 
    ? rewardAmount / riskAmount 
    : 0;
  
  return {
    atStopLoss,
    atStopLossPercent,
    atTakeProfit,
    atTakeProfitPercent,
    riskRewardRatio,
    riskAmount,
    rewardAmount,
  };
}

// Generar ID único
export function generateTradeId(): string {
  return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Formatear moneda
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Formatear porcentaje
export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}
