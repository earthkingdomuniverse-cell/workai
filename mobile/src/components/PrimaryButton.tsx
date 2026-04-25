import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type PrimaryButtonProps = Omit<TouchableOpacityProps, 'onPress'> & {
  title?: string;
  label?: string;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg' | string;
  onPress?: () => void | Promise<void>;
  children?: React.ReactNode;
};

export function PrimaryButton({
  title,
  label,
  loading,
  disabled,
  fullWidth,
  size = 'md',
  children,
  style,
  ...props
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      style={[
        styles.button,
        size === 'lg' && styles.buttonLarge,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
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
  buttonLarge: {
    paddingVertical: spacing.lg,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
});
