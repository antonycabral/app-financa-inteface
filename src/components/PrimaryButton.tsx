import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../styles/theme';

interface PrimaryButtonProps extends TouchableOpacityProps {
  label: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: any;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  isLoading = false,
  variant = 'primary',
  size = 'large',
  style,
  textStyle,
  disabled,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.buttonSecondary];
      case 'outline':
        return [...baseStyle, styles.buttonOutline];
      default:
        return [...baseStyle, styles.buttonPrimary];
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];
    
    switch (variant) {
      case 'secondary':
        return [...baseStyle, styles.textSecondary];
      case 'outline':
        return [...baseStyle, styles.textOutline];
      default:
        return [...baseStyle, styles.textPrimary];
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.primary : COLORS.background}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button_small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  button_medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  button_large: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minHeight: 54,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
  },
  text_small: {
    fontSize: FONT_SIZES.xs,
  },
  text_medium: {
    fontSize: FONT_SIZES.sm,
  },
  text_large: {
    fontSize: FONT_SIZES.md,
  },
  textPrimary: {
    color: COLORS.background,
  },
  textSecondary: {
    color: COLORS.text,
  },
  textOutline: {
    color: COLORS.primary,
  },
});
