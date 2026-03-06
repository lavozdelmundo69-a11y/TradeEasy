// LevelMapScreen - Pantalla de mapa de niveles con FlashList
import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, GAME_CONFIG } from '../shared/constants';
import { Lesson } from '../types';
import { useUserStore } from '../store/userStore';
import { getLessonsByLevel } from '../data/lessons';

interface LevelMapScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
}

interface ListItem {
  type: 'header' | 'lesson';
  level?: number;
  lesson?: Lesson;
  key: string;
}

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({ onSelectLesson }) => {
  const lessonsCompleted = useUserStore(state => state.lessonsCompleted);
  const userLevel = useUserStore(state => state.level);

  const maxVisibleLevel = Math.min(userLevel + 1, 3);

  const data = useMemo((): ListItem[] => {
    const items: ListItem[] = [];
    
    for (let lvl = 1; lvl <= maxVisibleLevel; lvl++) {
      // Header
      items.push({ type: 'header', level: lvl, key: `header-${lvl}` });
      
      // Lecciones
      const lessons = getLessonsByLevel(lvl);
      lessons.forEach(lesson => {
        items.push({ 
          type: 'lesson', 
          lesson, 
          key: `lesson-${lesson.id}` 
        });
      });
    }
    
    return items;
  }, [maxVisibleLevel]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      const lvl = item.level!;
      const lessons = getLessonsByLevel(lvl);
      const completedCount = lessons.filter(l => lessonsCompleted.includes(l.id)).length;
      const levelConfig = GAME_CONFIG.levels.find(l => l.level === lvl);
      
      return (
        <View style={styles.levelHeader}>
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
    }

    const lesson = item.lesson!;
    const isUnlocked = lesson.level <= userLevel;
    const isCompleted = lessonsCompleted.includes(lesson.id);
    const levelConfig = GAME_CONFIG.levels.find(l => l.level === lesson.level);

    return (
      <TouchableOpacity
        style={[
          styles.lessonCard,
          !isUnlocked && styles.locked,
          isCompleted && styles.completed
        ]}
        onPress={() => isUnlocked && onSelectLesson(lesson)}
        disabled={!isUnlocked}
        activeOpacity={0.7}
      >
        <View style={[styles.indicator, { backgroundColor: isUnlocked ? (levelConfig?.color || COLORS.primary) : COLORS.textMuted }]}>
          {isCompleted ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : isUnlocked ? (
            <Text style={styles.order}>{lesson.order}</Text>
          ) : (
            <Text style={styles.lock}>🔒</Text>
          )}
        </View>
        <View style={styles.lessonInfo}>
          <Text style={[styles.lessonTitle, !isUnlocked && styles.textLocked]} numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text style={styles.lessonMeta}>
            ⏱️ {lesson.duration} min • ⭐ {lesson.xpReward} XP
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [lessonsCompleted, userLevel, onSelectLesson]);

  const estimatedItemHeight = 80;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {}}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Lecciones</Text>
        <View style={styles.placeholder} />
      </View>

      <FlashList
        data={data}
        renderItem={renderItem}
        estimatedItemSize={estimatedItemHeight}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
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
    marginTop: SPACING.sm,
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
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  locked: {
    opacity: 0.5,
  },
  completed: {
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  indicator: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkmark: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  order: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  lock: {
    fontSize: FONT_SIZES.sm,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  textLocked: {
    color: COLORS.textLight,
  },
  lessonMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
});
