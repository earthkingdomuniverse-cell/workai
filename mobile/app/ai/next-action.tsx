import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../theme';
import NextActionCard from '../../src/components/NextActionCard';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { aiService, NextAction } from '../../src/services/aiService';
import { offerService } from '../../src/services/offerService';
import { requestService } from '../../src/services/requestService';
import { dealService } from '../../src/services/dealService';
import { proposalService } from '../../src/services/proposalService';
import { useAuthStore } from '../../src/store/auth-store';

type NextActionCardItem = NextAction & {
  cta: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
};

function iconForAction(type: string) {
  switch (type) {
    case 'onboarding':
      return '🚀';
    case 'offer':
      return '💼';
    case 'request':
      return '🔎';
    case 'proposal':
      return '✉️';
    case 'deal':
      return '🤝';
    default:
      return '✨';
  }
}

function toCardItem(action: NextAction): NextActionCardItem {
  return {
    ...action,
    priority: action.priority === 'low' || action.priority === 'medium' || action.priority === 'high'
      ? action.priority
      : 'medium',
    cta: 'Continue',
    icon: iconForAction(action.type),
  };
}

export default function AiNextActionScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<NextActionCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActions = async () => {
    try {
      setError(null);

      const [offers, requests, deals, proposals] = await Promise.all([
        offerService.getOffers({}),
        requestService.getRequests({}),
        dealService.getDeals(),
        proposalService.getProposals({ limit: 5 }),
      ]);

      const result = await aiService.nextAction({
        context: {
          role: user?.role || 'member',
          onboardingCompleted: Boolean(user?.onboardingCompleted),
          offersCount: offers.length,
          requestsCount: requests.length,
          dealsCount: deals.length,
          proposalsCount: proposals.length,
          hasOffer: offers.length > 0,
          hasRequest: requests.length > 0,
          hasDeal: deals.length > 0,
          hasProposal: proposals.length > 0,
        },
      });

      setItems(result.actions.map(toCardItem));
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

  const handlePress = (action: NextActionCardItem) => {
    if (action.route) {
      router.push(action.route as any);
    }
  };

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
        items.map((item) => <NextActionCard key={item.id} action={item} onPress={handlePress} />)
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
