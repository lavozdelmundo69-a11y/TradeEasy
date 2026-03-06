// Componente QuizCard mejorado con feedback visual
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../shared/constants';
import { Exercise } from '../../types';

interface QuizCardProps {
  exercise: Exercise;
  onAnswer: (selectedIndex: number) => void;
  showTimer?: boolean;
  timeLimit?: number; // segundos
}

export const QuizCard: React.FC<QuizCardProps> = ({
  exercise,
  onAnswer,
  showTimer = false,
  timeLimit = 30,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  
  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (!showTimer || showResult) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto select wrong
          clearInterval(timerRef.current!);
          handleSelect(-1); // Invalid selection
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showTimer, showResult]);

  const handleSelect = useCallback((index: number) => {
    if (showResult) return;
    
    // Feedback visual
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    // Vibración
    if (index === exercise.correctAnswer) {
      Vibration.vibrate(50);
    } else {
      Vibration.vibrate([0, 50, 50, 50]);
    }
    
    setSelectedIndex(index);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(index);
    }, 1500);
  }, [showResult, exercise.correctAnswer, onAnswer, scaleAnim]);

  const getButtonStyle = useCallback((index: number) => {
    if (!showResult) {
      return selectedIndex === index 
        ? [styles.buttonBase, styles.buttonSelected] 
        : [styles.buttonBase, styles.button];
    }
    
    if (index === exercise.correctAnswer) {
      return [styles.buttonBase, styles.buttonCorrect];
    }
    
    if (selectedIndex === index && index !== exercise.correctAnswer) {
      return [styles.buttonBase, styles.buttonWrong];
    }
    
    return [styles.buttonBase, styles.button];
  }, [showResult, selectedIndex, exercise.correctAnswer]);

  const getTextStyle = useCallback((index: number) => {
    if (!showResult) {
      return styles.buttonText;
    }
    
    if (index === exercise.correctAnswer) {
      return styles.buttonTextCorrect;
    }
    
    if (selectedIndex === index && index !== exercise.correctAnswer) {
      return styles.buttonTextWrong;
    }
    
    return styles.buttonText;
  }, [showResult, selectedIndex, exercise.correctAnswer]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Timer */}
      {showTimer && !showResult && (
        <View style={[
          styles.timer,
          timeLeft <= 10 && styles.timerWarning,
        ]}>
          <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
        </View>
      )}

      {/* Question */}
      <View style={styles.questionContainer}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>
            {exercise.difficulty === 'easy' ? '🟢 Fácil' : 
             exercise.difficulty === 'medium' ? '🟡 Medio' : '🔴 Difícil'}
          </Text>
        </View>
        <Text style={styles.question}>{exercise.question}</Text>
        
        {exercise.scenario && (
          <View style={styles.scenario}>
            <Text style={styles.scenarioText}>{exercise.scenario.description}</Text>
          </View>
        )}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {exercise.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getButtonStyle(index)}
            onPress={() => handleSelect(index)}
            disabled={showResult}
            activeOpacity={0.7}
          >
            <Text style={getTextStyle(index)}>{option}</Text>
            {showResult && index === exercise.correctAnswer && (
              <Text style={styles.correctIcon}>✓</Text>
            )}
            {showResult && selectedIndex === index && index !== exercise.correctAnswer && (
              <Text style={styles.wrongIcon}>✗</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Explanation */}
      {showResult && (
        <View style={[
          styles.explanation,
          selectedIndex === exercise.correctAnswer 
            ? styles.explanationCorrect 
            : styles.explanationWrong
        ]}>
          <Text style={[
            styles.explanationTitle,
            selectedIndex === exercise.correctAnswer 
              ? styles.textCorrect 
              : styles.textWrong
          ]}>
            {selectedIndex === exercise.correctAnswer ? '🎉 ¡Correcto!' : '💡 Explain'}
          </Text>
          <Text style={styles.explanationText}>{exercise.explanation}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
  },
  timer: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  timerWarning: {
    backgroundColor: COLORS.errorLight,
  },
  timerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  questionContainer: {
    marginBottom: SPACING.lg,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  difficultyText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  question: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 26,
  },
  scenario: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  scenarioText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  buttonBase: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.background,
  },
  buttonSelected: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  buttonCorrect: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  buttonWrong: {
    backgroundColor: COLORS.errorLight,
    borderColor: COLORS.error,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  buttonTextCorrect: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: '600',
    flex: 1,
  },
  buttonTextWrong: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    flex: 1,
  },
  correctIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  wrongIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  explanation: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  explanationCorrect: {
    backgroundColor: COLORS.successLight,
  },
  explanationWrong: {
    backgroundColor: COLORS.warningLight,
  },
  explanationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  textCorrect: {
    color: COLORS.success,
  },
  textWrong: {
    color: '#D68910',
  },
  explanationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});
