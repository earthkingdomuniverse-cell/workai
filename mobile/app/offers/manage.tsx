import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { OfferCard } from '../../src/components/OfferCard';
import { Offer, offerService } from '../../src/services/offerService';

export default function ManageOffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'all' | 'active' | 'inactive' | 'archived' | 'completed'
  >('all');

  const loadOffers = useCallback(async () => {
    try {
      setError(null);
      const data = await offerService.getMyOffers();
      setOffers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const filteredOffers = offers.filter((offer) =>
    activeTab === 'all' ? true : offer.status === activeTab,
  );

  const handleToggleStatus = async (offerId: string, currentStatus: string) => {
    const newStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
    await offerService.updateOffer(offerId, { status: newStatus });
    setOffers((prev) =>
      prev.map((offer) => (offer.id === offerId ? { ...offer, status: newStatus } : offer)),
    );
  };

  const handleDelete = (offerId: string) => {
    Alert.alert('Delete Offer', 'Are you sure you want to delete this offer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await offerService.deleteOffer(offerId);
          setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
        },
      },
    ]);
  };

  if (loading) return <LoadingState fullScreen message="Loading your offers..." />;
  if (error && offers.length === 0) return <ErrorState message={error} onRetry={loadOffers} />;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['all', 'active', 'inactive', 'archived', 'completed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOffers.length === 0 ? (
        <EmptyState
          title="No offers found"
          description={
            activeTab === 'all' ? 'You have not created any offers yet.' : `No ${activeTab} offers.`
          }
          actionLabel="Create Offer"
          onAction={() => router.push('/offers/create')}
        />
      ) : (
        <FlatList
          data={filteredOffers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OfferCard
              id={item.id}
              title={item.title}
              description={item.description}
              price={item.price}
              currency={item.currency}
              pricingType={item.pricingType}
              status={item.status}
              skills={item.skills}
              deliveryDays={item.deliveryTime}
              views={item.views}
              likes={item.likes}
              proposalsCount={item.proposalsCount}
              showProvider={false}
              showActions
              onEdit={() => router.push(`/offers/edit?id=${item.id}`)}
              onDelete={() => handleDelete(item.id)}
              onToggleStatus={() => handleToggleStatus(item.id, item.status || 'active')}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadOffers();
              }}
              tintColor={theme.colors.primary[500]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity style={styles.createButton} onPress={() => router.push('/offers/create')}>
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl * 2,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: theme.colors.primary[500] },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tabTextActive: {
    color: theme.colors.primary[400],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  listContent: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl * 3 },
  createButton: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[950],
  },
});
