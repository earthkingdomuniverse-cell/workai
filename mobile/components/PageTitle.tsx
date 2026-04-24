import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type PageTitleProps = {
  title: string;
  subtitle?: string;
  size?: 'md' | 'lg';
};

export function PageTitle({ title, subtitle, size = 'md' }: PageTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, size === 'lg' && styles.titleLarge]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export default PageTitle;

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: 30,
  },
  titleLarge: {
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: 36,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 24,
  },
});
