import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { EmptyState } from '../../components/EmptyState';
import { aiService, PriceSuggestionInput } from '../../src/services/aiService';

export default function AiPriceScreen() {
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [providerLevel, setProviderLevel] = useState<'beginner' | 'intermediate' | 'expert'>(
    'intermediate',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    suggested: number;
    floor: number;
    ceiling: number;
    reasoning: string[];
  } | null>(null);

  const handleEstimate = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const input: PriceSuggestionInput = {
        title: title.trim(),
        skills: skills.trim()
          ? skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        providerLevel,
      };
      const response = await aiService.suggestPrice(input);
      setResult({
        suggested: response.suggested_price,
        floor: response.floor_price,
        ceiling: response.ceiling_price,
        reasoning: response.reasoning,
      });
    } catch (_err) {
      setError('Failed to estimate price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>AI Price</Text>
      <Text style={styles.subtitle}>Estimate a reasonable price range before publishing.</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Skills"
        placeholderTextColor={colors.textSecondary}
        value={skills}
        onChangeText={setSkills}
      />

      <View style={styles.levelRow}>
        {(['beginner', 'intermediate', 'expert'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.levelChip, providerLevel === item && styles.levelChipActive]}
            onPress={() => setProviderLevel(item)}
          >
            <Text style={[styles.levelText, providerLevel === item && styles.levelTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleEstimate} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Estimate Price</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !result && !error ? (
        <EmptyState
          title="No estimate yet"
          description="Submit the form to generate a suggested range."
          icon="💡"
        />
      ) : null}

      {result ? (
        <View style={styles.card}>
          <Text style={styles.metric}>Suggested: ${result.suggested}</Text>
          <Text style={styles.metric}>Floor: ${result.floor}</Text>
          <Text style={styles.metric}>Ceiling: ${result.ceiling}</Text>
          {result.reasoning.map((item) => (
            <Text key={item} style={styles.reason}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  levelRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  levelChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  levelChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  levelText: { ...typography.body, color: colors.textSecondary },
  levelTextActive: { color: colors.white, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonText: { ...typography.body, color: colors.white, fontWeight: '600' },
  error: { ...typography.body, color: colors.error, marginBottom: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg },
  metric: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  reason: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});
