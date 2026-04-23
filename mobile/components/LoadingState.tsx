import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
};

export function LoadingState({ message = 'Loading...', fullScreen = false }: LoadingStateProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export default LoadingState;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    minHeight: 160,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  message: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
  },
});
