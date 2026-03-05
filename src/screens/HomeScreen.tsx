// HomeScreen - Pantalla principal

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { useUserStore } from '../store/userStore';
import { ProgressBar } from '../components';
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
    loadProgress,
    getCurrentLevel,
    getXPToNextLevel,
    getProgressToNextLevel,
  } = useUserStore();

  useEffect(() => {
    loadProgress();
  }, []);

  const currentLevel = getCurrentLevel();
  const xpToNext = getXPToNextLevel();
  const progressToNext = getProgressToNextLevel();

  // Obtener última lección no completada
  const getNextLessonId = () => {
    const lessons = lessonsData;
    for (const lesson of lessons) {
      if (!lessonsCompleted.includes(lesson.id)) {
        return lesson.id;
      }
    }
    return lessons[0]?.id;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.subtitle}>Listo para aprender trading</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🔥 {currentStreak}</Text>
          <Text style={styles.statLabel}>Días</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>⭐ {totalXP}</Text>
          <Text style={styles.statLabel}>XP Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStreak > 0 ? '🔥' : '💤'}</Text>
          <Text style={styles.statLabel}>
            {currentStreak > 0 ? `${currentStreak} días` : 'Sin racha'}
          </Text>
        </View>
      </View>

      {/* Level Progress */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={[styles.levelBadge, { backgroundColor: currentLevel.color }]}>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{currentLevel.title}</Text>
            <Text style={styles.levelSubtitle}>
              {xpToNext > 0 ? `${xpToNext} XP para siguiente nivel` : '¡Nivel máximo!'}
            </Text>
          </View>
        </View>
        <ProgressBar 
          progress={progressToNext} 
          height={10}
          color={currentLevel.color}
        />
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <View style={styles.continueContent}>
          <Text style={styles.continueTitle}>Continuar Aprendiendo</Text>
          <Text style={styles.continueSubtitle}>
            {lessonsCompleted.length} lecciones completadas
          </Text>
        </View>
        <Text style={styles.continueArrow}>→</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionCard} onPress={onMap}>
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionTitle}>Mapa de Lecciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionTitle}>Estadísticas</Text>
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
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
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
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  levelCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  levelNumber: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xl,
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
  levelSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  continueContent: {
    flex: 1,
  },
  continueTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  continueSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textInverse,
    opacity: 0.8,
  },
  continueArrow: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textInverse,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  actionTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
});
