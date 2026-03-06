// Componente ProgressBar mejorado con animaciones
import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  style?: ViewStyle;
  variant?: 'default' | 'rounded' | 'pill';
}

export const ProgressBar = memo<ProgressBarProps>(({
  progress,
  height = 8,
  color = COLORS.primary,
  backgroundColor = COLORS.background,
  showLabel = false,
  label,
  animated = true,
  style,
  variant = 'rounded',
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: Math.min(100, Math.max(0, progress)),
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(Math.min(100, Math.max(0, progress)));
    }
  }, [progress, animated, animatedWidth]);

  const borderRadius = variant === 'pill' ? height / 2 : 
                       variant === 'rounded' ? BORDER_RADIUS.sm : 0;

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={style}>
      {(showLabel || label) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showLabel && <Text style={styles.percentage}>{Math.round(progress)}%</Text>}
        </View>
      )}
      <View 
        style={[
          styles.container, 
          { height, backgroundColor, borderRadius }
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color, borderRadius, width: widthInterpolated },
          ]}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  percentage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
});
