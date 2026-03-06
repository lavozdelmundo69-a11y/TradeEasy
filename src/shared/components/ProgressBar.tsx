// Componente ProgressBar mejorado con animaciones
import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';

interface ProgressBarProps {
  progress: number; // 0-100
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
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(Math.min(100, Math.max(0, progress)), {
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      animatedProgress.value = Math.min(100, Math.max(0, progress));
    }
  }, [progress, animated, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  const borderRadius = variant === 'pill' ? height / 2 : 
                       variant === 'rounded' ? BORDER_RADIUS.sm : 0;

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
            { backgroundColor: color, borderRadius },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
});

// Progress circular
interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color = COLORS.primary,
  backgroundColor = COLORS.background,
  showPercentage = true,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View style={styles.circularBackground}>
        {/* Simple circle without SVG */}
        <View 
          style={[
            styles.circleBg, 
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            }
          ]} 
        />
        <View 
          style={[
            styles.circleFg, 
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: 'transparent',
              borderRightColor: progress > 25 ? color : 'transparent',
              borderBottomColor: progress > 50 ? color : 'transparent',
              borderLeftColor: progress > 75 ? color : 'transparent',
              transform: [{ rotate: '-90deg' }],
            }
          ]} 
        />
      </View>
      <View style={styles.circularContent}>
        {children || (showPercentage && (
          <Text style={styles.circularText}>{Math.round(progress)}%</Text>
        ))}
      </View>
    </View>
  );
};

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
  // Circular
  circularContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularBackground: {
    position: 'absolute',
  },
  circleBg: {
    position: 'absolute',
  },
  circleFg: {
    position: 'absolute',
  },
  circularContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
});
