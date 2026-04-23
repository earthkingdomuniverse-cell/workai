import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PageTitle } from '../../components/PageTitle';
import { useOnboardingStore } from '../../src/store/onboarding-store';

const suggestedSkills = [
  'JavaScript',
  'React',
  'Python',
  'Design',
  'Marketing',
  'Writing',
  'Data Analysis',
  'Project Management',
];

export default function SkillsSetupScreen() {
  const router = useRouter();
  const onboarding = useOnboardingStore();
  const [skills, setSkills] = useState<string[]>(onboarding.skills);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setInputValue('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleContinue = async () => {
    if (skills.length === 0) {
      return;
    }

    setLoading(true);
    try {
      onboarding.setSkills(skills);
      router.push('/(onboarding)/goals-setup');
    } catch (error) {
      console.error('Error saving skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onboarding.setSkills(skills);
    router.push('/(onboarding)/goals-setup');
  };

  return (
    <View style={styles.container}>
      <PageTitle
        title="What are your skills?"
        subtitle="Add at least one skill to get started"
        size="lg"
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Type a skill..."
          placeholderTextColor={theme.colors.text.tertiary}
          onSubmitEditing={() => inputValue && addSkill(inputValue)}
          returnKeyType="done"
        />
        {inputValue ? (
          <TouchableOpacity style={styles.addButton} onPress={() => addSkill(inputValue)}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.skills}>
        {skills.map((skill) => (
          <View key={skill} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
            <TouchableOpacity style={styles.removeButton} onPress={() => removeSkill(skill)}>
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.suggestions}>
        <Text style={styles.suggestionsTitle}>Suggested:</Text>
        <View style={styles.suggestionsList}>
          {suggestedSkills.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.suggestionChip,
                skills.includes(skill) && styles.suggestionChipSelected,
              ]}
              onPress={() => (skills.includes(skill) ? removeSkill(skill) : addSkill(skill))}
            >
              <Text
                style={[
                  styles.suggestionText,
                  skills.includes(skill) && styles.suggestionTextSelected,
                ]}
              >
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          fullWidth
          size="lg"
          disabled={skills.length === 0}
        />
        <View style={styles.skipButton}>
          <PrimaryButton
            title="Skip for now"
            onPress={handleSkip}
            loading={loading}
            fullWidth
            size="md"
          />
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
  inputContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface.input,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
  },
  addButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: theme.colors.primary[950],
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.md,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[900],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    gap: theme.spacing.xs,
  },
  skillText: {
    color: theme.colors.primary[300],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  removeButton: {
    marginLeft: theme.spacing.xs,
  },
  removeButtonText: {
    color: theme.colors.primary[400],
    fontSize: theme.typography.fontSize.sm,
  },
  suggestions: {
    marginTop: theme.spacing.xl,
  },
  suggestionsTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.surface.border,
  },
  suggestionChipSelected: {
    backgroundColor: theme.colors.primary[900],
    borderColor: theme.colors.primary[700],
  },
  suggestionText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  suggestionTextSelected: {
    color: theme.colors.primary[300],
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  skipButton: {
    marginTop: theme.spacing.sm,
  },
});
