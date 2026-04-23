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
import { RequestCard } from '../../src/components/RequestCard';
import { RequestItem, requestService } from '../../src/services/requestService';

export default function ManageRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'all' | 'open' | 'in_progress' | 'completed' | 'archived'
  >('all');

  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await requestService.getMyRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter((item) =>
    activeTab === 'all' ? true : item.status === activeTab,
  );

  const handleToggleStatus = async (requestId: string, currentStatus: string) => {
    const newStatus: 'open' | 'in_progress' | 'completed' | 'archived' =
      currentStatus === 'open'
        ? 'in_progress'
        : currentStatus === 'in_progress'
          ? 'completed'
          : currentStatus === 'completed'
            ? 'archived'
            : 'open';
    await requestService.updateRequest(requestId, { status: newStatus });
    setRequests((prev) =>
      prev.map((item) => (item.id === requestId ? { ...item, status: newStatus } : item)),
    );
  };

  const handleDelete = (requestId: string) => {
    Alert.alert('Delete Request', 'Are you sure you want to delete this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await requestService.deleteRequest(requestId);
          setRequests((prev) => prev.filter((item) => item.id !== requestId));
        },
      },
    ]);
  };

  if (loading) return <LoadingState fullScreen message="Loading your requests..." />;
  if (error && requests.length === 0) return <ErrorState message={error} onRetry={loadRequests} />;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['all', 'open', 'in_progress', 'completed', 'archived'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No requests found"
          description={
            activeTab === 'all'
              ? 'You have not created any requests yet.'
              : `No ${activeTab.replace('_', ' ')} requests.`
          }
          actionLabel="Create Request"
          onAction={() => router.push('/requests/create')}
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
              showRequester={false}
              showActions
              onEdit={() => router.push(`/requests/edit?id=${item.id}`)}
              onDelete={() => handleDelete(item.id)}
              onToggleStatus={() => handleToggleStatus(item.id, item.status || 'open')}
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
