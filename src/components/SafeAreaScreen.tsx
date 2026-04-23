import React from 'react';
import { View, StyleSheet, SafeAreaViewProps, Platform } from 'react-native';
import { theme } from '../theme';

interface SafeAreaScreenProps {
  children: React.ReactNode;
  style?: SafeAreaViewProps['style'];
  backgroundColor?: string;
}

export function SafeAreaScreen({ children, style, backgroundColor }: SafeAreaScreenProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor || theme.colors.background.primary },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
});
