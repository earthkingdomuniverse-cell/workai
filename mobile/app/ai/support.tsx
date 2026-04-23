import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radius } from '../../theme';
import { EmptyState } from '../../components/EmptyState';
import { aiService, SupportOutput } from '../../src/services/aiService';

export default function AiSupportScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SupportOutput | null>(null);
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please enter your support message');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.support({ message: message.trim() });
      setResponse(result);
      setCategory(result.category);
      setPriority(result.priority);
    } catch (_error) {
      setError('Failed to process your support request');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      case 'urgent':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      account: 'Account Issues',
      payment: 'Payment & Billing',
      technical: 'Technical Support',
      deal: 'Deal Disputes',
      verification: 'Verification & Trust',
      general: 'General Questions',
    };

    return categories[category] || category;
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>AI Support</Text>
        <Text style={styles.subtitle}>Get instant help with your questions</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>How can we help you?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your issue or question..."
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Get Help</Text>
          )}
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {!response && !loading && !error ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="No support answer yet"
            description="Describe your issue to get AI classification and a suggested answer."
            icon="🆘"
          />
        </View>
      ) : null}

      {response && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Text style={styles.responseTitle}>AI Response</Text>
            <View
              style={[styles.priorityBadge, { backgroundColor: getPriorityColor(priority) + '15' }]}
            >
              <Text style={[styles.priorityText, { color: getPriorityColor(priority) }]}>
                {priority}
              </Text>
            </View>
          </View>

          <View style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>Category:</Text>
            <Text style={styles.categoryValue}>{getCategoryLabel(category)}</Text>
          </View>

          <View style={styles.answerContainer}>
            <Text style={styles.answer}>{response.answer}</Text>
          </View>

          {response.escalationRequired && (
            <View style={styles.escalationNotice}>
              <Text style={styles.escalationText}>
                ⚠️ This issue requires escalation to our support team
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Support Team</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    padding: spacing.lg,
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
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginTop: spacing.sm,
  },
  emptyWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  responseContainer: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: radius.lg,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  responseTitle: {
    ...typography.h2,
    color: colors.text,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  priorityText: {
    ...typography.caption,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  categoryLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  categoryValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  answerContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  answer: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  escalationNotice: {
    backgroundColor: colors.error + '15',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  escalationText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '500',
  },
  contactButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  contactButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
