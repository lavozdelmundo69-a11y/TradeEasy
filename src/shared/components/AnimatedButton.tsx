// Componente de botón animado reutilizable
import React, { memo, useCallback } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ANIMATION_CONFIG } from '../constants';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: COLORS.primary, text: COLORS.textInverse },
  secondary: { bg: COLORS.surface, text: COLORS.text, border: COLORS.background },
  success: { bg: COLORS.success, text: COLORS.textInverse },
  danger: { bg: COLORS.error, text: COLORS.textInverse },
  ghost: { bg: 'transparent', text: COLORS.primary },
};

const sizeStyles: Record<ButtonSize, { padding: number; fontSize: number; iconSize: number }> = {
  sm: { padding: SPACING.sm, fontSize: FONT_SIZES.sm, iconSize: 16 },
  md: { padding: SPACING.md, fontSize: FONT_SIZES.md, iconSize: 20 },
  lg: { padding: SPACING.lg, fontSize: FONT_SIZES.lg, iconSize: 24 },
};

export const AnimatedButton = memo<AnimatedButtonProps>(({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  icon,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, ANIMATION_CONFIG.spring);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, ANIMATION_CONFIG.spring);
  }, [scale]);

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.bg,
          paddingVertical: sizeStyle.padding,
          paddingHorizontal: sizeStyle.padding * 1.5,
          borderColor: variantStyle.border || 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              { color: variantStyle.text, fontSize: sizeStyle.fontSize },
              icon && styles.textWithIcon,
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: SPACING.xs,
  },
});
