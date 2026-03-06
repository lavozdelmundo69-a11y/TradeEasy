// Hook para Market Replay
import { useState, useCallback, useEffect, useRef } from 'react';
import { useUserStore } from '../../store/userStore';
import {
  MarketReplay,
  ReplayState,
  ReplayTrade,
  DecisionPoint,
  ReplayAction,
  REPLAY_CONFIG,
} from '../../types/replay';

interface UseMarketReplayOptions {
  replay: MarketReplay;
  onComplete?: (results: { trades: ReplayTrade[]; totalPnL: number }) => void;
}

export function useMarketReplay({ replay, onComplete }: UseMarketReplayOptions) {
  const { addXP } = useUserStore();
  
  // Estado inicial
  const [state, setState] = useState<ReplayState>({
    replay,
    currentIndex: REPLAY_CONFIG.INITIAL_CANDLES,
    visibleCandles: replay.allCandles.slice(0, REPLAY_CONFIG.INITIAL_CANDLES),
    hasOpenPosition: false,
    positionType: null,
    positionEntryIndex: 0,
    positionEntryPrice: 0,
    positionQuantity: 0,
    trades: [],
    totalPnL: 0,
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    currentDecision: null,
    showDecisionResult: false,
    wasDecisionCorrect: null,
  });

  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Encontrar decision point actual
  const findCurrentDecision = useCallback((): DecisionPoint | null => {
    const decision = replay.decisionPoints.find(
      d => d.candleIndex === state.currentIndex
    );
    return decision || null;
  }, [replay.decisionPoints, state.currentIndex]);

  // Actualizar decision point cuando cambia el índice
  useEffect(() => {
    const decision = findCurrentDecision();
    setState(prev => ({
      ...prev,
      currentDecision: decision,
      showDecisionResult: false,
      wasDecisionCorrect: null,
    }));
  }, [state.currentIndex, findCurrentDecision]);

  // Calcular PnL
  const calcPnL = useCallback((type: 'long' | 'short', entry: number, exit: number, quantity: number) => {
    if (type === 'long') {
      return (exit - entry) * quantity * 10000;
    }
    return (entry - exit) * quantity * 10000;
  }, []);

  // Calcular PnL %
  const calcPnLPercent = useCallback((type: 'long' | 'short', entry: number, exit: number) => {
    if (type === 'long') {
      return ((exit - entry) / entry) * 100;
    }
    return ((entry - exit) / entry) * 100;
  }, []);

  // Avanzar una vela
  const advanceCandle = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex >= prev.replay!.allCandles.length - 1) {
        return { ...prev, isPlaying: false, isComplete: true };
      }
      
      const nextIndex = prev.currentIndex + 1;
      const newVisible = [...prev.visibleCandles, prev.replay!.allCandles[nextIndex]];
      
      // Si tiene posición abierta, calcular PnL
      let newTrades = [...prev.trades];
      let newTotalPnL = prev.totalPnL;
      let newHasPosition = prev.hasOpenPosition;
      let newPositionType = prev.positionType;
      
      if (prev.hasOpenPosition) {
        const currentPrice = prev.replay!.allCandles[nextIndex].close;
        const pnl = calcPnL(prev.positionType!, prev.positionEntryPrice, currentPrice, prev.positionQuantity);
        
        // Cerrar en el último candle
        if (nextIndex === prev.replay!.allCandles.length - 1) {
          const trade: ReplayTrade = {
            id: `trade_${nextIndex}`,
            entryIndex: prev.positionEntryIndex,
            exitIndex: nextIndex,
            type: prev.positionType!,
            entryPrice: prev.positionEntryPrice,
            exitPrice: currentPrice,
            pnl,
            pnlPercent: calcPnLPercent(prev.positionType!, prev.positionEntryPrice, currentPrice),
            reason: 'replay-end',
          };
          newTrades.push(trade);
          newTotalPnL += pnl;
          newHasPosition = false;
          newPositionType = null;
        }
      }
      
      return {
        ...prev,
        currentIndex: nextIndex,
        visibleCandles: newVisible,
        trades: newTrades,
        totalPnL: newTotalPnL,
        hasOpenPosition: newHasPosition,
        positionType: newPositionType,
      };
    });
  }, [calcPnL, calcPnLPercent]);

  // Reproducción automática
  const play = useCallback(() => {
    setState(prev => {
      if (prev.isComplete) return prev;
      return { ...prev, isPlaying: true, isPaused: false };
    });
    
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    
    autoPlayRef.current = setInterval(() => {
      setState(prev => {
        if (prev.currentIndex >= prev.replay!.allCandles.length - 1) {
          clearInterval(autoPlayRef.current!);
          return { ...prev, isPlaying: false, isComplete: true };
        }
        return prev;
      });
      advanceCandle();
    }, REPLAY_CONFIG.AUTO_ADVANCE_DELAY);
  }, [advanceCandle]);

  // Pausar
  const pause = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
  }, []);

  // Resetear
  const reset = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setState({
      replay,
      currentIndex: REPLAY_CONFIG.INITIAL_CANDLES,
      visibleCandles: replay.allCandles.slice(0, REPLAY_CONFIG.INITIAL_CANDLES),
      hasOpenPosition: false,
      positionType: null,
      positionEntryIndex: 0,
      positionEntryPrice: 0,
      positionQuantity: 0,
      trades: [],
      totalPnL: 0,
      isPlaying: false,
      isPaused: false,
      isComplete: false,
      currentDecision: null,
      showDecisionResult: false,
      wasDecisionCorrect: null,
    });
  }, [replay]);

  // Abrir posición durante replay
  const openPosition = useCallback((type: 'long' | 'short', quantity: number = 1) => {
    setState(prev => {
      const currentPrice = prev.visibleCandles[prev.visibleCandles.length - 1].close;
      return {
        ...prev,
        hasOpenPosition: true,
        positionType: type,
        positionEntryIndex: prev.currentIndex,
        positionEntryPrice: currentPrice,
        positionQuantity: quantity,
      };
    });
  }, []);

  // Cerrar posición
  const closePosition = useCallback((): ReplayTrade | null => {
    let result: ReplayTrade | null = null;
    
    setState(prev => {
      if (!prev.hasOpenPosition) return prev;
      
      const currentPrice = prev.visibleCandles[prev.visibleCandles.length - 1].close;
      const pnl = calcPnL(prev.positionType!, prev.positionEntryPrice, currentPrice, prev.positionQuantity);
      
      const trade: ReplayTrade = {
        id: `trade_${prev.currentIndex}`,
        entryIndex: prev.positionEntryIndex,
        exitIndex: prev.currentIndex,
        type: prev.positionType!,
        entryPrice: prev.positionEntryPrice,
        exitPrice: currentPrice,
        pnl,
        pnlPercent: calcPnLPercent(prev.positionType!, prev.positionEntryPrice, currentPrice),
        reason: 'manual',
      };
      
      result = trade;
      
      return {
        ...prev,
        hasOpenPosition: false,
        positionType: null,
        trades: [...prev.trades, trade],
        totalPnL: prev.totalPnL + pnl,
      };
    });
    
    return result;
  }, [calcPnL, calcPnLPercent]);

  // Responder a decisión
  const answerDecision = useCallback((action: ReplayAction) => {
    setState(prev => {
      if (!prev.currentDecision) return prev;
      
      const isCorrect = action === prev.currentDecision.correctAction;
      
      // Si la decisión es correcta y dice buy/sell, abrir posición
      if (isCorrect && (action === 'buy' || action === 'sell')) {
        const currentPrice = prev.visibleCandles[prev.visibleCandles.length - 1].close;
        const newState = {
          ...prev,
          showDecisionResult: true,
          wasDecisionCorrect: isCorrect,
        };
        
        if (action === 'buy') {
          newState.hasOpenPosition = true;
          newState.positionType = 'long';
          newState.positionEntryIndex = prev.currentIndex;
          newState.positionEntryPrice = currentPrice;
          newState.positionQuantity = 1;
        } else {
          newState.hasOpenPosition = true;
          newState.positionType = 'short';
          newState.positionEntryIndex = prev.currentIndex;
          newState.positionEntryPrice = currentPrice;
          newState.positionQuantity = 1;
        }
        
        return newState;
      }
      
      return {
        ...prev,
        showDecisionResult: true,
        wasDecisionCorrect: isCorrect,
      };
    });
    
    // XP por decisión
    const decision = state.currentDecision;
    if (decision) {
      addXP(action === decision.correctAction ? 20 : 5);
    }
  }, [state.currentDecision, addXP]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  // Notificar completion
  useEffect(() => {
    if (state.isComplete) {
      onComplete?.({ trades: state.trades, totalPnL: state.totalPnL });
      addXP(state.totalPnL > 0 ? 30 : 10);
    }
  }, [state.isComplete]);

  return {
    state,
    advanceCandle,
    play,
    pause,
    reset,
    openPosition,
    closePosition,
    answerDecision,
  };
}
