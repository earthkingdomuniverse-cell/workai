import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title = 'No items',
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
});
