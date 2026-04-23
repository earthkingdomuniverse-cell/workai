import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import FraudSignalCard from '../../src/components/FraudSignalCard';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { dealService } from '../../src/services/dealService';

export default function AdminFraudScreen() {
  const { isOperator } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFraud = async () => {
    try {
      setError(null);

      // Analyze deals for potential fraud patterns
      const deals = await dealService.getDeals();

      // Mock fraud detection scenarios
      // In production, this would use ML/AI to detect patterns
      const fraudScenarios = [
        {
          id: 'fraud_1',
          userId: 'user_xxx',
          type: 'unusual_activity',
          description: 'Rapid account creation from new device',
          confidence: 75,
          evidence: ['Multiple signups', 'Same IP range'],
          status: 'monitoring',
          createdAt: '2026-04-21T10:00:00Z',
        },
        {
          id: 'fraud_2',
          userId: 'user_yyy',
          type: 'payment_anomaly',
          description: 'Unusual payment pattern detected',
          confidence: 88,
          evidence: ['High frequency', 'Multiple cards'],
          status: 'under_review',
          createdAt: '2026-04-20T10:00:00Z',
        },
      ];

      setItems(fraudScenarios);
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

  if (!isOperator)
    return <AccessDeniedState message="Only operator and admin roles can access fraud." />;
  if (loading) return <LoadingState fullScreen message="Loading fraud signals..." />;
  if (error && items.length === 0) return <ErrorState message={error} onRetry={loadFraud} />;
  if (items.length === 0)
    return (
      <EmptyState
        title="No fraud signals"
        description="No suspicious activity is active right now."
        icon="🧪"
      />
    );

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
      {items.map((item) => (
        <FraudSignalCard key={item.id} signal={item} />
      ))}
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
    marginBottom: theme.spacing.lg,
  },
});
