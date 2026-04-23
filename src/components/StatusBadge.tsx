import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, getStatusColor } from '../theme';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'pill' | 'dot';
}

export function StatusBadge({ status, label, size = 'md', variant = 'badge' }: StatusBadgeProps) {
  const colors = getStatusColor(status);
  const isDot = variant === 'dot';

  return (
    <View
      style={[
        styles.container,
        styles[size],
        variant === 'pill' && styles.pill,
        variant === 'dot' && styles.dot,
        {
          backgroundColor: isDot ? undefined : colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      {variant !== 'dot' && (
        <Text
          style={[
            styles.text,
            styles[size],
            {
              color: colors.text,
            },
          ]}
        >
          {label || status}
        </Text>
      )}
      {variant !== 'badge' && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: colors.text,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    padding: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sm: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  md: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  lg: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  pill: {
    borderRadius: theme.radius.full,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
});
