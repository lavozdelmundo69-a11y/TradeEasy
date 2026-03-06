// Hook para el Simulador de Trading
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useUserStore } from '../../store/userStore';
import {
  VirtualAccount,
  OpenPosition,
  ClosedTrade,
  TradeOrder,
  TradingInstrument,
  TRADING_INSTRUMENTS,
  calculateLongPnL,
  calculateShortPnL,
  generateTradeId,
  INITIAL_BALANCE,
  estimatePnL,
} from '../../types/simulator';
import { Candle } from '../../types';

interface UseSimulatorOptions {
  initialBalance?: number;
  priceData?: Candle[];  // Datos históricos para simulación
}

export function useSimulator({ initialBalance = INITIAL_BALANCE }: UseSimulatorOptions = {}) {
  const { addXP } = useUserStore();
  
  // Estado de la cuenta
  const [balance, setBalance] = useState(initialBalance);
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTrade[]>([]);
  const [currentPrice, setCurrentPrice] = useState(1.0850); // EUR/USD default
  const [selectedInstrument, setSelectedInstrument] = useState<TradingInstrument>(TRADING_INSTRUMENTS[0]);
  
  // Timer para actualizar precios
  const priceUpdateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Iniciar simulación de precios
  const startPriceSimulation = useCallback((candles: Candle[]) => {
    if (priceUpdateRef.current) clearInterval(priceUpdateRef.current);
    
    let index = 0;
    priceUpdateRef.current = setInterval(() => {
      if (index < candles.length) {
        setCurrentPrice(candles[index].close);
        index++;
      } else {
        index = 0; // Loop
      }
    }, 1000); // 1 segundo por vela
  }, []);

  // Detener simulación
  const stopPriceSimulation = useCallback(() => {
    if (priceUpdateRef.current) {
      clearInterval(priceUpdateRef.current);
      priceUpdateRef.current = null;
    }
  }, []);

  // Abrir posición
  const openPosition = useCallback((
    type: 'long' | 'short',
    quantity: number,
    stopLoss?: number,
    takeProfit?: number
  ): OpenPosition | null => {
    const cost = currentPrice * quantity * selectedInstrument.pipValue * 100;
    
    if (cost > balance) {
      return null; // No hay suficiente balance
    }

    const position: OpenPosition = {
      id: generateTradeId(),
      symbol: selectedInstrument.symbol,
      type,
      entryPrice: currentPrice,
      currentPrice,
      quantity,
      stopLoss,
      takeProfit,
      openedAt: new Date().toISOString(),
      pnl: 0,
      pnlPercent: 0,
    };

    // Descontar el costo del balance
    setBalance(prev => prev - cost);
    setPositions(prev => [...prev, position]);
    
    return position;
  }, [balance, currentPrice, selectedInstrument]);

  // Cerrar posición manualmente
  const closePosition = useCallback((positionId: string): ClosedTrade | null => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return null;

    const exitPrice = currentPrice;
    const pnlCalc = position.type === 'long'
      ? calculateLongPnL(position.entryPrice, exitPrice, position.quantity, selectedInstrument.pipValue)
      : calculateShortPnL(position.entryPrice, exitPrice, position.quantity, selectedInstrument.pipValue);

    const closed: ClosedTrade = {
      id: position.id,
      symbol: position.symbol,
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice,
      quantity: position.quantity,
      pnl: pnlCalc.pnl,
      pnlPercent: pnlCalc.pnlPercent,
      openedAt: position.openedAt,
      closedAt: new Date().toISOString(),
      duration: Math.round((Date.now() - new Date(position.openedAt).getTime()) / 60000),
      reason: 'manual',
    };

    // Devolver el capital + PnL
    const capital = position.entryPrice * position.quantity * selectedInstrument.pipValue * 100;
    setBalance(prev => prev + capital + pnlCalc.pnl);
    setPositions(prev => prev.filter(p => p.id !== positionId));
    setClosedTrades(prev => [...prev, closed]);
    
    // XP por completar trade
    addXP(pnlCalc.pnl > 0 ? 25 : 10);
    
    return closed;
  }, [positions, currentPrice, selectedInstrument, addXP]);

  // Actualizar PnL de posiciones abiertas
  const updatePositionsPnL = useCallback(() => {
    setPositions(prev => prev.map(pos => {
      const pnlCalc = pos.type === 'long'
        ? calculateLongPnL(pos.entryPrice, currentPrice, pos.quantity, selectedInstrument.pipValue)
        : calculateShortPnL(pos.entryPrice, currentPrice, pos.quantity, selectedInstrument.pipValue);
      
      return {
        ...pos,
        currentPrice,
        pnl: pnlCalc.pnl,
        pnlPercent: pnlCalc.pnlPercent,
      };
    }));
  }, [currentPrice, selectedInstrument]);

  // Verificar stop loss / take profit
  const checkStopLossTakeProfit = useCallback(() => {
    const triggeredPositions: ClosedTrade[] = [];
    
    setPositions(prev => {
      return prev.filter(pos => {
        let shouldClose = false;
        let reason: ClosedTrade['reason'] = 'manual';
        
        // Check SL
        if (pos.stopLoss) {
          if (pos.type === 'long' && currentPrice <= pos.stopLoss) {
            shouldClose = true;
            reason = 'stop-loss';
          } else if (pos.type === 'short' && currentPrice >= pos.stopLoss) {
            shouldClose = true;
            reason = 'stop-loss';
          }
        }
        
        // Check TP
        if (pos.takeProfit && !shouldClose) {
          if (pos.type === 'long' && currentPrice >= pos.takeProfit) {
            shouldClose = true;
            reason = 'take-profit';
          } else if (pos.type === 'short' && currentPrice <= pos.takeProfit) {
            shouldClose = true;
            reason = 'take-profit';
          }
        }
        
        if (shouldClose) {
          const pnlCalc = pos.type === 'long'
            ? calculateLongPnL(pos.entryPrice, currentPrice, pos.quantity, selectedInstrument.pipValue)
            : calculateShortPnL(pos.entryPrice, currentPrice, pos.quantity, selectedInstrument.pipValue);
          
          const closed: ClosedTrade = {
            id: pos.id,
            symbol: pos.symbol,
            type: pos.type,
            entryPrice: pos.entryPrice,
            exitPrice: currentPrice,
            quantity: pos.quantity,
            pnl: pnlCalc.pnl,
            pnlPercent: pnlCalc.pnlPercent,
            openedAt: pos.openedAt,
            closedAt: new Date().toISOString(),
            duration: Math.round((Date.now() - new Date(pos.openedAt).getTime()) / 60000),
            reason,
          };
          
          triggeredPositions.push(closed);
          
          // Devolver capital + PnL
          const capital = pos.entryPrice * pos.quantity * selectedInstrument.pipValue * 100;
          setBalance(b => b + capital + pnlCalc.pnl);
          
          return false; // Remove from open positions
        }
        
        return true;
      });
    });
    
    if (triggeredPositions.length > 0) {
      setClosedTrades(prev => [...prev, ...triggeredPositions]);
    }
  }, [currentPrice, selectedInstrument]);

  // Resetear cuenta
  const resetAccount = useCallback(() => {
    setBalance(initialBalance);
    setPositions([]);
    setClosedTrades([]);
    stopPriceSimulation();
  }, [initialBalance, stopPriceSimulation]);

  // Stats de la cuenta
  const accountStats = useMemo((): VirtualAccount => {
    const openPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
    const totalClosedPnL = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalTrades = closedTrades.length;
    const wins = closedTrades.filter(t => t.pnl > 0).length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    
    return {
      balance,
      initialBalance,
      equity: balance + openPnL,
      openPositions: positions,
      closedTrades,
      totalPnL: totalClosedPnL + openPnL,
      winRate,
      totalTrades,
    };
  }, [balance, initialBalance, positions, closedTrades]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (priceUpdateRef.current) {
        clearInterval(priceUpdateRef.current);
      }
    };
  }, []);

  // Actualizar PnL cada vez que cambia el precio
  useEffect(() => {
    if (positions.length > 0) {
      updatePositionsPnL();
      checkStopLossTakeProfit();
    }
  }, [currentPrice, positions.length]);

  return {
    // Estado
    balance,
    positions,
    closedTrades,
    currentPrice,
    selectedInstrument,
    instruments: TRADING_INSTRUMENTS,
    
    // Stats
    accountStats,
    
    // Acciones
    openPosition,
    closePosition,
    setSelectedInstrument,
    startPriceSimulation,
    stopPriceSimulation,
    resetAccount,
    updatePositionsPnL,
  };
}

// Hook para confirmar orden antes de ejecutar
export function useOrderConfirmation(
  simulator: ReturnType<typeof useSimulator>
) {
  const confirmOrder = useCallback((
    type: 'long' | 'short',
    quantity: number,
    stopLoss?: number,
    takeProfit?: number
  ) => {
    const { currentPrice, selectedInstrument, balance } = simulator;
    
    const estimatedPnL = estimatePnL(
      currentPrice,
      quantity,
      selectedInstrument.pipValue,
      stopLoss,
      takeProfit
    );
    
    const cost = currentPrice * quantity * selectedInstrument.pipValue * 100;
    
    return {
      order: {
        type,
        symbol: selectedInstrument.symbol,
        quantity,
        entryPrice: currentPrice,
        stopLoss,
        takeProfit,
      },
      estimatedPnL,
      accountBalance: balance,
      canExecute: cost <= balance,
    };
  }, [simulator]);

  return { confirmOrder };
}
