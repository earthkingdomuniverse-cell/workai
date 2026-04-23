import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function DealCreateScreen() {
  const router = useRouter();
  const { offerId, requestId } = useLocalSearchParams<{ offerId?: string; requestId?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Deal</Text>
      <Text style={styles.subtitle}>
        Offer: {offerId || 'n/a'} | Request: {requestId || 'n/a'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)/deals')}>
        <Text style={styles.buttonText}>Go to Deals</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonText: { ...typography.body, color: colors.white, fontWeight: '600' },
});
