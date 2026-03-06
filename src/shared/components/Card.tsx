// Componente Card genérico
import React, { memo, ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Text } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = memo<CardProps>(({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'md',
}) => {
  const paddingValue = {
    none: 0,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
  }[padding];

  const cardStyle = [
    styles.card,
    { padding: paddingValue },
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.background,
  },
});

// Badge component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'default';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  size = 'sm',
}) => {
  const colors = {
    primary: { bg: COLORS.primaryLight, text: COLORS.primary },
    success: { bg: COLORS.successLight, text: COLORS.success },
    warning: { bg: COLORS.warningLight, text: '#D68910' },
    error: { bg: COLORS.errorLight, text: COLORS.error },
    default: { bg: COLORS.background, text: COLORS.textLight },
  };

  return (
    <View style={[
      badgeStyles.badge, 
      { backgroundColor: colors[variant].bg },
      size === 'sm' && badgeStyles.badgeSm,
    ]}>
      <Text style={[badgeStyles.badgeText, { color: colors[variant].text }]}>
        {children}
      </Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeSm: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});

// Skeleton loader
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.sm,
}) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = {
    opacity,
  };

  return (
    <Animated.View 
      style={[
        { width, height, borderRadius, backgroundColor: COLORS.background },
        animatedStyle,
      ]} 
    />
  );
};
