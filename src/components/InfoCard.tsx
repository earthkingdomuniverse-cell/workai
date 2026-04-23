import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface InfoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function InfoCard({ title, value, subtitle, icon, trend, trendValue }: InfoCardProps) {
  return (
    <View style={styles.container}>
      {(icon || icon) && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {trend && trendValue && (
        <View
          style={[
            styles.trend,
            trend === 'up' && styles.trendUp,
            trend === 'down' && styles.trendDown,
          ]}
        >
          <Text
            style={[
              styles.trendText,
              trend === 'up' && styles.trendTextUp,
              trend === 'down' && styles.trendTextDown,
            ]}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface.border,
  },
  icon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  trend: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  trendUp: {
    backgroundColor: theme.colors.success.main + '20',
  },
  trendDown: {
    backgroundColor: theme.colors.error.main + '20',
  },
  trendText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  trendTextUp: {
    color: theme.colors.success.main,
  },
  trendTextDown: {
    color: theme.colors.error.main,
  },
});
