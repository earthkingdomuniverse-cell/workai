import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function MessageThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Conversation</Text>
      <Text style={styles.subtitle}>Thread ID: {id}</Text>
      <View style={styles.threadCard}>
        <Text style={styles.threadText}>
          Conversation detail route is available and deep link params resolve correctly.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  threadCard: { backgroundColor: colors.card, borderRadius: 16, padding: spacing.lg },
  threadText: { ...typography.body, color: colors.textSecondary },
});
