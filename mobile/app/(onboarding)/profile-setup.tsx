import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PageTitle } from '../../components/PageTitle';
import { TextField } from '../../components/TextField';
import { MultilineField } from '../../components/MultilineField';
import { useOnboardingStore } from '../../src/store/onboarding-store';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const onboarding = useOnboardingStore();
  const [displayName, setDisplayName] = useState(onboarding.displayName);
  const [bio, setBio] = useState(onboarding.bio);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      onboarding.setProfile({ displayName: displayName.trim(), bio: bio.trim() });
      router.push('/(onboarding)/skills-setup');
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageTitle
        title="Tell Us About Yourself"
        subtitle="This information will be visible on your profile"
        size="lg"
      />

      <View style={styles.form}>
        <TextField
          label="Display Name"
          placeholder="Your name or business name"
          value={displayName}
          onChange={setDisplayName}
          error={error}
        />

        <MultilineField
          label="Bio (Optional)"
          placeholder="Tell us about yourself, your skills, and what you're looking for..."
          value={bio}
          onChange={setBio}
          maxLength={500}
        />

        <View style={styles.hint}>
          <Text style={styles.hintText}>💡 Tip: A complete profile helps you stand out</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
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
  form: {
    marginTop: theme.spacing.xl,
  },
  hint: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
  },
  hintText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
});
