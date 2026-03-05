// LevelMapScreen - Mapa de niveles estilo Duolingo

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { Lesson, Level } from '../types';
import { LessonCard } from '../components';
import { useUserStore } from '../store/userStore';
import { lessonsData } from '../data/lessons';

interface LevelMapScreenProps {
  onSelectLesson: (lesson: Lesson) => void;
}

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({ onSelectLesson }) => {
  const { lessonsCompleted, totalXP } = useUserStore();
  
  // Agrupar lecciones por nivel
  const levels = [
    { level: 1, title: 'Nivel 1', subtitle: 'Fundamentos', color: COLORS.level1, lessons: lessonsData.filter(l => l.level === 1) },
    { level: 2, title: 'Nivel 2', subtitle: 'Comprensión del Mercado', color: COLORS.level2, lessons: lessonsData.filter(l => l.level === 2) },
  ];

  const isLessonUnlocked = (lesson: Lesson): boolean => {
    // Primera lección siempre desbloqueada
    if (lesson.order === 1) return true;
    
    // Busco la lección anterior en el mismo nivel
    const levelLessons = lessonsData.filter(l => l.level === lesson.level);
    const prevLesson = levelLessons.find(l => l.order === lesson.order - 1);
    
    if (prevLesson) {
      return lessonsCompleted.includes(prevLesson.id);
    }
    
    return lessonsCompleted.includes(lesson.id);
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return lessonsCompleted.includes(lessonId);
  };

  const getLessonsCompletedCount = (levelNum: number): number => {
    const levelLessons = lessonsData.filter(l => l.level === levelNum);
    return levelLessons.filter(l => lessonsCompleted.includes(l.id)).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mapa de Aprendizaje</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>⭐ {totalXP} XP</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {levels.map((level) => (
          <View key={level.level} style={styles.levelSection}>
            <View style={styles.levelHeader}>
              <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
                <Text style={styles.levelNumber}>{level.level}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {getLessonsCompletedCount(level.level)}/{level.lessons.length}
                </Text>
              </View>
            </View>

            <View style={styles.lessonsList}>
              {level.lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isCompleted={isLessonCompleted(lesson.id)}
                  isUnlocked={isLessonUnlocked(lesson)}
                  onPress={() => onSelectLesson(lesson)}
                />
              ))}
            </View>
          </View>
        ))}
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
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  xpBadge: {
    backgroundColor: '#FEF9E7',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  xpText: {
    color: COLORS.warning,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  levelSection: {
    marginBottom: SPACING.xl,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelBadge: {
    width: 44,
    height: 44,
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
  progressInfo: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  lessonsList: {
    gap: SPACING.sm,
  },
});
