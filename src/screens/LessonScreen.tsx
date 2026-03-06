// LessonScreen - Pantalla de lección mejorada
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, GAME_CONFIG } from '../shared/constants';
import { Lesson } from '../types';
import { QuizCard } from '../features/quiz/components/QuizCard';
import { useUserStore } from '../store/userStore';
import { useLessonCompletion } from '../features/lessons/hooks/useLessonCompletion';
import { AnimatedButton, Card } from '../shared/components';
import { useQuiz } from '../features/quiz/hooks/useQuiz';

interface LessonScreenProps {
  lesson: Lesson;
  onComplete: () => void;
  onBack: () => void;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
  lesson,
  onComplete,
  onBack,
}) => {
  const [showExercise, setShowExercise] = useState(false);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  
  const { addXP } = useUserStore();
  const { completeLesson: completeLessonAction } = useLessonCompletion();
  const { exercise } = lesson;

  const handleAnswer = useCallback(() => {
    // XP ya se añade en el hook QuizCard
    Vibration.vibrate(50);
  }, []);

  const handleExerciseComplete = useCallback(() => {
    setExerciseCompleted(true);
    // XP por completar lección
    addXP(lesson.xpReward);
  }, [addXP, lesson.xpReward]);

  const handleContinue = useCallback(() => {
    completeLessonAction(lesson.id, lesson.xpReward);
    onComplete();
  }, [completeLessonAction, lesson.id, lesson.xpReward, onComplete]);

  const handleBackToExplanation = useCallback(() => {
    setShowExercise(false);
    setExerciseCompleted(false);
  }, []);

  if (showExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToExplanation} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ejercicio</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <QuizCard
            exercise={exercise}
            onAnswer={handleAnswer}
            showTimer
            timeLimit={60}
          />
        </ScrollView>
        
        {exerciseCompleted && (
          <View style={styles.footer}>
            <AnimatedButton
              onPress={handleContinue}
              variant="success"
              size="lg"
              fullWidth
            >
              ✅ Completar (+{lesson.xpReward} XP)
            </AnimatedButton>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Salir</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Progress indicator */}
        <View style={styles.progressHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Nivel {lesson.level}</Text>
          </View>
          <View style={styles.metaBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⏱️ {lesson.duration} min</Text>
            </View>
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: COLORS.xp }]}>⭐ {lesson.xpReward} XP</Text>
            </View>
          </View>
        </View>

        {/* Explicación */}
        <Card style={styles.explanationSection} variant="elevated">
          <Text style={styles.sectionTitle}>📚 Explicación</Text>
          {lesson.explanation.map((block, index) => (
            <View key={index} style={styles.explanationBlock}>
              {block.type === 'tip' && (
                <View style={[styles.block, styles.tipBlock]}>
                  <Text style={styles.tipTitle}>💡 Consejo</Text>
                  <Text style={styles.blockText}>{block.content}</Text>
                </View>
              )}
              {block.type === 'warning' && (
                <View style={[styles.block, styles.warningBlock]}>
                  <Text style={styles.warningTitle}>⚠️ Atención</Text>
                  <Text style={styles.blockText}>{block.content}</Text>
                </View>
              )}
              {block.type === 'text' && (
                <Text style={styles.textContent}>{block.content}</Text>
              )}
            </View>
          ))}
        </Card>

        {/* Ejemplo */}
        <Card style={styles.exampleSection} variant="elevated">
          <Text style={styles.sectionTitle}>💡 Ejemplo Práctico</Text>
          <Text style={styles.exampleTitle}>{lesson.example.title}</Text>
          <Text style={styles.exampleDescription}>
            {lesson.example.description}
          </Text>
          
          {lesson.example.chartData && lesson.example.chartData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartLabel}>Vela de ejemplo:</Text>
              <View style={styles.chartData}>
                {lesson.example.chartData.map((candle, idx) => (
                  <View key={idx} style={styles.candleData}>
                    <Text style={[
                      styles.candleText,
                      { color: candle.close >= candle.open ? COLORS.success : COLORS.error }
                    ]}>
                      O:{candle.open} C:{candle.close}
                    </Text>
                    <Text style={styles.candleSubtext}>
                      H:{candle.high} L:{candle.low}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* Resumen */}
        <Card style={styles.summarySection} variant="outlined">
          <Text style={styles.sectionTitle}>📝 Resumen</Text>
          <Text style={styles.summaryText}>{lesson.summary}</Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedButton
          onPress={() => setShowExercise(true)}
          variant="primary"
          size="lg"
          fullWidth
        >
          🎯 Hacer Ejercicio
        </AnimatedButton>
      </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  levelText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  metaBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  explanationSection: {
    marginBottom: SPACING.md,
  },
  exampleSection: {
    marginBottom: SPACING.md,
  },
  summarySection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  explanationBlock: {
    marginBottom: SPACING.md,
  },
  block: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.xs,
  },
  tipBlock: {
    backgroundColor: COLORS.successLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  warningBlock: {
    backgroundColor: COLORS.warningLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  tipTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  warningTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#D68910',
    marginBottom: SPACING.xs,
  },
  textContent: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  exampleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  exampleDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  chartContainer: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.backgroundDark,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  chartLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textInverse,
    marginBottom: SPACING.sm,
  },
  chartData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  candleData: {
    alignItems: 'center',
  },
  candleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  candleSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  summaryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
});
