import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
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

export default function OffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPricingType, setSelectedPricingType] = useState<
    'all' | 'fixed' | 'hourly' | 'negotiable'
  >('all');

  const loadOffers = useCallback(async () => {
    try {
      setError(null);
      const data = await offerService.getOffers({
        q: searchQuery,
        pricingType: selectedPricingType,
      });
      setOffers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedPricingType]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const filteredOffers = useMemo(() => {
    let result = offers;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (offer) =>
          offer.title.toLowerCase().includes(q) || offer.description.toLowerCase().includes(q),
      );
    }
    if (selectedPricingType !== 'all') {
      result = result.filter((offer) => offer.pricingType === selectedPricingType);
    }
    return result;
  }, [offers, searchQuery, selectedPricingType]);

  if (loading) {
    return <LoadingState fullScreen message="Loading offers..." />;
  }

  if (error && offers.length === 0) {
    return <ErrorState message={error} onRetry={loadOffers} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search offers..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        {(['all', 'fixed', 'hourly', 'negotiable'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, selectedPricingType === type && styles.filterChipActive]}
            onPress={() => setSelectedPricingType(type)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedPricingType === type && styles.filterChipTextActive,
              ]}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOffers.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No offers found' : 'No offers yet'}
          description={
            searchQuery
              ? 'Try adjusting your search or filters.'
              : 'Create your first offer to get started.'
          }
          actionLabel={searchQuery ? undefined : 'Create Offer'}
          onAction={searchQuery ? undefined : () => router.push('/offers/create')}
        />
      ) : (
        <FlatList
          data={filteredOffers}
          keyExtractor={(item) => item.id}
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
              provider={item.provider}
              onPress={() => router.push(`/offers/${item.id}`)}
            />
          )}
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
  searchContainer: { padding: theme.spacing.lg, paddingTop: theme.spacing.xl * 2 },
  searchInput: {
    backgroundColor: theme.colors.surface.input,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.secondary,
    marginLeft: theme.spacing.sm,
  },
  filterChipActive: { backgroundColor: theme.colors.primary[500] },
  filterChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: theme.colors.primary[950],
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
