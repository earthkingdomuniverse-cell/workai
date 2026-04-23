import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  withPadding?: boolean;
}

export function ScreenContainer({ children, style, withPadding = true }: ScreenContainerProps) {
  return (
    <View style={[styles.container, withPadding && styles.withPadding, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  withPadding: {
    paddingHorizontal: theme.spacing.lg,
  },
});
