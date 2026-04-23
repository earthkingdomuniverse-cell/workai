import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../theme';

interface RequestCardProps {
  id: string;
  title: string;
  description: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
    negotiable: boolean;
  };
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  skills?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  location?: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
  };
  deadline?: string;
  status?: 'open' | 'in_progress' | 'completed' | 'archived';
  proposalsCount?: number;
  views?: number;
  requester?: {
    displayName: string;
    avatarUrl?: string;
    trustScore: number;
  };
  onPress?: () => void;
  onRequesterPress?: () => void;
  showRequester?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  compact?: boolean;
}

export function RequestCard({
  id,
  title,
  description,
  budget,
  urgency = 'medium',
  skills,
  experienceLevel,
  location,
  deadline,
  status = 'open',
  proposalsCount,
  views,
  requester,
  onPress,
  onRequesterPress,
  showRequester = true,
  showActions = false,
  onEdit,
  onDelete,
  onToggleStatus,
  compact = false,
}: RequestCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/requests/${id}`);
    }
  };

  const formatBudget = () => {
    if (!budget) return 'Negotiable';
    const { min, max, currency } = budget;
    const symbol = currency === 'USD' ? '$' : currency;
    if (min === max) {
      return `${symbol}${min.toLocaleString()}`;
    }
    return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
  };

  const getUrgencyColor = () => {
    switch (urgency) {
      case 'urgent':
        return theme.colors.error.main;
      case 'high':
        return theme.colors.warning.main;
      case 'medium':
        return theme.colors.info.main;
      case 'low':
        return theme.colors.neutral[500];
      default:
        return theme.colors.neutral[500];
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return theme.colors.success.main;
      case 'in_progress':
        return theme.colors.info.main;
      case 'completed':
        return theme.colors.neutral[500];
      case 'archived':
        return theme.colors.neutral[600];
      default:
        return theme.colors.neutral[500];
    }
  };

  const getExperienceColor = () => {
    switch (experienceLevel) {
      case 'expert':
        return theme.colors.secondary[500];
      case 'intermediate':
        return theme.colors.primary[500];
      case 'beginner':
        return theme.colors.neutral[500];
      default:
        return theme.colors.neutral[500];
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={2}>
            {title}
          </Text>
          {status && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>{status}</Text>
            </View>
          )}
        </View>

        {/* Urgency Badge */}
        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor() + '20' }]}>
          <Text style={[styles.urgencyText, { color: getUrgencyColor() }]}>
            {urgency === 'urgent' ? '🔥 Urgent' : urgency}
          </Text>
        </View>

        <Text
          style={[styles.description, compact && styles.descriptionCompact]}
          numberOfLines={compact ? 2 : 3}
        >
          {description}
        </Text>
      </View>

      {/* Budget */}
      <View style={styles.budgetRow}>
        <Text style={styles.budget}>{formatBudget()}</Text>
        {budget?.negotiable && <Text style={styles.negotiableText}>Negotiable</Text>}
      </View>

      {/* Skills */}
      {skills && skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {skills.length > 3 && <Text style={styles.moreSkills}>+{skills.length - 3} more</Text>}
        </View>
      )}

      {/* Experience Level */}
      {experienceLevel && (
        <View style={[styles.experienceBadge, { borderColor: getExperienceColor() }]}>
          <Text style={[styles.experienceText, { color: getExperienceColor() }]}>
            {experienceLevel} level
          </Text>
        </View>
      )}

      {/* Location */}
      {location && (
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>
            {location.type === 'remote' ? '🏠' : location.type === 'hybrid' ? '🔄' : '🏢'}
          </Text>
          <Text style={styles.locationText}>
            {location.type}
            {location.city && `, ${location.city}`}
            {location.country && `, ${location.country}`}
          </Text>
        </View>
      )}

      {/* Deadline */}
      {deadline && (
        <View style={styles.deadlineRow}>
          <Text style={styles.deadlineIcon}>📅</Text>
          <Text style={styles.deadlineText}>
            Deadline: {new Date(deadline).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Requester */}
      {showRequester && requester && (
        <TouchableOpacity
          style={styles.requesterRow}
          onPress={onRequesterPress || (() => router.push('/(tabs)/profile'))}
        >
          {requester.avatarUrl ? (
            <Image source={{ uri: requester.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{requester.displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.requesterInfo}>
            <Text style={styles.requesterName}>{requester.displayName}</Text>
            <View style={styles.trustRow}>
              <Text style={styles.trustIcon}>⭐</Text>
              <Text style={styles.trustScore}>{requester.trustScore}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        {proposalsCount !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statText}>{proposalsCount} proposals</Text>
          </View>
        )}
        {views !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statText}>{views} views</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {showActions && (onEdit || onDelete || onToggleStatus) && (
        <View style={styles.actionsRow}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onToggleStatus && (
            <TouchableOpacity
              style={[styles.actionButton, status === 'open' && styles.actionButtonInactive]}
              onPress={onToggleStatus}
            >
              <Text style={styles.actionButtonText}>{status === 'open' ? 'Close' : 'Open'}</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surface.border,
  },
  cardCompact: {
    padding: theme.spacing.sm,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
  },
  titleCompact: {
    fontSize: theme.typography.fontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  urgencyText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  descriptionCompact: {
    fontSize: theme.typography.fontSize.xs,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  budget: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success.main,
  },
  negotiableText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.xs,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  skillTag: {
    backgroundColor: theme.colors.primary[900],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  skillText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[300],
  },
  moreSkills: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    alignSelf: 'center',
  },
  experienceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
  },
  experienceText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  locationIcon: {
    fontSize: theme.typography.fontSize.sm,
    marginRight: theme.spacing.xs,
  },
  locationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  deadlineIcon: {
    fontSize: theme.typography.fontSize.sm,
    marginRight: theme.spacing.xs,
  },
  deadlineText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface.border,
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[950],
  },
  requesterInfo: {
    flex: 1,
  },
  requesterName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustIcon: {
    fontSize: theme.typography.fontSize.xs,
    marginRight: theme.spacing.xs,
  },
  trustScore: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface.border,
  },
  statItem: {
    marginRight: theme.spacing.md,
  },
  statText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface.border,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary[900],
    alignItems: 'center',
  },
  actionButtonInactive: {
    backgroundColor: theme.colors.neutral[700],
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[300],
  },
  deleteText: {
    color: theme.colors.error.light,
  },
});
