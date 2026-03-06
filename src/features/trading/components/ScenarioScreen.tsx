// ScenarioScreen - Pantalla de Escenarios de Trading Interactivos
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../shared/constants';
import { TradingScenario, TradingAction, ScenarioFeedback } from '../../../types/trading';
import { CandlestickChart } from '../../trading/components/CandlestickChart';

const { width } = Dimensions.get('window');

interface ScenarioScreenProps {
  scenario: TradingScenario;
  onComplete: (result: any) => void;
  onBack: () => void;
}

const ACTION_COLORS: Record<TradingAction, { bg: string; border: string; text: string }> = {
  buy: { bg: COLORS.success + '20', border: COLORS.success, text: COLORS.success },
  sell: { bg: COLORS.error + '20', border: COLORS.error, text: COLORS.error },
  wait: { bg: COLORS.warning + '20', border: COLORS.warning, text: COLORS.warning },
  'buy-limit': { bg: COLORS.success + '30', border: COLORS.success, text: COLORS.success },
  'sell-limit': { bg: COLORS.error + '30', border: COLORS.error, text: COLORS.error },
};

const ACTION_LABELS: Record<TradingAction, string> = {
  buy: '🟢 Comprar',
  sell: '🔴 Vender',
  wait: '⏳ Esperar',
  'buy-limit': '🟢+ Comprar en pullback',
  'sell-limit': '🔴+ Vender en rally',
};

