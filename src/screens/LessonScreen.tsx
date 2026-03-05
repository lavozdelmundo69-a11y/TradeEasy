// LessonScreen - Pantalla de lección

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';
import { Lesson } from '../types';
import { QuizCard } from '../components';
import { useUserStore } from '../store/userStore';

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
  
  const { addXP, correctAnswer, wrongAnswer, completeLesson, getProgressToNextLevel } = useUserStore();

  const handleAnswer = (selectedIndex: number) => {
    if (selectedIndex === lesson.exercise.correctAnswer) {
      correctAnswer();
      addXP(50); // XP por completar lección
    } else {
      wrongAnswer();
    }
    
    setExerciseCompleted(true);
  };

  const handleContinue = () => {
    addXP(lesson.xpReward);
    completeLesson(lesson.id);
    onComplete();
  };

  if (showExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ejercicio</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.content}>
          <QuizCard
            exercise={lesson.exercise}
            onAnswer={handleAnswer}
          />
        </ScrollView>
        
        {exerciseCompleted && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueText}>
                Continuar (+{lesson.xpReward} XP)
              </Text>
            </TouchableOpacity>
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

      <ScrollView style={styles.content}>
        {/* Explicación */}
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

        {/* Ejemplo */}
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleTitle}>{lesson.example.title}</Text>
          <Text style={styles.exampleDescription}>
            {lesson.example.description}
          </Text>
        </View>

        {/* Resumen */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>📝 Resumen</Text>
          <Text style={styles.summaryText}>{lesson.summary}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setShowExercise(true)}
        >
          <Text style={styles.startButtonText}>Hacer Ejercicio</Text>
        </TouchableOpacity>
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
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  explanationBlock: {
    marginBottom: SPACING.md,
  },
  textContent: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  block: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.xs,
  },
  tipBlock: {
    backgroundColor: '#E8F8F5',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  warningBlock: {
    backgroundColor: '#FEF9E7',
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
  blockText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  exampleContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
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
  summaryContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.md,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  summaryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  startButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  continueText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
