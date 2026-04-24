import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../theme';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { SkillTagList } from '../../src/components/SkillTagList';
import { requestService } from '../../src/services/requestService';
import { trustService, TrustProfile } from '../../src/services/trustService';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [requesterTrust, setRequesterTrust] = useState<TrustProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await requestService.getRequest(id as string);

        // Fetch requester trust profile from trust API for accurate data
        let trust: TrustProfile | null = null;
        if (data.requesterId) {
          try {
            trust = await trustService.getTrustProfile(data.requesterId);
          } catch (e) {
            // Trust not found, will use fallback from request data
          }
        }
        setRequesterTrust(trust);
        setRequest({
          ...data,
          requester: data.requester
            ? {
                ...data.requester,
                trustScore: trust?.trustScore ?? data.requester.trustScore,
                completedDeals: trust?.completedDeals ?? data.requester.completedDeals,
              }
            : data.requester,
        });
      } catch (_err) {
        setError('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };
    loadRequest();
  }, [id]);

  if (loading) return <LoadingState fullScreen message="Loading request..." />;
  if (error || !request) return <ErrorState message={error || 'Request not found'} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{request.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.urgencyBadge, { backgroundColor: theme.colors.error.main + '20' }]}>
            <Text style={[styles.urgencyText, { color: theme.colors.error.main }]}>
              🔥 {request.urgency || 'medium'}
            </Text>
          </View>
          {request.status ? (
            <View
              style={[styles.statusBadge, { backgroundColor: theme.colors.success.main + '20' }]}
            >
              <Text style={[styles.statusText, { color: theme.colors.success.main }]}>
                {request.status}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Budget</Text>
        <Text style={styles.budget}>
          ${request.budget?.min?.toLocaleString()} - ${request.budget?.max?.toLocaleString()}{' '}
          {request.budget?.currency}
        </Text>
        {request.budget?.negotiable ? (
          <Text style={styles.negotiableText}>💰 Negotiable</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{request.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Skills Needed</Text>
        {request.skills && request.skills.length > 0 ? (
          <SkillTagList skills={request.skills.map((s: string) => ({ id: s, name: s }))} />
        ) : (
          <Text style={styles.emptyText}>No specific skills listed</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Experience Level</Text>
        <Text style={styles.requirementText}>{request.experienceLevel || 'Not specified'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Location</Text>
        <Text style={styles.requirementText}>{request.location?.type || 'Not specified'}</Text>
      </View>

      {request.deadline ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Deadline</Text>
          <Text style={styles.requirementText}>
            📅 {new Date(request.deadline).toLocaleDateString()}
          </Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{request.proposalsCount || 0}</Text>
            <Text style={styles.statLabel}>Proposals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{request.views || 0}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>
      </View>

      {request.requester ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Posted by</Text>
          <View style={styles.requesterRow}>
            {request.requester.avatarUrl ? (
              <Image source={{ uri: request.requester.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {request.requester.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.requesterInfo}>
              <Text style={styles.requesterName}>{request.requester.displayName}</Text>
              <View style={styles.trustRow}>
                <Text style={styles.trustIcon}>⭐</Text>
                <Text style={styles.trustScore}>{request.requester.trustScore}</Text>
                <Text style={styles.trustDetails}>
                  {' '}
                  • {request.requester.completedDeals || 0} deals
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() =>
            router.push(
              `/ai/match?title=${encodeURIComponent(request.title)}&skills=${encodeURIComponent((request.skills || []).join(','))}` as any,
            )
          }
        >
          <Text style={styles.aiButtonText}>🤖 AI Match</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push(`/proposals/create?requestId=${id}`)}
        >
          <Text style={styles.primaryButtonText}>Create Proposal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push(`/deals/create?requestId=${id}` as any)}
        >
          <Text style={styles.secondaryButtonText}>Create Deal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: { padding: theme.spacing.lg, paddingTop: theme.spacing.xl * 2 },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  badgeRow: { flexDirection: 'row', gap: theme.spacing.sm },
  urgencyBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  urgencyText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  section: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface.border,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  budget: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success.main,
  },
  negotiableText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  requirementText: { fontSize: theme.typography.fontSize.md, color: theme.colors.text.primary },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  statsRow: { flexDirection: 'row', gap: theme.spacing.lg },
  statItem: { flex: 1 },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[400],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  requesterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[950],
  },
  requesterInfo: { flex: 1 },
  requesterName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  trustRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs },
  trustIcon: { fontSize: theme.typography.fontSize.sm, marginRight: theme.spacing.xs },
  trustScore: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[400],
  },
  trustDetails: { fontSize: theme.typography.fontSize.sm, color: theme.colors.text.tertiary },
  actionsContainer: { padding: theme.spacing.lg, gap: theme.spacing.md },
  aiButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.secondary[900],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.secondary[700],
  },
  aiButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary[300],
  },
  primaryButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[950],
  },
  secondaryButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: 'transparent',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[400],
  },
  footer: { height: theme.spacing.xl * 2 },
});
