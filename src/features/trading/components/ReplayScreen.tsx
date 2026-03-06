// ReplayScreen - Market Replay: El usuario decide vela por vela
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../shared/constants';
import { useMarketReplay } from '../../../shared/hooks/useMarketReplay';
import { CandlestickChart } from '../../trading/components/CandlestickChart';
import { generateRandomReplay, ReplayAction } from '../../../types/replay';
import { formatCurrency as formatCurrencyUtil, formatPercent as formatPercentUtil } from '../../../types/simulator';

const { width } = Dimensions.get('window');

interface ReplayScreenProps {
  onBack: () => void;
}

export const ReplayScreen: React.FC<ReplayScreenProps> = ({ onBack }) => {
  // Generar replay aleatorio al inicio
  const [replay, setReplay] = useState(() => 
    generateRandomReplay('EUR/USD', 'up', 30)
  );
  
  const {
    state,
    advanceCandle,
    play,
    pause,
    reset,
    openPosition,
    closePosition,
    answerDecision,
  } = useMarketReplay({ replay });
  
  const { 
    currentIndex, 
    visibleCandles, 
    hasOpenPosition, 
    positionType,
    positionEntryPrice,
    trades,
    totalPnL,
    isPlaying,
    isComplete,
    currentDecision,
    showDecisionResult,
    wasDecisionCorrect,
  } = state;
  
  const currentPrice = visibleCandles[visibleCandles.length - 1]?.close || 0;
  
  // Calcular PnL de posición abierta
  const openPnL = hasOpenPosition 
    ? (positionType === 'long' 
        ? (currentPrice - positionEntryPrice) * 10000 
        : (positionEntryPrice - currentPrice) * 10000)
    : 0;
  
  const handleTrade = (type: 'long' | 'short') => {
    if (hasOpenPosition) {
      Alert.alert('Posición existente', 'Ya tienes una posición abierta');
      return;
    }
    openPosition(type);
    Alert.alert(
      type === 'long' ? '🟢 Posición Abierta' : '🔴 Posición Abierta',
      `Entry: ${positionEntryPrice.toFixed(5)}`
    );
  };

  const handleClose = () => {
    const trade = closePosition();
    if (trade) {
      Alert.alert(
        trade.pnl >= 0 ? '✅ Trade cerrado con ganancia' : '❌ Trade cerrado con pérdida',
        `PnL: ${formatCurrencyUtil(trade.pnl)} (${formatPercentUtil(trade.pnlPercent)})`
      );
    }
  };

  const handleDecision = (action: ReplayAction) => {
    answerDecision(action);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Market Replay</Text>
        <TouchableOpacity onPress={reset} style={styles.resetButton}>
          <Text style={styles.resetText}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Vela</Text>
          <Text style={styles.infoValue}>{currentIndex + 1}/{replay.allCandles.length}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Precio</Text>
          <Text style={styles.infoValue}>{currentPrice.toFixed(5)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>PnL</Text>
          <Text style={[styles.infoValue, openPnL >= 0 ? styles.profit : styles.loss]}>
            {openPnL >= 0 ? '+' : ''}{openPnL.toFixed(0)} pips
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Chart */}
        <View style={styles.chartContainer}>
          <CandlestickChart 
            data={visibleCandles}
            width={width - SPACING.md * 2}
            height={200}
            showVolume={false}
          />
        </View>

        {/* Posición Abierta */}
        {hasOpenPosition && (
          <View style={styles.positionCard}>
            <View style={styles.positionHeader}>
              <Text style={[
                styles.positionType,
                positionType === 'long' ? styles.long : styles.short
              ]}>
                {positionType === 'long' ? '🟢 LONG' : '🔴 SHORT'}
              </Text>
              <Text style={styles.positionEntry}>
                @ {positionEntryPrice.toFixed(5)}
              </Text>
            </View>
            <Text style={[
              styles.positionPnL,
              openPnL >= 0 ? styles.profit : styles.loss
            ]}>
              {openPnL >= 0 ? '+' : ''}{openPnL.toFixed(0)} pips
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Cerrar Posición</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Decision Point */}
        {currentDecision && (
          <View style={styles.decisionCard}>
            <Text style={styles.decisionTitle}>🎯 Punto de Decisión</Text>
            <Text style={styles.decisionQuestion}>{currentDecision.question}</Text>
            
            {!showDecisionResult ? (
              <View style={styles.decisionActions}>
                <TouchableOpacity 
                  style={[styles.decisionButton, styles.buyButton]}
                  onPress={() => handleDecision('buy')}
                >
                  <Text style={styles.decisionButtonText}>🟢 Comprar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.decisionButton, styles.sellButton]}
                  onPress={() => handleDecision('sell')}
                >
                  <Text style={styles.decisionButtonText}>🔴 Vender</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.decisionButton, styles.waitButton]}
                  onPress={() => handleDecision('wait')}
                >
                  <Text style={styles.decisionButtonText}>⏳ Esperar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[
                styles.resultCard,
                wasDecisionCorrect ? styles.resultCorrect : styles.resultWrong
              ]}>
                <Text style={styles.resultTitle}>
                  {wasDecisionCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}
                </Text>
                <Text style={styles.resultText}>
                  {currentDecision.feedback.explanation}
                </Text>
                <Text style={styles.learningText}>
                  💡 {currentDecision.feedback.keyLearning}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Controles */}
        <View style={styles.controlsContainer}>
          {isComplete ? (
            <View style={styles.completeCard}>
              <Text style={styles.completeTitle}>🎉 Replay Completado</Text>
              <View style={styles.resultsRow}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Trades</Text>
                  <Text style={styles.resultValue}>{trades.length}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>PnL Total</Text>
                  <Text style={[
                    styles.resultValue,
                    totalPnL >= 0 ? styles.profit : styles.loss
                  ]}>
                    {formatCurrencyUtil(totalPnL)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.replayButton} onPress={reset}>
                <Text style={styles.replayButtonText}>Reproducir de nuevo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.controls}>
              {!isPlaying ? (
                <TouchableOpacity style={styles.playButton} onPress={play}>
                  <Text style={styles.playButtonText}>▶ Reproducir</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.pauseButton} onPress={pause}>
                  <Text style={styles.pauseButtonText}>⏸ Pausar</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={advanceCandle}
                disabled={isPlaying}
              >
                <Text style={[
                  styles.nextButtonText,
                  isPlaying && styles.disabledText
                ]}>
                  Vela Siguiente →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Trading durante replay */}
        {!isComplete && !currentDecision && (
          <View style={styles.tradePanel}>
            <Text style={styles.tradePanelTitle}>Operar durante replay</Text>
            <View style={styles.tradeButtons}>
              <TouchableOpacity 
                style={[styles.tradeButton, styles.longTradeButton]}
                onPress={() => handleTrade('long')}
                disabled={hasOpenPosition}
              >
                <Text style={styles.tradeButtonText}>🟢 Long</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tradeButton, styles.shortTradeButton]}
                onPress={() => handleTrade('short')}
                disabled={hasOpenPosition}
              >
                <Text style={styles.tradeButtonText}>🔴 Short</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Historial de trades */}
        {trades.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Historial de Trades</Text>
            {trades.map((trade, index) => (
              <View key={trade.id} style={styles.historyItem}>
                <View>
                  <Text style={[
                    styles.historyType,
                    trade.type === 'long' ? styles.long : styles.short
                  ]}>
                    {trade.type.toUpperCase()}
                  </Text>
                  <Text style={styles.historyRange}>
                    {trade.entryIndex + 1} → {trade.exitIndex + 1}
                  </Text>
                </View>
                <Text style={[
                  styles.historyPnL,
                  trade.pnl >= 0 ? styles.profit : styles.loss
                ]}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(0)} pips
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: SPACING.md, 
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  backButton: { padding: SPACING.xs },
  backText: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  resetButton: { padding: SPACING.xs },
  resetText: { color: COLORS.error, fontSize: FONT_SIZES.lg },
  
  // Info Bar
  infoBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    backgroundColor: COLORS.surface, 
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  infoValue: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  
  content: { flex: 1 },
  
  // Chart
  chartContainer: { backgroundColor: COLORS.surface, margin: SPACING.md, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  
  // Position
  positionCard: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  positionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  positionType: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  positionEntry: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  positionPnL: { fontSize: FONT_SIZES.xl, fontWeight: '700', marginBottom: SPACING.sm },
  closeButton: { backgroundColor: COLORS.error, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, alignItems: 'center' },
  closeButtonText: { color: COLORS.surface, fontWeight: '600' },
  
  // Decision
  decisionCard: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md, borderWidth: 2, borderColor: COLORS.warning },
  decisionTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.warning, marginBottom: SPACING.sm },
  decisionQuestion: { fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.md },
  decisionActions: { flexDirection: 'row', gap: SPACING.sm },
  decisionButton: { flex: 1, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, alignItems: 'center' },
  buyButton: { backgroundColor: COLORS.success },
  sellButton: { backgroundColor: COLORS.error },
  waitButton: { backgroundColor: COLORS.warning },
  decisionButtonText: { color: COLORS.surface, fontWeight: '600', fontSize: FONT_SIZES.sm },
  
  // Result
  resultCard: { padding: SPACING.md, borderRadius: BORDER_RADIUS.md },
  resultCorrect: { backgroundColor: COLORS.success + '20' },
  resultWrong: { backgroundColor: COLORS.error + '20' },
  resultTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: SPACING.xs },
  resultText: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: SPACING.sm },
  learningText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontStyle: 'italic' },
  
  // Controls
  controlsContainer: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  controls: { flexDirection: 'row', gap: SPACING.sm },
  playButton: { flex: 1, backgroundColor: COLORS.success, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  playButtonText: { color: COLORS.surface, fontWeight: '700' },
  pauseButton: { flex: 1, backgroundColor: COLORS.warning, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  pauseButtonText: { color: COLORS.surface, fontWeight: '700' },
  nextButton: { flex: 1, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  nextButtonText: { color: COLORS.surface, fontWeight: '700' },
  disabledText: { opacity: 0.5 },
  
  // Complete
  completeCard: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
  completeTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md },
  resultsRow: { flexDirection: 'row', gap: SPACING.xl, marginBottom: SPACING.md },
  resultItem: { alignItems: 'center' },
  resultLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  resultValue: { fontSize: FONT_SIZES.xl, fontWeight: '700' },
  replayButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md },
  replayButtonText: { color: COLORS.surface, fontWeight: '600' },
  
  // Trade Panel
  tradePanel: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md },
  tradePanelTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginBottom: SPACING.sm },
  tradeButtons: { flexDirection: 'row', gap: SPACING.sm },
  tradeButton: { flex: 1, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, alignItems: 'center' },
  longTradeButton: { backgroundColor: COLORS.success + '30', borderWidth: 1, borderColor: COLORS.success },
  shortTradeButton: { backgroundColor: COLORS.error + '30', borderWidth: 1, borderColor: COLORS.error },
  tradeButtonText: { fontWeight: '600', fontSize: FONT_SIZES.sm },
  
  // History
  historySection: { paddingHorizontal: SPACING.md },
  historyTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', marginBottom: SPACING.sm },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginBottom: 4 },
  historyType: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  historyRange: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  historyPnL: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  
  // Utils
  profit: { color: COLORS.success },
  loss: { color: COLORS.error },
  long: { color: COLORS.success },
  short: { color: COLORS.error },
  bottomSpacer: { height: SPACING.xl },
});
