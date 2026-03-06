// Componente de tarjeta de lección mejorado
import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../shared/constants';
import { Lesson } from '../../types';
import { Card } from '../../shared/components';
import { MiniCandlestickChart } from '../../features/trading/components/CandlestickChart';

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  isUnlocked: boolean;
  onPress: () => void;
}

const levelColors = {
  1: COLORS.level1,
  2: COLORS.level2,
  3: COLORS.level3,
};

export const LessonCard: React.FC<LessonCardProps> = memo(({
  lesson,
  isCompleted,
  isUnlocked,
  onPress,
}) => {
  const color = levelColors[lesson.level as keyof typeof levelColors] || COLORS.primary;

  const handlePress = useCallback(() => {
    if (isUnlocked) {
      onPress();
    }
  }, [isUnlocked, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!isUnlocked}
      activeOpacity={0.7}
    >
      <Card style={[
        styles.container,
        !isUnlocked && styles.locked,
        isCompleted && { borderColor: COLORS.success, borderWidth: 2 },
      ]}>
        <View style={styles.content}>
          {/* Indicador de estado */}
          <View style={[
            styles.indicator, 
            { backgroundColor: isUnlocked ? color : COLORS.textMuted }
          ]}>
            {isCompleted ? (
              <Text style={styles.checkmark}>✓</Text>
            ) : isUnlocked ? (
              <Text style={styles.order}>{lesson.order}</Text>
            ) : (
              <Text style={styles.lock}>🔒</Text>
            )}
          </View>

          {/* Info de la lección */}
          <View style={styles.info}>
            <Text style={[
              styles.title, 
              !isUnlocked && styles.textLocked
            ]} numberOfLines={1}>
              {lesson.title}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.duration}>⏱️ {lesson.duration} min</Text>
              <Text style={styles.xp}>⭐ {lesson.xpReward} XP</Text>
              <Badge variant={lesson.exercise.difficulty === 'easy' ? 'success' : 
                              lesson.exercise.difficulty === 'medium' ? 'warning' : 'error'}>
                {lesson.exercise.difficulty}
              </Badge>
            </View>
          </View>

          {/* Preview del gráfico si existe */}
          {lesson.example.chartData && lesson.example.chartData.length > 0 && (
            <View style={styles.chartPreview}>
              <MiniCandlestickChart 
                data={lesson.example.chartData.map((c, i) => ({
                  time: `t${i}`,
                  ...c,
                }))}
                width={60}
                height={32}
              />
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
});

// Badge interno
const Badge: React.FC<{ variant: string; children: React.ReactNode }> = ({ 
  variant, 
  children 
}) => {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: COLORS.successLight, text: COLORS.success },
    warning: { bg: COLORS.warningLight, text: '#D68910' },
    error: { bg: COLORS.errorLight, text: COLORS.error },
  };
  
  const style = colors[variant] || colors.success;
  
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.text }]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
  },
  locked: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 44,
    height: 44,
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
  info: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  textLocked: {
    color: COLORS.textLight,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  duration: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  xp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.xp,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartPreview: {
    marginLeft: SPACING.sm,
  },
});
