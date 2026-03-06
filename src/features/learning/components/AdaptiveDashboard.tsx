// AdaptiveDashboard - Panel de Aprendizaje Adaptativo
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../shared/constants';
import { TopicPerformance, LearningRecommendation, TRADING_TOPICS, ADAPTIVE_CONFIG } from '../../../types/adaptive';

interface AdaptiveDashboardProps {
  performances: TopicPerformance[];
  recommendations: LearningRecommendation[];
  globalStats: {
    avgAccuracy: number;
    masteredTopics: number;
    proficientTopics: number;
    learningTopics: number;
    weakTopics: number;
    totalAttempts: number;
    strongestTopic: string | null;
    weakestTopic: string | null;
  };
  onSelectLesson: (lessonId: string) => void;
  onPracticeWeak: () => void;
  onSelectTopic: (topicId: string) => void;
}

// Status Badge
const StatusBadge: React.FC<{ status: TopicPerformance['status'] }> = ({ status }) => {
  const config = {
    locked: { emoji: '🔒', label: 'Bloqueado', color: COLORS.textMuted },
    learning: { emoji: '📚', label: 'Reforzar', color: COLORS.error },
    proficient: { emoji: '✅', label: 'Competente', color: COLORS.success },
    mastered: { emoji: '🏆', label: 'Dominado', color: COLORS.primary },
  };
  const { emoji, label, color } = config[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
      <Text>{emoji}</Text>
      <Text style={[styles.statusLabel, { color }]}>{label}</Text>
    </View>
  );
};

// Accuracy Bar
const AccuracyBar: React.FC<{ accuracy: number; size?: 'sm' | 'md' }> = ({ accuracy, size = 'sm' }) => {
  const getColor = () => {
    if (accuracy >= ADAPTIVE_CONFIG.proficientThreshold) return COLORS.success;
    if (accuracy >= ADAPTIVE_CONFIG.learningThreshold) return '#D68910';
    return COLORS.error;
  };
  
  const height = size === 'sm' ? 6 : 10;
  
  return (
    <View style={styles.accuracyContainer}>
      <View style={[styles.accuracyBar, { height }]}>
        <View style={[styles.accuracyFill, { width: `${accuracy}%`, backgroundColor: getColor(), height }]} />
      </View>
      <Text style={[styles.accuracyText, { color: getColor(), fontSize: size === 'sm' ? 10 : 14 }]}>
        {accuracy}%
      </Text>
    </View>
  );
};

// Topic Card
const TopicCard: React.FC<{ performance: TopicPerformance; onPress: () => void }> = ({ 
  performance, 
  onPress 
}) => (
  <TouchableOpacity style={styles.topicCard} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.topicHeader}>
      <Text style={styles.topicName}>{performance.topicName}</Text>
      <StatusBadge status={performance.status} />
    </View>
    <AccuracyBar accuracy={performance.accuracy} />
    <View style={styles.topicMeta}>
      <Text style={styles.topicMetaText}>{performance.totalAttempts} intentos</Text>
      {performance.recentErrors > 0 && (
        <Text style={styles.errorCount}>⚠️ {performance.recentErrors} errores recientes</Text>
      )}
    </View>
  </TouchableOpacity>
);

// Recommendation Card
const RecommendationCard: React.FC<{
  recommendation: LearningRecommendation;
  onPress: () => void;
}> = ({ recommendation, onPress }) => {
  const priorityColors = {
    high: COLORS.error,
    medium: '#D68910',
    low: COLORS.success,
  };
  
  const icons = {
    practice_topic: '📚',
    review_weak: '🔄',
    unlock_advanced: '🔓',
    continue_lesson: '➡️',
    scenario_practice: '📈',
  };

  return (
    <TouchableOpacity 
      style={[styles.recCard, { borderLeftColor: priorityColors[recommendation.priority] }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.recHeader}>
        <Text style={styles.recIcon}>{icons[recommendation.type]}</Text>
        <Text style={styles.recTitle}>{recommendation.title}</Text>
        {recommendation.xpReward && (
          <Text style={styles.recXP}>+{recommendation.xpReward} XP</Text>
        )}
      </View>
      <Text style={styles.recDescription}>{recommendation.description}</Text>
      <Text style={styles.recReason}>{recommendation.reason}</Text>
      {recommendation.estimatedMinutes && (
        <Text style={styles.recTime}>⏱️ {recommendation.estimatedMinutes} min</Text>
      )}
    </TouchableOpacity>
  );
};

// Stats Card
const StatsCard: React.FC<{ stats: AdaptiveDashboardProps['globalStats'] }> = ({ stats }) => (
  <View style={styles.statsCard}>
    <View style={styles.statsMain}>
      <Text style={styles.statsMainLabel}>Accuracy Global</Text>
      <Text style={[
        styles.statsMainValue,
        { color: stats.avgAccuracy >= 70 ? COLORS.success : COLORS.error }
      ]}>
        {stats.avgAccuracy}%
      </Text>
    </View>
    <View style={styles.statsGrid}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.masteredTopics}</Text>
        <Text style={styles.statLabel}>🏆 Dominados</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.proficientTopics}</Text>
        <Text style={styles.statLabel}>✅ Competentes</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.learningTopics}</Text>
        <Text style={styles.statLabel}>📚 Por mejorar</Text>
      </View>
    </View>
  </View>
);

