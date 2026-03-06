// SimulatorScreen - Simulador de Trading Educativo
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../shared/constants';
import { useSimulator, useOrderConfirmation } from '../../../shared/hooks/useSimulator';
import { CandlestickChart } from '../../trading/components/CandlestickChart';
import { Candle } from '../../../types';
import { TRADING_INSTRUMENTS, formatCurrency, formatPercent, TradingInstrument } from '../../../types/simulator';

const { width } = Dimensions.get('window');

// Generar datos de vela aleatorios para simulación
function generateMockCandles(basePrice: number, count: number = 20): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * 0.005 * price;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 0.002 * price;
    const low = Math.min(open, close) - Math.random() * 0.002 * price;
    
    candles.push({
      time: new Date(Date.now() - (count - i) * 60000).toISOString(),
      open: Math.round(open * 10000) / 10000,
      close: Math.round(close * 10000) / 10000,
      high: Math.round(high * 10000) / 10000,
      low: Math.round(low * 10000) / 10000,
    });
    
    price = close;
  }
  
  return candles;
}

export const SimulatorScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const simulator = useSimulator();
  const { confirmOrder } = useOrderConfirmation(simulator);
  
  const [quantity, setQuantity] = useState('0.1');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [orderType, setOrderType] = useState<'long' | 'short'>('long');
  const [candles, setCandles] = useState<Candle[]>([]);

  // Inicializar candles
  useEffect(() => {
    const initialCandles = generateMockCandles(simulator.currentPrice);
    setCandles(initialCandles);
    simulator.startPriceSimulation(initialCandles);
    
    return () => simulator.stopPriceSimulation();
  }, []);

  // Actualizar candles periódicamente
  useEffect(() => {
    if (candles.length === 0) return;
    
    const interval = setInterval(() => {
      const lastCandle = candles[candles.length - 1];
      const change = (Math.random() - 0.5) * 0.001 * simulator.currentPrice;
      const newClose = lastCandle.close + change;
      
      const newCandle: Candle = {
        time: new Date().toISOString(),
        open: lastCandle.close,
        close: Math.round(newClose * 10000) / 10000,
        high: Math.round(Math.max(lastCandle.close, newClose) * 10000) / 10000,
        low: Math.round(Math.min(lastCandle.close, newClose) * 10000) / 10000,
      };
      
      setCandles(prev => [...prev.slice(1), newCandle]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [candles.length, simulator.currentPrice]);

  const handleOpenPosition = () => {
    const qty = parseFloat(quantity) || 0.01;
    const sl = stopLoss ? parseFloat(stopLoss) : undefined;
    const tp = takeProfit ? parseFloat(takeProfit) : undefined;
    
    const confirmation = confirmOrder(orderType, qty, sl, tp);
    
    if (!confirmation.canExecute) {
      Alert.alert('Error', 'No tienes suficiente balance para esta operación');
      return;
    }

    const position = simulator.openPosition(orderType, qty, sl, tp);
    
    if (position) {
      Alert.alert(
        '✅ Posición Abierta',
        `${orderType === 'long' ? '🟢 Compra' : '🔴 Venta'} ${qty} ${simulator.selectedInstrument.symbol} @ ${simulator.currentPrice}`,
        [{ text: 'OK' }]
      );
      setStopLoss('');
      setTakeProfit('');
    }
  };

  const handleClosePosition = (positionId: string) => {
    const trade = simulator.closePosition(positionId);
    if (trade) {
      Alert.alert(
        trade.pnl >= 0 ? '✅ Trade Cerrado con ganancia' : '❌ Trade Cerrado con pérdida',
        `PnL: ${formatCurrency(trade.pnl)} (${formatPercent(trade.pnlPercent)})`,
        [{ text: 'OK' }]
      );
    }
  };

  const { accountStats, positions, selectedInstrument } = simulator;
  const hasOpenPosition = positions.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Simulador de Trading</Text>
        <TouchableOpacity onPress={simulator.resetAccount} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>{formatCurrency(accountStats.balance)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Equity</Text>
              <Text style={[
                styles.balanceValue,
                accountStats.equity >= accountStats.balance ? styles.profit : styles.loss
              ]}>
                {formatCurrency(accountStats.equity)}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>PnL Total: </Text>
            <Text style={[
              styles.statValue,
              accountStats.totalPnL >= 0 ? styles.profit : styles.loss
            ]}>
              {formatCurrency(accountStats.totalPnL)}
            </Text>
            <Text style={styles.statText}> | Wins: </Text>
            <Text style={styles.statValue}>{accountStats.winRate.toFixed(0)}%</Text>
          </View>
        </View>

        {/* Selector de instrumento */}
        <View style={styles.instrumentSelector}>
          <Text style={styles.sectionTitle}>Instrumento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TRADING_INSTRUMENTS.map((inst: TradingInstrument) => (
              <TouchableOpacity
                key={inst.symbol}
                style={[
                  styles.instrumentButton,
                  selectedInstrument.symbol === inst.symbol && styles.instrumentActive
                ]}
                onPress={() => simulator.setSelectedInstrument(inst)}
              >
                <Text style={[
                  styles.instrumentText,
                  selectedInstrument.symbol === inst.symbol && styles.instrumentTextActive
                ]}>
                  {inst.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.priceHeader}>
            <Text style={styles.priceLabel}>{selectedInstrument.symbol}</Text>
            <Text style={styles.priceValue}>{simulator.currentPrice.toFixed(5)}</Text>
          </View>
          <CandlestickChart 
            data={candles}
            width={width - SPACING.md * 2}
            height={180}
            showVolume={false}
          />
        </View>

        {/* Posiciones Abiertas */}
        {positions.length > 0 && (
          <View style={styles.positionsSection}>
            <Text style={styles.sectionTitle}>Posiciones Abiertas</Text>
            {positions.map(pos => (
              <View key={pos.id} style={styles.positionCard}>
                <View style={styles.positionHeader}>
                  <Text style={[
                    styles.positionType,
                    pos.type === 'long' ? styles.long : styles.short
                  ]}>
                    {pos.type === 'long' ? '🟢 LONG' : '🔴 SHORT'}
                  </Text>
                  <Text style={styles.positionSymbol}>{pos.symbol}</Text>
                </View>
                <View style={styles.positionDetails}>
                  <Text style={styles.positionDetail}>Entrada: {pos.entryPrice.toFixed(5)}</Text>
                  <Text style={styles.positionDetail}>Actual: {pos.currentPrice.toFixed(5)}</Text>
                  <Text style={styles.positionDetail}>Cantidad: {pos.quantity}</Text>
                </View>
                <View style={styles.positionPnL}>
                  <Text style={[
                    styles.pnlValue,
                    pos.pnl >= 0 ? styles.profit : styles.loss
                  ]}>
                    {formatCurrency(pos.pnl)} ({formatPercent(pos.pnlPercent)})
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => handleClosePosition(pos.id)}
                >
                  <Text style={styles.closeButtonText}>Cerrar Posición</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Order Panel */}
        <View style={styles.orderPanel}>
          <Text style={styles.sectionTitle}>Nueva Posición</Text>
          
          {/* Buy/Sell Toggle */}
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === 'long' && styles.longActive
              ]}
              onPress={() => setOrderType('long')}
            >
              <Text style={[
                styles.orderTypeText,
                orderType === 'long' && styles.orderTypeTextActive
              ]}>🟢 Comprar (Long)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === 'short' && styles.shortActive
              ]}
              onPress={() => setOrderType('short')}
            >
              <Text style={[
                styles.orderTypeText,
                orderType === 'short' && styles.orderTypeTextActive
              ]}>🔴 Vender (Short)</Text>
            </TouchableOpacity>
          </View>

          {/* Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cantidad (lotes)</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="0.10"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Stop Loss */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Stop Loss (opcional)</Text>
            <TextInput
              style={styles.input}
              value={stopLoss}
              onChangeText={setStopLoss}
              keyboardType="numeric"
              placeholder={`${(simulator.currentPrice * 0.99).toFixed(5)}`}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Take Profit */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Take Profit (opcional)</Text>
            <TextInput
              style={styles.input}
              value={takeProfit}
              onChangeText={setTakeProfit}
              keyboardType="numeric"
              placeholder={`${(simulator.currentPrice * 1.01).toFixed(5)}`}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Estimated PnL */}
          {quantity && parseFloat(quantity) > 0 && (
            <View style={styles.estimateBox}>
              <Text style={styles.estimateTitle}>📊 Estimación</Text>
              {stopLoss && (
                <Text style={styles.estimateRow}>
                  Stop Loss: {formatPercent(
                    orderType === 'long'
                      ? ((parseFloat(stopLoss) - simulator.currentPrice) / simulator.currentPrice * 100)
                      : ((simulator.currentPrice - parseFloat(stopLoss)) / simulator.currentPrice * 100)
                  )}
                </Text>
              )}
              {takeProfit && (
                <Text style={styles.estimateRow}>
                  Take Profit: {formatPercent(
                    orderType === 'long'
                      ? ((parseFloat(takeProfit) - simulator.currentPrice) / simulator.currentPrice * 100)
                      : ((simulator.currentPrice - parseFloat(takeProfit)) / simulator.currentPrice * 100)
                  )}
                </Text>
              )}
            </View>
          )}

          {/* Execute Button */}
          <TouchableOpacity
            style={[
              styles.executeButton,
              orderType === 'long' ? styles.longButton : styles.shortButton
            ]}
            onPress={handleOpenPosition}
          >
            <Text style={styles.executeButtonText}>
              {orderType === 'long' ? '🟢 ABRIR COMPRA' : '🔴 ABRIR VENTA'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Historial de Trades */}
        {accountStats.closedTrades.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Historial ({accountStats.closedTrades.length} trades)</Text>
            {accountStats.closedTrades.slice(-5).reverse().map(trade => (
              <View key={trade.id} style={styles.historyItem}>
                <View>
                  <Text style={[
                    styles.historyType,
                    trade.type === 'long' ? styles.long : styles.short
                  ]}>
                    {trade.type.toUpperCase()}
                  </Text>
                  <Text style={styles.historyDetail}>
                    {trade.entryPrice.toFixed(5)} → {trade.exitPrice.toFixed(5)}
                  </Text>
                </View>
                <Text style={[
                  styles.historyPnL,
                  trade.pnl >= 0 ? styles.profit : styles.loss
                ]}>
                  {formatCurrency(trade.pnl)}
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
  resetText: { color: COLORS.error, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  content: { flex: 1 },
  
  // Balance
  balanceCard: { backgroundColor: COLORS.surface, margin: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.sm },
  balanceItem: { alignItems: 'center' },
  balanceLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  balanceValue: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  statText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  statValue: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  
  // Instrument
  instrumentSelector: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  instrumentButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.full, marginRight: SPACING.sm },
  instrumentActive: { backgroundColor: COLORS.primary },
  instrumentText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  instrumentTextActive: { color: COLORS.surface, fontWeight: '600' },
  
  // Chart
  chartContainer: { backgroundColor: COLORS.surface, margin: SPACING.md, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  priceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  priceLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  priceValue: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  
  // Positions
  positionsSection: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  positionCard: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm },
  positionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  positionType: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  positionSymbol: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  positionDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  positionDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  positionPnL: { alignItems: 'flex-end', marginBottom: SPACING.sm },
  pnlValue: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  closeButton: { backgroundColor: COLORS.error, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, alignItems: 'center' },
  closeButtonText: { color: COLORS.surface, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  
  // Order Panel
  orderPanel: { backgroundColor: COLORS.surface, margin: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  orderTypeContainer: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  orderTypeButton: { flex: 1, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 2, alignItems: 'center' },
  longActive: { backgroundColor: COLORS.success + '20', borderColor: COLORS.success },
  shortActive: { backgroundColor: COLORS.error + '20', borderColor: COLORS.error },
  orderTypeText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight },
  orderTypeTextActive: { color: COLORS.text },
  inputGroup: { marginBottom: SPACING.sm },
  inputLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: 4 },
  input: { backgroundColor: COLORS.background, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, fontSize: FONT_SIZES.md, color: COLORS.text },
  estimateBox: { backgroundColor: COLORS.background, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.md },
  estimateTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  estimateRow: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  executeButton: { padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  longButton: { backgroundColor: COLORS.success },
  shortButton: { backgroundColor: COLORS.error },
  executeButtonText: { color: COLORS.surface, fontSize: FONT_SIZES.md, fontWeight: '700' },
  
  // History
  historySection: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginBottom: 4 },
  historyType: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  historyDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  historyPnL: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  
  // Utils
  profit: { color: COLORS.success },
  loss: { color: COLORS.error },
  long: { color: COLORS.success },
  short: { color: COLORS.error },
  bottomSpacer: { height: SPACING.xl },
});
