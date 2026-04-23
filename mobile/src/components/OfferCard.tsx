import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../theme';

interface OfferCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  pricingType: 'fixed' | 'hourly' | 'negotiable';
  provider?: {
    displayName: string;
    avatarUrl?: string;
    trustScore: number;
  };
  skills?: string[];
  deliveryDays?: number;
  status?: 'active' | 'inactive' | 'archived' | 'completed';
  views?: number;
  likes?: number;
  proposalsCount?: number;
  onPress?: () => void;
  onProviderPress?: () => void;
  showProvider?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  compact?: boolean;
}

export function OfferCard({
  id,
  title,
  description,
  price,
  currency,
  pricingType,
  provider,
  skills,
  deliveryDays,
  status = 'active',
  views,
  likes,
  proposalsCount,
  onPress,
  onProviderPress,
  showProvider = true,
  showActions = false,
  onEdit,
  onDelete,
  onToggleStatus,
  compact = false,
}: OfferCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/offers/${id}`);
    }
  };

  const formatPrice = () => {
    const formatted = price.toLocaleString();
    if (pricingType === 'hourly') {
      return `$${formatted}/hr`;
    }
    return `$${formatted}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return theme.colors.success.main;
      case 'inactive':
        return theme.colors.neutral[500];
      case 'archived':
        return theme.colors.neutral[600];
      case 'completed':
        return theme.colors.primary[500];
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

        <Text
          style={[styles.description, compact && styles.descriptionCompact]}
          numberOfLines={compact ? 2 : 3}
        >
          {description}
        </Text>
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatPrice()}</Text>
        {pricingType !== 'fixed' && <Text style={styles.pricingType}>{pricingType}</Text>}
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

      {/* Provider */}
      {showProvider && provider && (
        <TouchableOpacity
          style={styles.providerRow}
          onPress={onProviderPress || (() => router.push('/(tabs)/profile'))}
        >
          {provider.avatarUrl ? (
            <Image source={{ uri: provider.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{provider.displayName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider.displayName}</Text>
            <View style={styles.trustRow}>
              <Text style={styles.trustIcon}>⭐</Text>
              <Text style={styles.trustScore}>{provider.trustScore}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        {deliveryDays && (
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statText}>{deliveryDays}d</Text>
          </View>
        )}
        {views !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👁️</Text>
            <Text style={styles.statText}>{views}</Text>
          </View>
        )}
        {likes !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statText}>{likes}</Text>
          </View>
        )}
        {proposalsCount !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📝</Text>
            <Text style={styles.statText}>{proposalsCount}</Text>
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
              style={[styles.actionButton, status === 'active' && styles.actionButtonInactive]}
              onPress={onToggleStatus}
            >
              <Text style={styles.actionButtonText}>
                {status === 'active' ? 'Deactivate' : 'Activate'}
              </Text>
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
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  descriptionCompact: {
    fontSize: theme.typography.fontSize.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[400],
  },
  pricingType: {
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
  providerRow: {
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
  providerInfo: {
    flex: 1,
  },
  providerName: {
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
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  statIcon: {
    fontSize: theme.typography.fontSize.xs,
    marginRight: theme.spacing.xs,
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
