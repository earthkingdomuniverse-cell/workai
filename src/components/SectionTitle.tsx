import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SectionTitle({ title, subtitle, size = 'md' }: SectionTitleProps) {
  return (
    <>
      <Text style={[styles.title, styles[size]]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  sm: {
    fontSize: theme.typography.fontSize.md,
  },
  md: {
    fontSize: theme.typography.fontSize.lg,
  },
  lg: {
    fontSize: theme.typography.fontSize.xl,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
});
