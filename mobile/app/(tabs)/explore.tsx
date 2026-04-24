import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import RecommendationCard from '../../src/components/RecommendationCard';
import { offerService, Offer } from '../../src/services/offerService';
import { requestService } from '../../src/services/requestService';

export default function ExploreScreen() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      // Use existing services - no new backend needed!
      const [offers, requests] = await Promise.all([
        offerService.getOffers({}),
        requestService.getRequests({}),
      ]);

      // Transform offers to recommendations
      const offerRecs = offers.map((offer: Offer) => ({
        id: `rec_offer_${offer.id}`,
        type: 'offer',
        entityId: offer.id,
        title: offer.title,
        description: offer.description,
        reason: 'trending',
        reasonText: offer.status === 'active' ? 'Active offer' : 'Available',
        score: 85,
        relevance: 0.85,
        metadata: {
          price: offer.price,
          currency: offer.currency || 'USD',
          deliveryTime: offer.deliveryTime,
          provider: offer.provider,
          skills: offer.skills,
        },
        createdAt: new Date().toISOString(),
      }));

      // Transform requests to recommendations
      const requestRecs = requests.map((req: any) => ({
        id: `rec_req_${req.id}`,
        type: 'request',
        entityId: req.id,
        title: req.title,
        description: req.description,
        reason: 'popular',
        reasonText: req.status === 'open' ? 'Open request' : 'Available',
        score: 80,
        relevance: 0.8,
        metadata: {
          budget: req.budget,
          skills: req.skills,
          requester: req.requester,
        },
        createdAt: new Date().toISOString(),
      }));

      setRecommendations([...offerRecs, ...requestRecs]);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Recommendations</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
});
