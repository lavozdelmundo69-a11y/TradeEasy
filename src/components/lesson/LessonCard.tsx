// LessonCard - Tarjeta de lección en el mapa

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../shared/constants';
import { Lesson } from '../../types';

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  isUnlocked: boolean;
  onPress: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  isCompleted,
  isUnlocked,
  onPress,
}) => {
  const levelColors = {
    1: COLORS.level1,
    2: COLORS.level2,
    3: COLORS.level3,
  };

  const color = levelColors[lesson.level as keyof typeof levelColors] || COLORS.primary;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isUnlocked && styles.locked,
        isCompleted && { borderColor: COLORS.success },
      ]}
      onPress={onPress}
      disabled={!isUnlocked}
      activeOpacity={0.7}
    >
      <View style={[styles.indicator, { backgroundColor: color }]}>
        {isCompleted ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : isUnlocked ? (
          <Text style={styles.order}>{lesson.order}</Text>
        ) : (
          <Text style={styles.lock}>🔒</Text>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, !isUnlocked && styles.textLocked]}>
          {lesson.title}
        </Text>
        <Text style={[styles.description, !isUnlocked && styles.textLocked]}>
          {lesson.duration} min • {lesson.xpReward} XP
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locked: {
    opacity: 0.5,
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
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  textLocked: {
    color: COLORS.textLight,
  },
});