// Main Dashboard
export const AdaptiveDashboard: React.FC<AdaptiveDashboardProps> = ({
  performances,
  recommendations,
  globalStats,
  onSelectLesson,
  onPracticeWeak,
  onSelectTopic,
}) => {
  const hasData = performances.some(p => p.totalAttempts > 0);

  if (!hasData) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🌟</Text>
        <Text style={styles.emptyTitle}>¡Bienvenido a TradeEasy!</Text>
        <Text style={styles.emptyText}>
          Completa lecciones y ejercicios para ver tu progreso personalizado.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Stats Overview */}
      <StatsCard stats={globalStats} />

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Tu Plan de Hoy</Text>
          {recommendations.slice(0, 3).map(rec => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onPress={() => {
                if (rec.type === 'review_weak') {
                  onPracticeWeak();
                } else if (rec.lessonId) {
                  onSelectLesson(rec.lessonId);
                } else if (rec.topicId) {
                  onSelectTopic(rec.topicId);
                }
              }}
            />
          ))}
        </View>
      )}

      {/* Topics Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Progreso por Tema</Text>
        {performances
          .filter(p => p.status !== 'locked')
          .sort((a, b) => {
            const order: Record<string, number> = { learning: 0, proficient: 1, mastered: 2, locked: 3 };
            return order[a.status] - order[b.status];
          })
          .map(perf => (
            <TopicCard
              key={perf.topicId}
              performance={perf}
              onPress={() => onSelectTopic(perf.topicId)}
            />
          ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={onPracticeWeak}
          >
            <Text style={styles.quickActionIcon}>🎯</Text>
            <Text style={styles.quickActionText}>Practicar Débiles</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => onSelectTopic(globalStats.weakestTopic || '')}
            disabled={!globalStats.weakestTopic}
          >
            <Text style={styles.quickActionIcon}>📈</Text>
            <Text style={styles.quickActionText}>Tu Tema Débil</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => onSelectTopic(globalStats.strongestTopic || '')}
            disabled={!globalStats.strongestTopic}
          >
            <Text style={styles.quickActionIcon}>💪</Text>
            <Text style={styles.quickActionText}>Tu Mejor Tema</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Empty
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, textAlign: 'center', lineHeight: 22 },
  
  // Section
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md, paddingHorizontal: SPACING.md },
  
  // Stats
  statsCard: { backgroundColor: COLORS.surface, margin: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  statsMain: { alignItems: 'center', marginBottom: SPACING.md },
  statsMainLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  statsMainValue: { fontSize: 36, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  
  // Topic Card
  topicCard: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: BORDER_RADIUS.md },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  topicName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.full, gap: 4 },
  statusLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  accuracyContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  accuracyBar: { flex: 1, backgroundColor: COLORS.background, borderRadius: 3, overflow: 'hidden' },
  accuracyFill: { borderRadius: 3 },
  accuracyText: { fontWeight: '700', minWidth: 35, textAlign: 'right' },
  topicMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  topicMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  errorCount: { fontSize: FONT_SIZES.xs, color: COLORS.error },
  
  // Recommendation
  recCard: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderLeftWidth: 4 },
  recHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs, gap: SPACING.xs },
  recIcon: { fontSize: 16 },
  recTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, flex: 1 },
  recXP: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  recDescription: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: 4 },
  recReason: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontStyle: 'italic' },
  recTime: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 4 },
  
  // Quick Actions
  quickActions: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm },
  quickAction: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  quickActionIcon: { fontSize: 24, marginBottom: 4 },
  quickActionText: { fontSize: FONT_SIZES.xs, color: COLORS.text, textAlign: 'center' },
  
  bottomSpacer: { height: SPACING.xl },
});
