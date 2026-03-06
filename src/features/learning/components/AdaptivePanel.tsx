// Panel de Progresión Adaptativa - Muestra recomendaciones y estado por tema
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../shared/constants';
import { TopicPerformance, LearningRecommendation } from '../../../types/adaptive';

interface AdaptivePanelProps {
  performances: TopicPerformance[];
  recommendations: LearningRecommendation[];
  onSelectLesson: (lessonId: string) => void;
  onPracticeWeak: () => void;
}

type StatusType = TopicPerformance['status'];
type TrendType = TopicPerformance['trend'];
type PriorityType = LearningRecommendation['priority'];

const statusConfig: Record<StatusType, { emoji: string; label: string; color: string }> = {
  locked: { emoji: '🔒', label: 'Bloqueado', color: COLORS.textMuted },
  learning: { emoji: '📚', label: 'Aprendiendo', color: '#D68910' },
  proficient: { emoji: '✅', label: 'Competente', color: COLORS.success },
  mastered: { emoji: '🏆', label: 'Dominado', color: COLORS.primary },
};

const trendIcons: Record<TrendType, string> = {
  improving: '📈',
  stable: '➡️',
  declining: '📉',
};

const priorityColors: Record<PriorityType, string> = {
  high: COLORS.error,
  medium: '#D68910',
  low: COLORS.success,
};

const statusOrder: Record<StatusType, number> = {
  learning: 0,
  proficient: 1,
  mastered: 2,
  locked: 3,
};

// Badge de estado de tema
const TopicStatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  const { emoji, label, color } = statusConfig[status];
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text style={styles.statusEmoji}>{emoji}</Text>
      <Text style={[styles.statusLabel, { color }]}>{label}</Text>
    </View>
  );
};

// Indicador de tendencia
const TrendIndicator: React.FC<{ trend: TrendType }> = ({ trend }) => (
  <Text style={styles.trendIcon}>{trendIcons[trend]}</Text>
);

// Barra de accuracy
const AccuracyBar: React.FC<{ accuracy: number }> = ({ accuracy }) => {
  const getColor = () => {
    if (accuracy >= 80) return COLORS.success;
    if (accuracy >= 60) return '#D68910';
    return COLORS.error;
  };
  
  return (
    <View style={styles.accuracyContainer}>
      <View style={styles.accuracyBarBg}>
        <View style={[styles.accuracyBarFill, { width: `${accuracy}%`, backgroundColor: getColor() }]} />
      </View>
      <Text style={[styles.accuracyText, { color: getColor() }]}>{accuracy}%</Text>
    </View>
  );
};

// Tarjeta de tema individual
const TopicCard: React.FC<{ performance: TopicPerformance }> = ({ performance }) => (
  <View style={styles.topicCard}>
    <View style={styles.topicHeader}>
      <Text style={styles.topicName}>{performance.topicName}</Text>
      <TopicStatusBadge status={performance.status} />
    </View>
    <AccuracyBar accuracy={performance.accuracy} />
    <View style={styles.topicMeta}>
      <Text style={styles.topicMetaText}>{performance.totalAttempts} intentos</Text>
      <TrendIndicator trend={performance.trend} />
      {performance.weakConceptIds.length > 0 && (
        <Text style={styles.weakCount}>⚠️ {performance.weakConceptIds.length}</Text>
      )}
    </View>
  </View>
);

// Tarjeta de recomendación
const RecommendationCard: React.FC<{ 
  recommendation: LearningRecommendation;
  onPress: () => void;
}> = ({ recommendation, onPress }) => (
  <TouchableOpacity 
    style={[styles.recCard, { borderLeftColor: priorityColors[recommendation.priority] }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.recHeader}>
      <Text style={styles.recTitle}>{recommendation.title}</Text>
      {recommendation.xpReward && (
        <Text style={styles.recXP}>+{recommendation.xpReward} XP</Text>
      )}
    </View>
    <Text style={styles.recDescription}>{recommendation.description}</Text>
    <Text style={styles.recReason}>{recommendation.reason}</Text>
  </TouchableOpacity>
);

// Panel principal
export const AdaptivePanel: React.FC<AdaptivePanelProps> = ({
  performances,
  recommendations,
  onSelectLesson,
  onPracticeWeak,
}) => {
  const hasData = performances.some(p => p.totalAttempts > 0);
  const activePerformances = performances.filter(p => p.totalAttempts > 0);

  // Calcular stats
  const masteredCount = performances.filter(p => p.status === 'mastered').length;
  const learningCount = performances.filter(p => p.status === 'learning').length;
  const avgAccuracy = activePerformances.length > 0
    ? Math.round(activePerformances.reduce((s, p) => s + p.accuracy, 0) / activePerformances.length)
    : 0;

  if (!hasData) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🌟</Text>
        <Text style={styles.emptyTitle}>¡Bienvenido a tu camino de trading!</Text>
        <Text style={styles.emptyText}>
          Completa lecciones y ejercicios para ver tu progreso por temas.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Recomendaciones Activas */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Recomendaciones</Text>
          {recommendations.slice(0, 3).map(rec => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onPress={() => rec.lessonId ? onSelectLesson(rec.lessonId) : onPracticeWeak()}
            />
          ))}
        </View>
      )}

      {/* Progreso por Tema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Progreso por Tema</Text>
        {performances
          .filter(p => p.totalAttempts > 0 || p.status !== 'locked')
          .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
          .map(perf => (
            <TopicCard key={perf.topicId} performance={perf} />
          ))}
      </View>

      {/* Resumen */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Resumen</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{masteredCount}</Text>
            <Text style={styles.summaryLabel}>Dominados</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{learningCount}</Text>
            <Text style={styles.summaryLabel}>Por mejorar</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgAccuracy}%</Text>
            <Text style={styles.summaryLabel}>Accuracy</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md, paddingHorizontal: SPACING.md },
  
  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, textAlign: 'center', lineHeight: 22 },
  
  // Topic card
  topicCard: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: BORDER_RADIUS.md },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  topicName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  statusEmoji: { fontSize: 12, marginRight: 4 },
  statusLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  accuracyContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  accuracyBarBg: { flex: 1, height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden', marginRight: SPACING.sm },
  accuracyBarFill: { height: '100%', borderRadius: 4 },
  accuracyText: { fontSize: FONT_SIZES.sm, fontWeight: '700', width: 40, textAlign: 'right' },
  topicMeta: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs },
  topicMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  trendIcon: { fontSize: 12, marginLeft: SPACING.sm },
  weakCount: { fontSize: FONT_SIZES.xs, color: COLORS.error, marginLeft: SPACING.sm },
  
  // Recommendation card
  recCard: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderLeftWidth: 4 },
  recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  recTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, flex: 1 },
  recXP: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary, marginLeft: SPACING.sm },
  recDescription: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: SPACING.xs },
  recReason: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontStyle: 'italic' },
  
  // Summary
  summary: { backgroundColor: COLORS.surface, margin: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  summaryTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.primary },
  summaryLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
});
