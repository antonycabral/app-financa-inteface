import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../styles/theme';

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  containerStyle?: ViewStyle;
  required?: boolean;
  link?: { text: string; url?: string };
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  checked,
  onChange,
  containerStyle,
  required = false,
  link,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={() => onChange(!checked)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {link && (
          <Text style={styles.link}>{link.text}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.background,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  required: {
    color: COLORS.error,
  },
  link: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    textDecorationLine: 'underline',
  },
});
