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
import { offerService } from '../../src/services/offerService';

export default function CreateOfferScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    pricingType: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    deliveryDays: '',
    skills: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.length < 20)
      newErrors.description = 'Description must be at least 20 characters';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      await offerService.createOffer({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        currency: formData.currency,
        pricingType: formData.pricingType,
        deliveryTime: formData.deliveryDays ? Number(formData.deliveryDays) : undefined,
        skills: formData.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      Alert.alert('Success', 'Offer created successfully!', [
        { text: 'OK', onPress: () => router.replace('/offers/manage') },
      ]);
    } catch (_err) {
      setSubmitError('Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Create New Offer</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          placeholder="e.g., AI-Powered Web Application"
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
          placeholder="Describe your offer in detail..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={formData.description}
          onChangeText={(value) => setFormData({ ...formData, description: value })}
          multiline
          numberOfLines={6}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Price *</Text>
        <TextInput
          style={[styles.input, errors.price && styles.inputError]}
          placeholder="0.00"
          placeholderTextColor={theme.colors.text.tertiary}
          value={formData.price}
          onChangeText={(value) => setFormData({ ...formData, price: value })}
          keyboardType="numeric"
        />
        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Pricing Type</Text>
        <View style={styles.pricingTypes}>
          {(['fixed', 'hourly', 'negotiable'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.pricingTypeChip,
                formData.pricingType === type && styles.pricingTypeChipActive,
              ]}
              onPress={() => setFormData({ ...formData, pricingType: type })}
            >
              <Text
                style={[
                  styles.pricingTypeText,
                  formData.pricingType === type && styles.pricingTypeTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Delivery Time (days)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 7"
          placeholderTextColor={theme.colors.text.tertiary}
          value={formData.deliveryDays}
          onChangeText={(value) => setFormData({ ...formData, deliveryDays: value })}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Skills (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., JavaScript, React, Node.js"
          placeholderTextColor={theme.colors.text.tertiary}
          value={formData.skills}
          onChangeText={(value) => setFormData({ ...formData, skills: value })}
        />
      </View>
      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
      <View style={styles.submitContainer}>
        <PrimaryButton
          title="Create Offer"
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
  pricingTypes: { flexDirection: 'row', gap: theme.spacing.sm },
  pricingTypeChip: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
  },
  pricingTypeChipActive: { backgroundColor: theme.colors.primary[500] },
  pricingTypeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  pricingTypeTextActive: {
    color: theme.colors.primary[950],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  submitContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  footer: { height: theme.spacing.xl * 2 },
});
