import React, { useState, useEffect } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography } from '../../theme';
import ReceiptCard from '../../src/components/ReceiptCard';
import { paymentService, Receipt } from '../../src/services/paymentService';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';

export default function DealReceiptsScreen() {
  const { dealId } = useLocalSearchParams();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReceipts = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await paymentService.getDealReceipts(dealId as string);
      setReceipts(data);
    } catch (_err) {
      setError('Failed to load receipts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (dealId) {
      fetchReceipts();
    }
  }, [dealId]);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReceipts(); }} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Receipts</Text>
        <Text style={styles.dealId}>For Deal: {dealId as string}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReceipts} />
      ) : receipts.length === 0 ? (
        <EmptyState title="No receipts found" description="This deal does not have any receipts yet." icon="🧾" />
      ) : (
        receipts.map((receipt) => <ReceiptCard key={receipt.id} receipt={receipt} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  dealId: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});
