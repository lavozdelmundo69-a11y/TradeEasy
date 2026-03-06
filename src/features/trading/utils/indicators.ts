// Utilidades para trading y gráficos
import { Candle } from '../../types';

// Calcular SMA (Simple Moving Average)
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

// Calcular EMA (Exponential Moving Average)
export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // SMA como primer valor
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  result.push(sum / period);
  
  // EMA para el resto
  for (let i = period; i < data.length; i++) {
    const ema = (data[i] - result[result.length - 1]) * multiplier + result[result.length - 1];
    result.push(ema);
  }
  
  return result;
}

// Encontrar niveles de soporte y resistencia
export function findSupportResistance(candles: Candle[]): { 
  supports: number[]; 
  resistances: number[] 
} {
  const supports: number[] = [];
  const resistances: number[] = [];
  
  if (candles.length < 5) return { supports, resistances };
  
  // Local minima/maxima con ventana
  for (let i = 2; i < candles.length - 2; i++) {
    const isLocalMin = 
      candles[i].low < candles[i - 1].low &&
      candles[i].low < candles[i - 2].low &&
      candles[i].low < candles[i + 1].low &&
      candles[i].low < candles[i + 2].low;
    
    const isLocalMax = 
      candles[i].high > candles[i - 1].high &&
      candles[i].high > candles[i - 2].high &&
      candles[i].high > candles[i + 1].high &&
      candles[i].high > candles[i + 2].high;
    
    if (isLocalMin) supports.push(candles[i].low);
    if (isLocalMax) resistances.push(candles[i].high);
  }
  
  // Agrupar niveles similares (dentro de 0.5%)
  const groupLevels = (levels: number[], tolerance = 0.005): number[] => {
    if (levels.length === 0) return [];
    
    const sorted = [...levels].sort((a, b) => a - b);
    const grouped: number[] = [];
    let currentGroup = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const diff = (sorted[i] - currentGroup[currentGroup.length - 1]) / currentGroup[currentGroup.length - 1];
      if (diff < tolerance) {
        currentGroup.push(sorted[i]);
      } else {
        // Promedio del grupo
        grouped.push(currentGroup.reduce((a, b) => a + b, 0) / currentGroup.length);
        currentGroup = [sorted[i]];
      }
    }
    grouped.push(currentGroup.reduce((a, b) => a + b, 0) / currentGroup.length);
    
    return grouped;
  };
  
  return {
    supports: groupLevels(supports),
    resistances: groupLevels(resistances),
  };
}

// Calcular niveles de Fibonacci
export function calculateFibonacci(high: number, low: number): {
  levels: number[];
  labels: string[];
} {
  const diff = high - low;
  const levels = [
    low,
    low + diff * 0.236,
    low + diff * 0.382,
    low + diff * 0.5,
    low + diff * 0.618,
    low + diff * 0.786,
    high,
  ];
  const labels = ['0%', '23.6%', '38.2%', '50%', '61.8%', '78.6%', '100%'];
  
  return { levels, labels };
}

// Detectar tendencias
export function detectTrend(candles: Candle[], lookback = 10): 'up' | 'down' | 'sideways' {
  if (candles.length < lookback) return 'sideways';
  
  const recent = candles.slice(-lookback);
  const highs = recent.map(c => c.high);
  const lows = recent.map(c => c.low);
  
  const hh = highs.every((h, i) => i === 0 || h >= highs[i - 1]);
  const hl = lows.every((l, i) => i === 0 || l >= lows[i - 1]);
  
  if (hh && hl) return 'up';
  
  const ll = lows.every((l, i) => i === 0 || l <= lows[i - 1]);
  const lh = highs.every((h, i) => i === 0 || h <= highs[i - 1]);
  
  if (ll && lh) return 'down';
  
  return 'sideways';
}

// Calcular RSI
export function calculateRSI(data: number[], period = 14): number[] {
  if (data.length < period + 1) return [];
  
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  const gains: number[] = changes.map(c => (c > 0 ? c : 0));
  const losses: number[] = changes.map(c => (c < 0 ? -c : 0));
  
  const rsi: number[] = [];
  
  // Primer promedio
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // RSI para el primer punto
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - 100 / (1 + rs));
  
  // Suavizado
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    const newRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + newRs));
  }
  
  return rsi;
}

// Generar datos de velas simulados para practice
export function generateMockCandles(
  count: number,
  startPrice: number,
  volatility = 0.02,
  trend: 'up' | 'down' | 'sideways' = 'sideways'
): Candle[] {
  const candles: Candle[] = [];
  let currentPrice = startPrice;
  const trendBias = trend === 'up' ? 1.001 : trend === 'down' ? 0.999 : 1;
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice * trendBias;
    const open = currentPrice;
    const close = currentPrice + change;
    
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice * 0.5;
    
    candles.push({
      time: new Date(Date.now() - (count - i) * 60000).toISOString(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000) + 1000,
    });
    
    currentPrice = close;
  }
  
  return candles;
}