export const ScenarioScreen: React.FC<ScenarioScreenProps> = ({
  scenario,
  onComplete,
  onBack,
}) => {
  const [selectedAction, setSelectedAction] = useState<TradingAction | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect = selectedAction === scenario.question.correctAction;

  const handleAction = (action: TradingAction) => {
    if (showResult) return;
    setSelectedAction(action);
    setShowResult(true);
    
    // Calcular XP
    const xpEarned = action === scenario.question.correctAction 
      ? scenario.xpReward 
      : Math.floor(scenario.xpReward * 0.2);
    
    onComplete({
      scenarioId: scenario.id,
      userAction: action,
      isCorrect: action === scenario.question.correctAction,
      xpEarned,
    });
  };

  const renderChart = () => (
    <View style={styles.chartContainer}>
      <CandlestickChart 
        data={scenario.candles}
        width={width - SPACING.md * 2}
        height={250}
        showVolume={scenario.marketContext.volume !== 'normal'}
      />
      {/* Soporte/Resistencia overlays */}
      {scenario.marketContext.supportLevels?.map((level, i) => (
        <View key={`support-${i}`} style={[styles.levelLine, { 
          bottom: ((level - Math.min(...scenario.candles.map(c => c.low))) / 
            (Math.max(...scenario.candles.map(c => c.high)) - Math.min(...scenario.candles.map(c => c.low)))) * 250,
          backgroundColor: COLORS.success,
        }]} />
      ))}
      {scenario.marketContext.resistanceLevels?.map((level, i) => (
        <View key={`resistance-${i}`} style={[styles.levelLine, { 
          bottom: ((level - Math.min(...scenario.candles.map(c => c.low))) / 
            (Math.max(...scenario.candles.map(c => c.high)) - Math.min(...scenario.candles.map(c => c.low)))) * 250,
          backgroundColor: COLORS.error,
        }]} />
      ))}
    </View>
  );

  const renderDecision = () => (
    <View style={styles.decisionContainer}>
      <Text style={styles.questionText}>{scenario.question.text}</Text>
      
      <View style={styles.actionsContainer}>
        {scenario.question.options.map((action) => {
          const colors = ACTION_COLORS[action];
          const isSelected = selectedAction === action;
          const isCorrectAction = action === scenario.question.correctAction;
          
          let buttonStyle = [styles.actionButton, { borderColor: colors.border, backgroundColor: colors.bg }];
          if (showResult && isCorrectAction) {
            buttonStyle.push(styles.correctButton);
          } else if (showResult && isSelected && !isCorrectAction) {
            buttonStyle.push(styles.wrongButton);
          }
          
          return (
            <TouchableOpacity
              key={action}
              style={buttonStyle as any}
              onPress={() => handleAction(action)}
              disabled={showResult}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>
                {ACTION_LABELS[action]}
              </Text>
              {showResult && isCorrectAction && (
                <Text style={styles.resultIcon}>✓</Text>
              )}
              {showResult && isSelected && !isCorrectAction && (
                <Text style={styles.resultIcon}>✗</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Hint button */}
      {scenario.question.hint && !showHint && !showResult && (
        <TouchableOpacity 
          style={styles.hintButton}
          onPress={() => setShowHint(true)}
        >
          <Text style={styles.hintText}>💡 Pista (-{scenario.question.hintCost || 0} XP)</Text>
        </TouchableOpacity>
      )}

      {showHint && (
        <View style={styles.hintBox}>
          <Text style={styles.hintContent}>{scenario.question.hint}</Text>
        </View>
      )}
    </View>
  );

  const renderFeedback = () => {
    const feedback = scenario.feedback;
    
    return (
      <ScrollView style={styles.feedbackContainer} showsVerticalScrollIndicator={false}>
        {/* Resultado */}
        <View style={[
          styles.resultBanner,
          isCorrect ? styles.resultBannerCorrect : styles.resultBannerWrong
        ]}>
          <Text style={styles.resultTitle}>
            {isCorrect ? '🎉 ¡Correcto!' : '💡 Mmm, no exactamente'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {isCorrect 
              ? 'Has identificado correctamente la acción'
              : `La mejor opción era: ${ACTION_LABELS[scenario.question.correctAction]}`
            }
          </Text>
        </View>

        {/* Análisis Técnico */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackSectionTitle}>📊 Análisis Técnico</Text>
          <Text style={styles.feedbackContent}>{feedback.technicalAnalysis.content}</Text>
        </View>

        {/* Error Común (si falló) */}
        {!isCorrect && feedback.commonMistake && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackSectionTitle}>⚠️ Error Común</Text>
            <Text style={styles.mistakeTitle}>{feedback.commonMistake.title}</Text>
            <Text style={styles.feedbackContent}>{feedback.commonMistake.whyWrong}</Text>
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 {feedback.commonMistake.tipToImprove}</Text>
            </View>
          </View>
        )}

        {/* Qué pasó después */}
        {feedback.whatHappened && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackSectionTitle}>📈 ¿Qué pasó después?</Text>
            <Text style={styles.feedbackContent}>{feedback.whatHappened.priceAction}</Text>
            {feedback.whatHappened.profitPercent && (
              <Text style={[
                styles.profitText,
                feedback.whatHappened.result === 'profit' ? styles.profit : styles.loss
              ]}>
                {feedback.whatHappened.result === 'profit' ? '+' : ''}
                {feedback.whatHappened.profitPercent}% 
                {feedback.whatHappened.result === 'profit' ? ' de ganancia' : ' de pérdida'}
              </Text>
            )}
          </View>
        )}

        {/* Lecciones */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackSectionTitle}>📚 Lecciones</Text>
          {feedback.lessons.map((lesson, i) => (
            <Text key={i} style={styles.lessonItem}>• {lesson}</Text>
          ))}
        </View>

        {/* Botón continuar */}
        <TouchableOpacity style={styles.continueButton} onPress={onBack}>
          <Text style={styles.continueButtonText}>Continuar →</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{scenario.title}</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>
              {scenario.difficulty === 'beginner' ? '🟢 Principiante' :
               scenario.difficulty === 'intermediate' ? '🟡 Intermedio' : '🔴 Avanzado'}
            </Text>
          </View>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{scenario.xpReward} XP</Text>
        </View>
      </View>

      {/* Contexto */}
      <View style={styles.contextBar}>
        <Text style={styles.contextText}>
          {scenario.marketContext.timeframe.toUpperCase()} • 
          {scenario.marketContext.trend === 'up' ? ' 📈 Alcista' : 
           scenario.marketContext.trend === 'down' ? ' 📉 Bajista' : ' ➡️ Lateral'} •
          {scenario.marketContext.volume === 'high' ? ' Volumen alto' : 
           scenario.marketContext.volume === 'low' ? ' Volumen bajo' : ' Volumen normal'}
        </Text>
      </View>

      {/* Contenido principal */}
      {!showResult ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Gráfico */}
          {renderChart()}
          
          {/* Contexto narrativo */}
          <View style={styles.narrativeBox}>
            <Text style={styles.narrativeText}>{scenario.marketContext.narrative}</Text>
          </View>

          {/* Decisión */}
          {renderDecision()}
        </ScrollView>
      ) : (
        renderFeedback()
      )}
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
  headerInfo: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  difficultyBadge: { marginTop: 2 },
  difficultyText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  xpBadge: { backgroundColor: COLORS.primary + '20', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  xpText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  contextBar: { backgroundColor: COLORS.surface, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
  contextText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center' },
  content: { flex: 1 },
  
  // Chart
  chartContainer: { backgroundColor: COLORS.surface, padding: SPACING.sm, margin: SPACING.md, borderRadius: BORDER_RADIUS.md },
  levelLine: { position: 'absolute', left: SPACING.sm, right: SPACING.sm, height: 1, opacity: 0.5 },
  
  // Narrative
  narrativeBox: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  narrativeText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  
  // Decision
  decisionContainer: { padding: SPACING.md },
  questionText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  actionsContainer: { gap: SPACING.sm },
  actionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 2 },
  actionText: { fontSize: FONT_SIZES.md, fontWeight: '600', flex: 1 },
  resultIcon: { fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
  correctButton: { backgroundColor: COLORS.success + '30', borderColor: COLORS.success },
  wrongButton: { backgroundColor: COLORS.error + '30', borderColor: COLORS.error },
  
  // Hint
  hintButton: { alignSelf: 'center', marginTop: SPACING.md, padding: SPACING.sm },
  hintText: { color: COLORS.primary, fontSize: FONT_SIZES.sm },
  hintBox: { backgroundColor: COLORS.warning + '20', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.sm },
  hintContent: { color: COLORS.text, fontSize: FONT_SIZES.sm, fontStyle: 'italic' },
  
  // Feedback
  feedbackContainer: { flex: 1, padding: SPACING.md },
  resultBanner: { padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md },
  resultBannerCorrect: { backgroundColor: COLORS.success + '20' },
  resultBannerWrong: { backgroundColor: COLORS.warning + '20' },
  resultTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  resultSubtitle: { fontSize: FONT_SIZES.md, color: COLORS.textLight },
  feedbackSection: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md },
  feedbackSectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  feedbackContent: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  mistakeTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.error, marginBottom: SPACING.xs },
  tipBox: { backgroundColor: COLORS.success + '15', padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginTop: SPACING.sm },
  tipTitle: { fontSize: FONT_SIZES.sm, color: COLORS.success },
  profitText: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginTop: SPACING.sm },
  profit: { color: COLORS.success },
  loss: { color: COLORS.error },
  lessonItem: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: 4 },
  
  // Continue
  continueButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginTop: SPACING.md, marginBottom: SPACING.xl },
  continueButtonText: { color: COLORS.surface, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
