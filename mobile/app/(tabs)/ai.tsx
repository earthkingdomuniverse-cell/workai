import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';

export default function AiScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Copilot</Text>
      <TouchableOpacity style={styles.card} onPress={() => router.push('/ai/match')}>
        <Text style={styles.cardTitle}>AI Match</Text>
        <Text style={styles.cardText}>Find recommended offers.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => router.push('/ai/price')}>
        <Text style={styles.cardTitle}>AI Price</Text>
        <Text style={styles.cardText}>Estimate a pricing range.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => router.push('/ai/support')}>
        <Text style={styles.cardTitle}>AI Support</Text>
        <Text style={styles.cardText}>Classify help requests instantly.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => router.push('/ai/next-action')}>
        <Text style={styles.cardTitle}>AI Next Action</Text>
        <Text style={styles.cardText}>See recommended next steps.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cardText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
});
