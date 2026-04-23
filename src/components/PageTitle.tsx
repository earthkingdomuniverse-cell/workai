import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
}

export function PageTitle({ title, subtitle, size = 'lg', align = 'left' }: PageTitleProps) {
  const titleSize = {
    sm: theme.typography.fontSize.xl,
    md: theme.typography.fontSize['2xl'],
    lg: theme.typography.fontSize['3xl'],
    xl: theme.typography.fontSize['4xl'],
  }[size];

  return (
    <>
      <Text style={[styles.title, { fontSize: titleSize }]}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
});
