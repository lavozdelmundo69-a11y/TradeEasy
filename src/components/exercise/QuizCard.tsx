// QuizCard - Componente de pregunta tipo quiz

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../shared/constants';
import { Exercise } from '../../types';

interface QuizCardProps {
  exercise: Exercise;
  onAnswer: (selectedIndex: number) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ exercise, onAnswer }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedIndex(index);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(index);
    }, 1500);
  };

  const getButtonStyle = (index: number) => {
    if (!showResult) {
      return selectedIndex === index ? styles.buttonSelected : styles.button;
    }
    
    if (index === exercise.correctAnswer) {
      return styles.buttonCorrect;
    }
    
    if (selectedIndex === index && index !== exercise.correctAnswer) {
      return styles.buttonWrong;
    }
    
    return styles.button;
  };

  const getTextStyle = (index: number) => {
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{exercise.question}</Text>
        
        {exercise.scenario && (
          <View style={styles.scenario}>
            <Text style={styles.scenarioText}>{exercise.scenario.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.optionsContainer}>
        {exercise.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.buttonBase, getButtonStyle(index)]}
            onPress={() => handleSelect(index)}
            disabled={showResult}
            activeOpacity={0.7}
          >
            <Text style={getTextStyle(index)}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showResult && (
        <View style={[
          styles.explanation,
          selectedIndex === exercise.correctAnswer ? styles.explanationCorrect : styles.explanationWrong
        ]}>
          <Text style={[
            styles.explanationTitle,
            selectedIndex === exercise.correctAnswer ? styles.textCorrect : styles.textWrong
          ]}>
            {selectedIndex === exercise.correctAnswer ? '✓ ¡Correcto!' : '✗ Incorrecto'}
          </Text>
          <Text style={styles.explanationText}>{exercise.explanation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
  },
  questionContainer: {
    marginBottom: SPACING.lg,
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
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  buttonBase: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
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
    backgroundColor: '#E8F8F5',
    borderColor: COLORS.success,
  },
  buttonWrong: {
    backgroundColor: '#FDEDEC',
    borderColor: COLORS.error,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
  },
  buttonTextCorrect: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: '600',
  },
  buttonTextWrong: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
  },
  explanation: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  explanationCorrect: {
    backgroundColor: '#E8F8F5',
  },
  explanationWrong: {
    backgroundColor: '#FDEDEC',
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
    color: COLORS.error,
  },
  explanationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});
