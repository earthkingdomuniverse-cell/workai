import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type PageTitleProps = {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | string;
  children?: React.ReactNode;
};

export function PageTitle({ title, subtitle, size = 'md', children }: PageTitleProps) {
  return (
    <View style={styles.container}>
      {title ? <Text style={[styles.title, size === 'lg' && styles.titleLarge]}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export default PageTitle;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  titleLarge: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
