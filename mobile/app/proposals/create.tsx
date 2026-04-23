import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, radius, typography } from '../../theme';
import { proposalService } from '../../src/services/proposalService';

export default function CreateProposalScreen() {
  const router = useRouter();
  const { requestId, offerId } = useLocalSearchParams<{
    requestId?: string;
    offerId?: string;
  }>();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState('');
  const [currency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!requestId && !offerId) {
      Alert.alert('Error', 'Proposal must be created from a request or offer.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (message.trim().length < 20) {
      Alert.alert('Error', 'Message must be at least 20 characters');
      return;
    }

    if (!proposedAmount || parseFloat(proposedAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!estimatedDeliveryDays || parseInt(estimatedDeliveryDays) <= 0) {
      Alert.alert('Error', 'Please enter valid delivery days');
      return;
    }

    setLoading(true);

    try {
      await proposalService.createProposal({
        requestId,
        offerId,
        title: title.trim(),
        message: message.trim(),
        proposedAmount: parseFloat(proposedAmount),
        currency,
        estimatedDeliveryDays: parseInt(estimatedDeliveryDays),
      });

      Alert.alert('Success', 'Proposal submitted successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.screenTitle}>Send Proposal</Text>
        <Text style={styles.screenSubtitle}>
          Share your scope, price, and delivery estimate clearly.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Complete Website Redesign"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100 characters</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your proposal, approach, and why you're the best fit..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={5000}
          />
          <Text style={styles.charCount}>{message.length}/5000 characters</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInputField}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={proposedAmount}
                onChangeText={setProposedAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, styles.halfWidth, styles.ml2]}>
            <Text style={styles.label}>Delivery (days) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 7"
              placeholderTextColor={colors.textSecondary}
              value={estimatedDeliveryDays}
              onChangeText={setEstimatedDeliveryDays}
              keyboardType="numeric"
            />
          </View>
        </View>

        {(requestId || offerId) && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {requestId
                ? `Submitting proposal for Request #${requestId}`
                : `Submitting proposal for Offer #${offerId}`}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Proposal</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: spacing.lg,
  },
  screenTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  screenSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },
  ml2: {
    marginLeft: spacing.md,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencySymbol: {
    ...typography.h2,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  amountInputField: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  infoBox: {
    backgroundColor: colors.primary + '10',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.body,
    color: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
