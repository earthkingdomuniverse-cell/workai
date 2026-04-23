import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography } from '../../theme';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import TimelineItem from '../../src/components/TimelineItem';
import { dealService } from '../../src/services/dealService';

export default function DealTimelineScreen() {
  const { timeline, dealId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>(timeline ? JSON.parse(timeline as string) : []);

  useEffect(() => {
    const loadTimeline = async () => {
      if (!dealId || timelineData.length > 0) return;
      try {
        setLoading(true);
        setError(null);
        const deal = await dealService.getDeal(dealId as string);
        setTimelineData(deal.timeline || []);
      } catch (_error) {
        setError('Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };
    loadTimeline();
  }, [dealId, timelineData.length]);

  if (loading) return <LoadingState fullScreen message="Loading timeline..." />;
  if (error && timelineData.length === 0) return <ErrorState message={error} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deal Timeline</Text>
        {dealId ? <Text style={styles.subtitle}>Deal ID: {dealId as string}</Text> : null}
        <Text style={styles.subtitle}>History of all events and activities</Text>
      </View>

      <View style={styles.timelineContainer}>
        {timelineData.length > 0 ? (
          timelineData.map((event: any, index: number) => <TimelineItem key={event.id || index} event={event} />)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No timeline events found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, backgroundColor: colors.card, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary },
  timelineContainer: { padding: spacing.lg },
  emptyState: { alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, color: colors.textSecondary },
});
