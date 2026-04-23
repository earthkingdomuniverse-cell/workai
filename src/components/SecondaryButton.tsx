import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'md',
  icon,
}: SecondaryButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.primary[400]} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, styles[size]]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  sm: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  md: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  lg: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    borderColor: theme.colors.neutral[700],
  },
  text: {
    color: theme.colors.primary[400],
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.sm,
  },
  icon: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary[400],
  },
});
