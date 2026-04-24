import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PageTitle } from '../../components/PageTitle';
import { useOnboardingStore } from '../../src/store/onboarding-store';

type IntentOption = 'provider' | 'requester' | 'both';

const intents: { key: IntentOption; label: string; description: string; icon: string }[] = [
  {
    key: 'provider',
    label: 'Offer my skills',
    description: 'I want to create offers, receive proposals, and earn through my skills.',
    icon: '💼',
  },
  {
    key: 'requester',
    label: 'Find skilled help',
    description: 'I want to post requests, compare providers, and get work done.',
    icon: '🔎',
  },
  {
    key: 'both',
    label: 'Both',
    description: 'I want to offer skills and also find help for my own projects.',
    icon: '🤝',
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const { setRole, setGoals } = useOnboardingStore();
  const [selectedIntent, setSelectedIntent] = useState<IntentOption | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedIntent) return;

    setLoading(true);
    try {
      setRole('member');
      setGoals([selectedIntent]);
      router.push('/(onboarding)/profile-setup');
    } catch (error) {
      console.error('Error saving onboarding intent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageTitle
        title="What do you want to do?"
        subtitle="This customizes your first WorkAI experience. Admin and operator access must be granted separately."
        size="lg"
      />

      <View style={styles.roles}>
        {intents.map((intent) => (
          <TouchableOpacity
            key={intent.key}
            style={[styles.roleCard, selectedIntent === intent.key && styles.roleCardSelected]}
            onPress={() => setSelectedIntent(intent.key)}
          >
            <Text style={styles.roleIcon}>{intent.icon}</Text>
            <Text style={styles.roleLabel}>{intent.label}</Text>
            <Text style={styles.roleDescription}>{intent.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedIntent}
          loading={loading}
          fullWidth
          size="lg"
        />
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
  roles: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  roleCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 2,
    borderColor: theme.colors.surface.border,
  },
  roleCardSelected: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[900] + '20',
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  roleLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  roleDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
});
