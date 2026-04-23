import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PageTitle } from '../../components/PageTitle';
import { useAuthStore } from '../../src/store/auth-store';
import { useOnboardingStore } from '../../src/store/onboarding-store';

type RoleOption = 'member' | 'operator' | 'admin';

const roles: { key: RoleOption; label: string; description: string; icon: string }[] = [
  {
    key: 'member',
    label: 'Member',
    description: 'I want to offer services and grow my career',
    icon: '👤',
  },
  {
    key: 'operator',
    label: 'Operator',
    description: 'I want to manage and moderate the platform',
    icon: '⚙️',
  },
  {
    key: 'admin',
    label: 'Admin',
    description: 'I want full administrative access',
    icon: '🔐',
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const { role, setRole } = useOnboardingStore();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(
    (role || authUser?.role || null) as RoleOption | null,
  );
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      setRole(selectedRole);
      router.push('/(onboarding)/profile-setup');
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageTitle
        title="Choose Your Role"
        subtitle="Select the role that best describes you"
        size="lg"
      />

      <View style={styles.roles}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.key}
            style={[styles.roleCard, selectedRole === role.key && styles.roleCardSelected]}
            onPress={() => {
              setSelectedRole(role.key);
              setRole(role.key);
            }}
          >
            <Text style={styles.roleIcon}>{role.icon}</Text>
            <Text style={styles.roleLabel}>{role.label}</Text>
            <Text style={styles.roleDescription}>{role.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedRole}
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
