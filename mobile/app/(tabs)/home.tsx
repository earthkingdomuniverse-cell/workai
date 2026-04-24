import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme';
import RecommendationCard from '../../src/components/RecommendationCard';
import { offerService, Offer } from '../../src/services/offerService';
import { requestService } from '../../src/services/requestService';
import { aiService, NextAction } from '../../src/services/aiService';
import { useAuthStore } from '../../src/store/auth-store';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [offers, requests] = await Promise.all([
        offerService.getOffers({}),
        requestService.getRequests({}),
      ]);

      const nextActionResult = await aiService.nextAction({
        context: {
          role: user?.role || 'member',
          onboardingCompleted: Boolean(user?.onboardingCompleted),
          offersCount: offers.length,
          requestsCount: requests.length,
          hasOffer: offers.length > 0,
          hasRequest: requests.length > 0,
        },
      });

      setNextAction(nextActionResult.actions[0] || null);

      const offerRecs = offers.slice(0, 3).map((offer: Offer) => ({
        id: `rec_offer_${offer.id}`,
        type: 'offer',
        entityId: offer.id,
        title: offer.title,
        description: offer.description,
        reason: 'recent',
        reasonText: 'Recently posted',
        score: 90,
        relevance: 0.9,
        metadata: {
          price: offer.price,
          currency: offer.currency || 'USD',
          deliveryTime: offer.deliveryTime,
          provider: offer.provider,
          skills: offer.skills,
        },
        createdAt: new Date().toISOString(),
      }));

      const requestRecs = requests.slice(0, 2).map((req: any) => ({
        id: `rec_req_${req.id}`,
        type: 'request',
        entityId: req.id,
        title: req.title,
        description: req.description,
        reason: 'recent',
        reasonText: 'Recently posted',
        score: 85,
        relevance: 0.85,
        metadata: {
          budget: req.budget,
          skills: req.skills,
          requester: req.requester,
        },
        createdAt: new Date().toISOString(),
      }));

      setRecommendations([...offerRecs, ...requestRecs]);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationPress = (recommendation: any) => {
    if (recommendation.type === 'offer') {
      router.push(`/offers/${recommendation.entityId}`);
    } else if (recommendation.type === 'request') {
      router.push(`/requests/${recommendation.entityId}`);
    }
  };

  const handleNextActionPress = () => {
    if (nextAction?.route) {
      router.push(nextAction.route as any);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Recommended for You</Text>
        <Text style={styles.subtitle}>AI-guided actions and marketplace matches.</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {nextAction ? (
            <TouchableOpacity style={styles.nextActionCard} onPress={handleNextActionPress}>
              <Text style={styles.nextActionEyebrow}>Next best action</Text>
              <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
              <Text style={styles.nextActionDescription}>{nextAction.description}</Text>
              <Text style={styles.nextActionCta}>Continue →</Text>
            </TouchableOpacity>
          ) : null}

          {recommendations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No recommendations yet</Text>
              <Text style={styles.emptyText}>Create an offer or request so WorkAI can generate better matches.</Text>
            </View>
          ) : (
            recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onPress={handleRecommendationPress}
              />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  nextActionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  nextActionEyebrow: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  nextActionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  nextActionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  nextActionCta: {
    ...typography.body,
    color: colors.primary,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
