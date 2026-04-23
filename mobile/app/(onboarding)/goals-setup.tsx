import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PageTitle } from '../../components/PageTitle';
import { useAuthStore } from '../../src/store/auth-store';
import { useOnboardingStore } from '../../src/store/onboarding-store';

const suggestedGoals = [
  'Find new clients',
  'Grow my network',
  'Learn new skills',
  'Earn extra income',
  'Build my portfolio',
  'Transition careers',
];

export default function GoalsSetupScreen() {
  const router = useRouter();
  const onboarding = useOnboardingStore();
  const [goals, setGoals] = useState<string[]>(onboarding.goals);
  const [loading, setLoading] = useState(false);
  const { setOnboardingCompleted, updateUser } = useAuthStore();

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      onboarding.setGoals(goals);
      if (onboarding.role) {
        updateUser({ role: onboarding.role });
      }
      await setOnboardingCompleted(true);
      onboarding.reset();
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    onboarding.setGoals(goals);
    if (onboarding.role) {
      updateUser({ role: onboarding.role });
    }
    await setOnboardingCompleted(true);
    onboarding.reset();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <PageTitle title="What are your goals?" subtitle="Select all that apply to you" size="lg" />

      <View style={styles.goals}>
        {suggestedGoals.map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[styles.goalCard, goals.includes(goal) && styles.goalCardSelected]}
            onPress={() => toggleGoal(goal)}
          >
            <Text style={[styles.goalText, goals.includes(goal) && styles.goalTextSelected]}>
              {goals.includes(goal) ? '✓' : '○'} {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {goals.length} goal{goals.length !== 1 ? 's' : ''} selected
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Complete Setup"
          onPress={handleComplete}
          loading={loading}
          fullWidth
          size="lg"
        />
        <View style={styles.skipButton}>
          <PrimaryButton title="Skip" onPress={handleSkip} loading={loading} fullWidth size="md" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.xl,
  },
  goals: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  goalCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 2,
    borderColor: theme.colors.surface.border,
  },
  goalCardSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[900] + '30',
  },
  goalText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  goalTextSelected: {
    color: theme.colors.primary[300],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  progress: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  skipButton: {
    marginTop: theme.spacing.sm,
  },
});
