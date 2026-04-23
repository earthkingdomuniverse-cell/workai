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
import { RequestCard } from '../../src/components/RequestCard';
import { RequestItem, requestService } from '../../src/services/requestService';

export default function RequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<
    'all' | 'urgent' | 'high' | 'medium' | 'low'
  >('all');
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'remote' | 'onsite' | 'hybrid'>(
    'all',
  );

  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await requestService.getRequests({
        q: searchQuery,
        urgency: selectedUrgency,
        location: selectedLocation,
      });
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedUrgency, selectedLocation]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    let result = requests;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (req) => req.title.toLowerCase().includes(q) || req.description.toLowerCase().includes(q),
      );
    }
    if (selectedUrgency !== 'all') result = result.filter((req) => req.urgency === selectedUrgency);
    if (selectedLocation !== 'all')
      result = result.filter((req) => req.location?.type === selectedLocation);
    return result;
  }, [requests, searchQuery, selectedUrgency, selectedLocation]);

  if (loading) return <LoadingState fullScreen message="Loading requests..." />;
  if (error && requests.length === 0) return <ErrorState message={error} onRetry={loadRequests} />;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search requests..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        {(['all', 'urgent', 'high'] as const).map((urgency) => (
          <TouchableOpacity
            key={urgency}
            style={[styles.filterChip, selectedUrgency === urgency && styles.filterChipActive]}
            onPress={() => setSelectedUrgency(urgency)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedUrgency === urgency && styles.filterChipTextActive,
              ]}
            >
              {urgency === 'all' ? 'All' : urgency === 'urgent' ? '🔥 Urgent' : 'High'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.locationFilters}>
        {(['all', 'remote', 'onsite', 'hybrid'] as const).map((loc) => (
          <TouchableOpacity
            key={loc}
            style={[styles.locationChip, selectedLocation === loc && styles.locationChipActive]}
            onPress={() => setSelectedLocation(loc)}
          >
            <Text
              style={[
                styles.locationChipText,
                selectedLocation === loc && styles.locationChipTextActive,
              ]}
            >
              {loc === 'all' ? 'All Locations' : loc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No requests found' : 'No requests yet'}
          description={
            searchQuery
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a request'
          }
          actionLabel={searchQuery ? undefined : 'Create Request'}
          onAction={searchQuery ? undefined : () => router.push('/requests/create')}
        />
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RequestCard
              id={item.id}
              title={item.title}
              description={item.description}
              budget={item.budget}
              urgency={item.urgency || 'medium'}
              skills={item.skills}
              experienceLevel={item.experienceLevel}
              location={item.location}
              deadline={item.deadline}
              status={item.status}
              proposalsCount={item.proposalsCount}
              views={item.views}
              requester={item.requester}
              onPress={() => router.push(`/requests/${item.id}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadRequests();
              }}
              tintColor={theme.colors.primary[500]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity style={styles.createButton} onPress={() => router.push('/requests/create')}>
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
    marginBottom: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background.secondary,
    marginLeft: theme.spacing.sm,
  },
  filterChipActive: { backgroundColor: theme.colors.error.main },
  filterChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: theme.colors.error.light,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  locationFilters: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  locationChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.secondary,
    marginLeft: theme.spacing.sm,
  },
  locationChipActive: {
    backgroundColor: theme.colors.primary[900],
    borderColor: theme.colors.primary[500],
    borderWidth: 1,
  },
  locationChipText: { fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary },
  locationChipTextActive: {
    color: theme.colors.primary[300],
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
