import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography } from '../../theme';
import { ErrorState } from '../../components/ErrorState';
import { paymentService, Transaction } from '../../src/services/paymentService';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const data = await paymentService.getTransaction(id);
        setTransaction(data);
      } catch (_error) {
        setError('Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!transaction) return <ErrorState message={error || 'Transaction not found'} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Detail</Text>
      <Text style={styles.row}>ID: {transaction.id}</Text>
      <Text style={styles.row}>Type: {transaction.type}</Text>
      <Text style={styles.row}>Status: {transaction.status}</Text>
      <Text style={styles.row}>Amount: {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}</Text>
      <Text style={styles.row}>Reference: {transaction.referenceNumber}</Text>
      <Text style={styles.row}>Created: {new Date(transaction.createdAt).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  row: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
});
