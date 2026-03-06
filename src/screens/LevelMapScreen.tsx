// LevelMapScreen - Pantalla de mapa de niveles
import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, GAME_CONFIG } from '../shared/constants';
import { Lesson } from '../types';
import { LessonCard } from '../features/lessons/components/LessonCard';
import { useUserStore } from '../store/userStore';
import { getLessonsByLevel } from '../data/lessons';

interface LevelMapScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
}

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({ onSelectLesson }) => {
  const lessonsCompleted = useUserStore(state => state.lessonsCompleted);
  const userLevel = useUserStore(state => state.level);
  
  // Mostrar niveles hasta el nivel del usuario + 1
  const maxVisibleLevel = Math.min(userLevel + 1, 3);

  const renderContent = useCallback(() => {
    const elements: any[] = [];
    
    for (let lvl = 1; lvl <= maxVisibleLevel; lvl++) {
      const levelConfig = GAME_CONFIG.levels.find(l => l.level === lvl);
      const lessons = getLessonsByLevel(lvl);
      const completedCount = lessons.filter(l => lessonsCompleted.includes(l.id)).length;
      
      // Header de nivel
      elements.push(
        <View key={`level-header-${lvl}`} style={styles.levelHeader}>
          <View style={[styles.levelBadge, { backgroundColor: levelConfig?.color || COLORS.primary }]}>
            <Text style={styles.levelNumber}>{lvl}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{levelConfig?.title || `Nivel ${lvl}`}</Text>
            <Text style={styles.levelProgress}>
              {completedCount}/{lessons.length} lecciones
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%`,
                  backgroundColor: levelConfig?.color || COLORS.primary
                }
              ]} 
            />
          </View>
        </View>
      );
      
      // Lecciones
      lessons.forEach(lesson => {
        const isUnlocked = lesson.level <= userLevel || 
          (lesson.requiredLessonIds?.every(id => lessonsCompleted.includes(id)) ?? true);
        
        elements.push(
          <LessonCard
            key={`lesson-${lesson.id}`}
            lesson={lesson}
            isCompleted={lessonsCompleted.includes(lesson.id)}
            isUnlocked={isUnlocked}
            onPress={() => onSelectLesson(lesson)}
          />
        );
      });
    }
    
    return elements;
  }, [lessonsCompleted, userLevel, maxVisibleLevel, onSelectLesson]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {}}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Lecciones</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  backButton: {
    padding: SPACING.xs,
    width: 70,
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 70,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  levelHeader: {
    padding: SPACING.md,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
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
  levelProgress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    marginTop: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
