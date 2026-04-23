import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../theme';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import TransactionCard from '../../src/components/TransactionCard';
import { paymentService, Transaction } from '../../src/services/paymentService';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async () => {
    try {
      setError(null);
      const data = await paymentService.getTransactions();
      setTransactions(data);
    } catch (_error) {
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }
  if (error && transactions.length === 0) {
    return <ErrorState message={error} onRetry={loadTransactions} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTransactions(); }} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <TransactionCard transaction={item} onPress={() => router.push(`/transactions/${item.id}`)} />}
        ListEmptyComponent={<EmptyState title="No transactions" description="Your payment activity will appear here." icon="💳" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  title: { ...typography.h1, color: colors.text, padding: spacing.lg },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
});
