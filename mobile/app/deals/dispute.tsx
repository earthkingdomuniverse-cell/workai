import React, { useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography } from '../../theme';
import { dealService } from '../../src/services/dealService';

export default function DealDisputeScreen() {
  const { id } = useLocalSearchParams();
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDispute = () => {
    if (!disputeReason.trim() || !disputeDescription.trim()) {
      setError('Please enter both a reason and description.');
      return;
    }

    setError(null);

    Alert.alert('Dispute Submission', 'Are you sure you want to submit this dispute?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', onPress: () => handleSubmitDispute() },
    ]);
  };

  const handleSubmitDispute = async () => {
    setSubmitting(true);
    try {
      await dealService.createDispute(id as string, {
        reason: disputeReason,
        description: disputeDescription,
      });
      Alert.alert('Submitted', `Dispute for ${id as string} submitted.`);
    } catch (_error) {
      setError('Failed to submit dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Open Dispute</Text>
      <Text style={styles.titleText}>Deal: {id as string}</Text>
      <TextInput
        style={styles.input}
        placeholder="Reason"
        placeholderTextColor={colors.textSecondary}
        value={disputeReason}
        onChangeText={setDisputeReason}
      />
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Describe the issue"
        placeholderTextColor={colors.textSecondary}
        value={disputeDescription}
        onChangeText={setDisputeDescription}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleDispute}>
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Submit Dispute</Text>
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  titleText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
