import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PageTitle } from '../../components/PageTitle';

export default function IntroScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    router.push('/(onboarding)/role-select');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🚀</Text>

        <PageTitle
          title="Welcome to SkillValue AI"
          subtitle="Let's set up your profile to get started"
          size="lg"
        />

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💼</Text>
            <Text style={styles.featureText}>Showcase your skills</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤝</Text>
            <Text style={styles.featureText}>Connect with opportunities</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Achieve your goals</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Get Started"
            onPress={handleContinue}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  features: {
    marginTop: theme.spacing.xl * 2,
    gap: theme.spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl * 2,
    paddingTop: theme.spacing.xl,
  },
});
