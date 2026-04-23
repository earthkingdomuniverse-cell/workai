import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../theme';
import NextActionCard from '../../src/components/NextActionCard';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { offerService } from '../../src/services/offerService';
import { requestService } from '../../src/services/requestService';
import { dealService } from '../../src/services/dealService';
import { trustService } from '../../src/services/trustService';

interface NextAction {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  cta: string;
  route: string;
  icon: string;
}

export default function AiNextActionScreen() {
  const [items, setItems] = useState<NextAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActions = async () => {
    try {
      setError(null);
      const actions: NextAction[] = [];

      // Fetch user data to generate personalized actions
      try {
        const trust = await trustService.getMyTrustProfile();

        // Add action based on verification level
        if (trust.verificationLevel === 'unverified') {
          actions.push({
            id: '1',
            type: 'verify_identity',
            title: 'Verify Your Identity',
            description: 'Increase trust score by verifying your identity',
            priority: 'high',
            cta: 'Verify',
            route: '/(tabs)/profile',
            icon: '🆔',
          });
        }

        // Add action based on deals
        const deals = await dealService.getDeals();
        const hasPendingDeals = deals.some((d: any) => d.status === 'in_progress');
        if (hasPendingDeals) {
          actions.push({
            id: '2',
            type: 'complete_deal',
            title: 'Complete Your Deal',
            description: 'You have deals in progress',
            priority: 'medium',
            cta: 'View Deals',
            route: '/(tabs)/deals',
            icon: '💼',
          });
        }
      } catch (e) {
        // Trust not available, use defaults
      }

      // Add default actions
      const offers = await offerService.getOffers({});
      const requests = await requestService.getRequests({});

      if (offers.length === 0) {
        actions.push({
          id: '3',
          type: 'create_first_offer',
          title: 'Create Your First Offer',
          description: 'Showcase your skills to potential clients',
          priority: 'medium',
          cta: 'Create Offer',
          route: '/offers/create',
          icon: '💼',
        });
      }

      if (requests.length > 0) {
        actions.push({
          id: '4',
          type: 'send_proposal',
          title: 'Send a Proposal',
          description: 'Browse requests that match your skills',
          priority: 'medium',
          cta: 'Browse Requests',
          route: '/(tabs)/requests',
          icon: '✉️',
        });
      }

      setItems(actions);
    } catch (_err) {
      setError('Failed to load next actions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading next actions...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return <ErrorState message={error} onRetry={loadActions} />;
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
            loadActions();
          }}
        />
      }
    >
      <Text style={styles.title}>AI Next Action</Text>
      <Text style={styles.subtitle}>
        Recommended actions based on your current marketplace state.
      </Text>

      {items.length === 0 ? (
        <EmptyState title="No actions right now" description="You are all caught up." icon="✅" />
      ) : (
        items.map((item) => <NextActionCard key={item.id} action={item} onPress={() => {}} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: { ...typography.body, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
});
