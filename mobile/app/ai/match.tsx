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
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme';
import { EmptyState } from '../../components/EmptyState';
import { aiService, AiMatchInput, AiRecommendation } from '../../src/services/aiService';

type Urgency = 'low' | 'medium' | 'high';
const urgencyOptions: Urgency[] = ['low', 'medium', 'high'];

export default function AiMatchScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AiRecommendation[]>([]);

  const parseBudget = (value: string): { min?: number; max?: number } | undefined => {
    if (!value.trim()) return undefined;
    const num = parseFloat(value);
    if (isNaN(num)) return undefined;
    if (value.includes('-')) {
      const [min, max] = value.split('-').map((v) => parseFloat(v.trim()));
      return { min: isNaN(min) ? undefined : min, max: isNaN(max) ? undefined : max };
    }
    return { min: num, max: num };
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const input: AiMatchInput = {
        title: title.trim(),
        skills: skills.trim()
          ? skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        budget: parseBudget(budget),
        urgency,
      };

      const recommendations = await aiService.match(input);
      setResults(recommendations);
    } catch (_err) {
      setError('Failed to generate matches. Please try again.');
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
      <Text style={styles.title}>AI Match</Text>
      <Text style={styles.subtitle}>Find recommended offers from your request context.</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Skills (comma separated)"
        placeholderTextColor={colors.textSecondary}
        value={skills}
        onChangeText={setSkills}
      />
      <TextInput
        style={styles.input}
        placeholder="Budget"
        placeholderTextColor={colors.textSecondary}
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
      />

      <View style={styles.urgencyRow}>
        {urgencyOptions.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.urgencyChip, urgency === item && styles.urgencyChipActive]}
            onPress={() => setUrgency(item)}
          >
            <Text style={[styles.urgencyText, urgency === item && styles.urgencyTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Run Match</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && results.length === 0 && !error ? (
        <EmptyState
          title="No results yet"
          description="Run AI match to see recommended offers."
          icon="🤖"
        />
      ) : null}

      {results.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => router.push(`/offers/${item.entityId}`)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.score}>{Math.round(item.score)}%</Text>
          </View>
          <Text style={styles.cardReason}>{item.reason}</Text>
          {item.price && <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>}
        </TouchableOpacity>
      ))}
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
  urgencyRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  urgencyChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  urgencyChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  urgencyText: { ...typography.body, color: colors.textSecondary },
  urgencyTextActive: { color: colors.white, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonText: { ...typography.body, color: colors.white, fontWeight: '600' },
  error: { ...typography.body, color: colors.error, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.text, flex: 1, marginRight: spacing.sm },
  score: { ...typography.caption, color: colors.success, fontWeight: '700' },
  cardReason: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  cardPrice: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
