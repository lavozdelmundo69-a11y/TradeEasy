// HomeScreen - Pantalla principal mejorada
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, GAME_CONFIG } from '../shared/constants';
import { useUserStore, useXPProgress } from '../store/userStore';
import { ProgressBar, Card, AnimatedButton } from '../shared/components';
import { lessonsData } from '../data/lessons';

interface HomeScreenProps {
  onContinue: () => void;
  onMap: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onContinue, onMap }) => {
  const { 
    currentStreak, 
    totalXP, 
    level, 
    lessonsCompleted,
    exercisesCompleted,
    correctAnswers,
    totalAnswers,
    achievements,
    loadProgress,
  } = useUserStore();

  const { xpToNext, progress } = useXPProgress();

  useEffect(() => {
    loadProgress();
  }, []);

  // Stats derivados
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  const currentLevelConfig = GAME_CONFIG.levels.find(l => l.level === level) || GAME_CONFIG.levels[0];
  const nextLevelConfig = GAME_CONFIG.levels.find(l => l.level === level + 1);
  
  // Siguiente lección
  const nextLesson = useMemo(() => {
    return lessonsData.find(l => !lessonsCompleted.includes(l.id));
  }, [lessonsCompleted]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.subtitle}>
            {nextLesson 
              ? `Siguiente: ${nextLesson.title}` 
              : '¡Has completado todas las lecciones!'}
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Level Progress Card */}
      <Card style={styles.levelCard} variant="elevated">
        <View style={styles.levelHeader}>
          <View style={[styles.levelBadge, { backgroundColor: currentLevelConfig.color }]}>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{currentLevelConfig.title}</Text>
            <Text style={styles.levelXP}>{totalXP} XP Total</Text>
          </View>
          {nextLevelConfig && (
            <View style={styles.nextLevelInfo}>
              <Text style={styles.nextLevelLabel}>Siguiente</Text>
              <Text style={styles.nextLevelTitle}>{nextLevelConfig.title}</Text>
              <Text style={styles.nextLevelXP}>{xpToNext} XP</Text>
            </View>
          )}
        </View>
        
        <ProgressBar 
          progress={progress} 
          height={10}
          color={currentLevelConfig.color}
          showLabel
        />
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Racha</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>📚</Text>
          <Text style={styles.statValue}>{lessonsCompleted.length}</Text>
          <Text style={styles.statLabel}>Lecciones</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statValue}>{accuracy}%</Text>
          <Text style={styles.statLabel}>Precisión</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>🏆</Text>
          <Text style={styles.statValue}>{achievements.length}</Text>
          <Text style={styles.statLabel}>Logros</Text>
        </Card>
      </View>

      {/* Continue Button */}
      <AnimatedButton
        onPress={onContinue}
        variant="primary"
        size="lg"
        fullWidth
        style={styles.continueButton}
      >
        {nextLesson ? `Continuar: ${nextLesson.title}` : '¡Repasar Lecciones!'} →
      </AnimatedButton>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionCard} onPress={onMap}>
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionTitle}>Mapa de Lecciones</Text>
          <Text style={styles.actionSubtitle}>
            {lessonsCompleted.length}/{lessonsData.length} completadas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionTitle}>Estadísticas</Text>
          <Text style={styles.actionSubtitle}>
            {exercisesCompleted} ejercicios
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  levelCard: {
    marginBottom: SPACING.md,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  levelNumber: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  levelXP: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.xp,
    fontWeight: '600',
  },
  nextLevelInfo: {
    alignItems: 'flex-end',
  },
  nextLevelLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  nextLevelTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  nextLevelXP: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  continueButton: {
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  actionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
