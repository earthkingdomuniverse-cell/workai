import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type PrimaryButtonProps = TouchableOpacityProps & {
  title?: string;
  label?: string;
  loading?: boolean;
  children?: React.ReactNode;
};

export function PrimaryButton({ title, label, loading, disabled, children, style, ...props }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      style={[styles.button, (disabled || loading) && styles.disabled, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        children || <Text style={styles.text}>{title || label || 'Continue'}</Text>
      )}
    </TouchableOpacity>
  );
}

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
});
