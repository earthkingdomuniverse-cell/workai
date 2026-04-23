import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../theme';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { offerService } from '../../src/services/offerService';

export default function OffersEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deliveryTime: '',
    skills: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Offer id is missing');
        setLoading(false);
        return;
      }
      try {
        const offer = await offerService.getOffer(id);
        setFormData({
          title: offer.title,
          description: offer.description,
          price: String(offer.price),
          deliveryTime: offer.deliveryTime ? String(offer.deliveryTime) : '',
          skills: (offer.skills || []).join(', '),
        });
      } catch (_error) {
        setError('Failed to load offer for editing');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    if (formData.title.trim().length < 5) {
      setSubmitError('Title must be at least 5 characters');
      return;
    }
    if (formData.description.trim().length < 20) {
      setSubmitError('Description must be at least 20 characters');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setSubmitError('Price must be positive');
      return;
    }

    setSaving(true);
    setSubmitError(null);
    try {
      await offerService.updateOffer(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        deliveryTime: formData.deliveryTime ? Number(formData.deliveryTime) : undefined,
        skills: formData.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      Alert.alert('Success', 'Offer updated successfully', [
        { text: 'OK', onPress: () => router.replace('/offers/manage') },
      ]);
    } catch (_error) {
      setSubmitError('Failed to update offer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState fullScreen message="Loading offer..." />;
  if (error)
    return <ErrorState message={error} onRetry={() => router.replace(`/offers/edit?id=${id}`)} />;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Edit Offer</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(title) => setFormData({ ...formData, title })}
          placeholder="Offer title"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(description) => setFormData({ ...formData, description })}
          multiline
          placeholder="Offer description"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(price) => setFormData({ ...formData, price })}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Delivery Time</Text>
        <TextInput
          style={styles.input}
          value={formData.deliveryTime}
          onChangeText={(deliveryTime) => setFormData({ ...formData, deliveryTime })}
          keyboardType="numeric"
          placeholder="Days"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Skills</Text>
        <TextInput
          style={styles.input}
          value={formData.skills}
          onChangeText={(skills) => setFormData({ ...formData, skills })}
          placeholder="Comma separated"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      </View>
      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
      <View style={styles.actions}>
        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
        />
      </View>
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
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  submitError: {
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error.light,
    marginBottom: theme.spacing.md,
  },
  actions: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl * 2 },
});
