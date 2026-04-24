import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { adminService } from '../../src/services/adminService';

export default function AdminDisputesScreen() {
  const { isOperator } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [resolution, setResolution] = useState('Resolved by operator review.');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadDisputes = async () => {
    try {
      setError(null);
      const response = await adminService.getDisputes();
      setItems(response.items || []);
    } catch (_error) {
      setError('Failed to load disputes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolve = async (id: string) => {
    if (!resolution.trim()) {
      Alert.alert('Resolution required', 'Enter a resolution note before resolving a dispute.');
      return;
    }

    try {
      setProcessingId(id);
      await adminService.resolveDispute(id, resolution.trim());
      await loadDisputes();
    } catch (_error) {
      Alert.alert('Resolve failed', 'Could not resolve this dispute.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOperator) {
    return <AccessDeniedState message="Only operator and admin roles can access disputes." />;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading disputes...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return <ErrorState message={error} onRetry={loadDisputes} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDisputes();
          }}
        />
      }
    >
      <Text style={styles.title}>Disputes</Text>
      <Text style={styles.subtitle}>Review and resolve marketplace disputes.</Text>

      <View style={styles.resolutionBox}>
        <Text style={styles.label}>Default resolution note</Text>
        <TextInput
          style={styles.input}
          value={resolution}
          onChangeText={setResolution}
          multiline
          placeholder="Resolution note"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {items.length === 0 ? (
        <EmptyState title="No disputes" description="There are no disputes requiring review." icon="✅" />
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.reason || 'Dispute'}</Text>
              <Text style={styles.status}>{item.status || 'open'}</Text>
            </View>
            <Text style={styles.body}>{item.description || 'No description provided.'}</Text>
            <Text style={styles.meta}>Deal: {item.dealId || 'unknown'}</Text>
            <Text style={styles.meta}>Reporter: {item.reporterId || 'unknown'}</Text>
            <Text style={styles.meta}>Reported: {item.reportedUserId || 'unknown'}</Text>

            {item.status !== 'resolved' ? (
              <TouchableOpacity
                style={styles.button}
                disabled={processingId === item.id}
                onPress={() => handleResolve(item.id)}
              >
                <Text style={styles.buttonText}>{processingId === item.id ? 'Resolving...' : 'Resolve'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loading: { ...typography.body, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  resolutionBox: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  input: {
    minHeight: 80,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.text, flex: 1 },
  status: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  body: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  meta: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  buttonText: { ...typography.body, color: colors.white, fontWeight: '700' },
});
