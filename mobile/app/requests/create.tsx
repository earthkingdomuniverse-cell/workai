import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { requestService } from '../../src/services/requestService';

export default function CreateRequestScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    currency: 'USD',
    negotiable: true,
    skills: '',
    experienceLevel: 'intermediate' as 'beginner' | 'intermediate' | 'expert',
    locationType: 'remote' as 'remote' | 'onsite' | 'hybrid',
    urgency: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    deadline: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 20)
      newErrors.description = 'Description must be at least 20 characters';
    if (
      formData.budgetMin &&
      formData.budgetMax &&
      parseFloat(formData.budgetMin) > parseFloat(formData.budgetMax)
    ) {
      newErrors.budgetMin = 'Minimum budget cannot exceed maximum';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      await requestService.createRequest({
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget:
          formData.budgetMin || formData.budgetMax
            ? {
                min: Number(formData.budgetMin || 0),
                max: Number(formData.budgetMax || 0),
                currency: formData.currency,
                negotiable: formData.negotiable,
              }
            : undefined,
        skills: formData.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        experienceLevel: formData.experienceLevel,
        location: { type: formData.locationType },
        urgency: formData.urgency,
        deadline: formData.deadline || undefined,
      });
      Alert.alert('Success', 'Request created successfully!', [
        { text: 'OK', onPress: () => router.replace('/requests/manage') },
      ]);
    } catch (_err) {
      setSubmitError('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Create New Request</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder="e.g., E-commerce Platform Development"
          placeholderTextColor={theme.colors.text.tertiary}
          value={formData.title}
          onChangeText={(value) => setFormData({ ...formData, title: value })}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.description && styles.inputError]}
          placeholder="Describe your request in detail..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={formData.description}
          onChangeText={(value) => setFormData({ ...formData, description: value })}
          multiline
          numberOfLines={6}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Budget Range (USD)</Text>
        <View style={styles.budgetRow}>
          <View style={styles.budgetInput}>
            <Text style={styles.budgetLabel}>Min</Text>
            <TextInput
              style={[styles.input, errors.budgetMin && styles.inputError]}
              placeholder="0"
              placeholderTextColor={theme.colors.text.tertiary}
              value={formData.budgetMin}
              onChangeText={(value) => setFormData({ ...formData, budgetMin: value })}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.budgetSeparator}>-</Text>
          <View style={styles.budgetInput}>
            <Text style={styles.budgetLabel}>Max</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={theme.colors.text.tertiary}
              value={formData.budgetMax}
              onChangeText={(value) => setFormData({ ...formData, budgetMax: value })}
              keyboardType="numeric"
            />
          </View>
        </View>
        {errors.budgetMin && <Text style={styles.errorText}>{errors.budgetMin}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Skills Needed (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., React, Node.js, MongoDB"
          placeholderTextColor={theme.colors.text.tertiary}
          value={formData.skills}
          onChangeText={(value) => setFormData({ ...formData, skills: value })}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Experience Level</Text>
        <View style={styles.selectRow}>
          {(['beginner', 'intermediate', 'expert'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.selectOption,
                formData.experienceLevel === level && styles.selectOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, experienceLevel: level })}
            >
              <Text
                style={[
                  styles.selectOptionText,
                  formData.experienceLevel === level && styles.selectOptionTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Location Type</Text>
        <View style={styles.selectRow}>
          {(['remote', 'onsite', 'hybrid'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.selectOption,
                formData.locationType === type && styles.selectOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, locationType: type })}
            >
              <Text
                style={[
                  styles.selectOptionText,
                  formData.locationType === type && styles.selectOptionTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Urgency</Text>
        <View style={styles.selectRow}>
          {(['low', 'medium', 'high', 'urgent'] as const).map((urgency) => (
            <TouchableOpacity
              key={urgency}
              style={[
                styles.selectOptionSmall,
                formData.urgency === urgency && styles.selectOptionSmallActive,
              ]}
              onPress={() => setFormData({ ...formData, urgency })}
            >
              <Text
                style={[
                  styles.selectOptionTextSmall,
                  formData.urgency === urgency && styles.selectOptionTextSmallActive,
                ]}
              >
                {urgency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
      <View style={styles.submitContainer}>
        <PrimaryButton
          title="Create Request"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
        />
      </View>
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: { padding: theme.spacing.xl, paddingTop: theme.spacing.xl * 2 },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  field: { paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface.input,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
  },
  inputError: { borderColor: theme.colors.error.main, borderWidth: 2 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error.light,
    marginTop: theme.spacing.xs,
  },
  submitError: {
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error.light,
    marginBottom: theme.spacing.md,
  },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  budgetInput: { flex: 1 },
  budgetLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  budgetSeparator: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.lg,
  },
  selectRow: { flexDirection: 'row', gap: theme.spacing.sm },
  selectOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
  },
  selectOptionActive: { backgroundColor: theme.colors.primary[500] },
  selectOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  selectOptionTextActive: {
    color: theme.colors.primary[950],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  selectOptionSmall: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
  },
  selectOptionSmallActive: {
    backgroundColor: theme.colors.primary[900],
    borderColor: theme.colors.primary[500],
    borderWidth: 1,
  },
  selectOptionTextSmall: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  selectOptionTextSmallActive: {
    color: theme.colors.primary[300],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  submitContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  footer: { height: theme.spacing.xl * 2 },
});
