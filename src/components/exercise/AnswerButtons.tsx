// AnswerButtons - Botones de respuesta

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../shared/constants';

interface AnswerButtonsProps {
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  showResult: boolean;
  onSelect: (index: number) => void;
}

export const AnswerButtons: React.FC<AnswerButtonsProps> = ({
  options,
  selectedIndex,
  correctIndex,
  showResult,
  onSelect,
}) => {
  const getButtonStyle = (index: number) => {
    if (!showResult) {
      return selectedIndex === index ? styles.buttonSelected : styles.button;
    }
    
    if (index === correctIndex) {
      return styles.buttonCorrect;
    }
    
    if (selectedIndex === index && index !== correctIndex) {
      return styles.buttonWrong;
    }
    
    return styles.button;
  };

  const getTextStyle = (index: number) => {
    if (!showResult) {
      return styles.buttonText;
    }
    
    if (index === correctIndex) {
      return styles.buttonTextCorrect;
    }
    
    if (selectedIndex === index && index !== correctIndex) {
      return styles.buttonTextWrong;
    }
    
    return styles.buttonText;
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.buttonBase, getButtonStyle(index)]}
          onPress={() => onSelect(index)}
          disabled={showResult}
          activeOpacity={0.7}
        >
          <Text style={getTextStyle(index)}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});
