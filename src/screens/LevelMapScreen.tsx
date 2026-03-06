// LevelMapScreen - Pantalla de mapa de niveles con FlashList
import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, GAME_CONFIG } from '../shared/constants';
import { Lesson } from '../types';
import { LessonCard } from '../features/lessons/components/LessonCard';
import { useUserStore } from '../store/userStore';
import { lessonsData, getLessonsByLevel } from '../data/lessons';

interface LevelMapScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
}

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({ onSelectLesson }) => {
  const { lessonsCompleted, level: userLevel } = useUserStore();
  
  // Obtener lecciones por nivel del usuario
  const lessonsByLevel = useMemo(() => {
    const grouped: Record<number, Lesson[]> = {};
    
    // Usar getLessonsByLevel para cada nivel
    for (let lvl = 1; lvl <= 3; lvl++) {
      const levelLessons = getLessonsByLevel(lvl);
      if (levelLessons.length > 0) {
        grouped[lvl] = levelLessons;
      }
    }
    
    return grouped;
  }, []);

  // Generar lista plana para FlashList
  const flatData = useMemo(() => {
    const items: Array<{ type: 'header' | 'lesson'; data: any; key: string }> = [];
    
    // Mostrar niveles hasta el nivel del usuario + 1
    const maxVisibleLevel = Math.min(userLevel + 1, 3);
    
    for (let lvl = 1; lvl <= maxVisibleLevel; lvl++) {
      const levelConfig = GAME_CONFIG.levels.find(l => l.level === lvl);
      const lessons = lessonsByLevel[lvl] || [];
      const completedCount = lessons.filter(l => lessonsCompleted.includes(l.id)).length;
      
      // Header de nivel
      items.push({
        type: 'header',
        data: { 
          level: lvl, 
          title: levelConfig?.title || `Nivel ${lvl}`,
          color: levelConfig?.color || COLORS.primary,
          completed: completedCount,
          total: lessons.length,
        },
        key: `level-header-${lvl}`,
      });
      
      // Lecciones
      lessons.forEach(lesson => {
        const isUnlocked = lesson.level <= userLevel || 
          (lesson.requiredLessonIds?.every(id => lessonsCompleted.includes(id)) ?? true);
        
        items.push({
          type: 'lesson',
          data: {
            lesson,
            isCompleted: lessonsCompleted.includes(lesson.id),
            isUnlocked,
          },
          key: `lesson-${lesson.id}`,
        });
      });
    }
    
    return items;
  }, [lessonsByLevel, lessonsCompleted, userLevel]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (item.type === 'header') {
      const { level, title, color, completed, total } = item.data;
      return (
        <View style={styles.levelHeader}>
          <View style={[styles.levelBadge, { backgroundColor: color }]}>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{title}</Text>
            <Text style={styles.levelProgress}>
              {completed}/{total} lecciones
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: color }]}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${total > 0 ? (completed / total) * 100 : 0}%`, backgroundColor: color }
              ]} 
            />
          </View>
        </View>
      );
    }
    
    const { lesson, isCompleted, isUnlocked } = item.data;
    return (
      <LessonCard
        lesson={lesson}
        isCompleted={isCompleted}
        isUnlocked={isUnlocked}
        onPress={() => onSelectLesson(lesson)}
      />
    );
  }, [onSelectLesson]);

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
        data={flatData}
        renderItem={renderItem}
        estimatedItemSize={100}
        keyExtractor={item => item.key}
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
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
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
