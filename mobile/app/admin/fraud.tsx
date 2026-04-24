import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import FraudSignalCard from '../../src/components/FraudSignalCard';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { adminService } from '../../src/services/adminService';

export default function AdminFraudScreen() {
  const { isOperator } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFraud = async () => {
    try {
      setError(null);
      const response = await adminService.getFraudSignals();
      setItems(response.items || []);
    } catch (_error) {
      setError('Failed to load fraud signals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFraud();
  }, []);

  if (!isOperator) {
    return <AccessDeniedState message="Only operator and admin roles can access fraud." />;
  }
  if (loading) return <LoadingState fullScreen message="Loading fraud signals..." />;
  if (error && items.length === 0) return <ErrorState message={error} onRetry={loadFraud} />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadFraud();
          }}
        />
      }
    >
      <Text style={styles.title}>Fraud Detection</Text>
      <Text style={styles.subtitle}>Fraud signals from backend admin API.</Text>
      {items.length === 0 ? (
        <EmptyState title="No fraud signals" description="No suspicious activity is active right now." icon="🧪" />
      ) : (
        items.map((item) => <FraudSignalCard key={item.id || `${item.userId}-${item.type}`} signal={item} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl * 2 },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.lg,
  },
});
