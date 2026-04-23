import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  color = 'primary',
}: StatCardProps) {
  const colorMap = {
    primary: theme.colors.primary[500],
    secondary: theme.colors.secondary[500],
    success: theme.colors.success.main,
    error: theme.colors.error.main,
    warning: theme.colors.warning.main,
  };

  return (
    <View style={[styles.container, { borderColor: colorMap[color] }]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text
            style={[
              styles.trend,
              trend === 'up'
                ? styles.trendUp
                : trend === 'down'
                  ? styles.trendDown
                  : styles.trendNeutral,
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
    borderWidth: 2,
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  label: {
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
  trendContainer: {
    marginTop: theme.spacing.xs,
  },
  trend: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  trendUp: {
    color: theme.colors.success.main,
  },
  trendDown: {
    color: theme.colors.error.main,
  },
  trendNeutral: {
    color: theme.colors.text.tertiary,
  },
});
