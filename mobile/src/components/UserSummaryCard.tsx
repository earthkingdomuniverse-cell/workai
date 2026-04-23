import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../theme';

interface UserSummaryCardProps {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  role: string;
  trustScore: number;
  trustLevel: string;
  completedDeals: number;
  totalReviews: number;
  averageRating: number;
  verifiedCount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function UserSummaryCard({
  displayName = 'User',
  bio,
  avatarUrl,
  role,
  trustScore,
  trustLevel,
  completedDeals,
  totalReviews,
  averageRating,
  verifiedCount,
  size = 'md',
}: UserSummaryCardProps) {
  const isLarge = size === 'lg';

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      {/* Avatar */}
      <View style={[styles.avatarContainer, isLarge && styles.avatarContainerLarge]}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[styles.avatar, isLarge && styles.avatarLarge]}
          />
        ) : (
          <View style={[styles.avatarPlaceholder, isLarge && styles.avatarPlaceholderLarge]}>
            <Text style={[styles.avatarText, isLarge && styles.avatarTextLarge]}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.displayName, isLarge && styles.displayNameLarge]}>{displayName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{role}</Text>
        </View>
        {bio && (
          <Text style={[styles.bio, isLarge && styles.bioLarge]} numberOfLines={2}>
            {bio}
          </Text>
        )}
      </View>

      {/* Stats Row */}
      <View style={[styles.statsRow, isLarge && styles.statsRowLarge]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, isLarge && styles.statValueLarge]}>{trustScore}</Text>
          <Text style={styles.statLabel}>Trust</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, isLarge && styles.statValueLarge]}>{completedDeals}</Text>
          <Text style={styles.statLabel}>Deals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, isLarge && styles.statValueLarge]}>{averageRating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, isLarge && styles.statValueLarge]}>{verifiedCount}</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
      </View>

      {/* Trust Level Badge */}
      <View
        style={[
          styles.trustBadge,
          getTrustLevelStyle(trustLevel),
          isLarge && styles.trustBadgeLarge,
        ]}
      >
        <Text style={[styles.trustBadgeText, getTrustLevelTextStyle(trustLevel)]}>
          {trustLevel} Level
        </Text>
      </View>
    </View>
  );
}

function getTrustLevelStyle(level: string) {
  const styles: any = {
    bronze: { backgroundColor: '#cd7f32', borderColor: '#cd7f32' },
    silver: { backgroundColor: '#c0c0c0', borderColor: '#c0c0c0' },
    gold: { backgroundColor: '#ffd700', borderColor: '#ffd700' },
    platinum: { backgroundColor: '#e5e4e2', borderColor: '#e5e4e2' },
    diamond: { backgroundColor: '#b9f2ff', borderColor: '#b9f2ff' },
  };
  return styles[level.toLowerCase()] || styles.bronze;
}

function getTrustLevelTextStyle(level: string) {
  const colors: any = {
    bronze: { color: '#ffffff' },
    silver: { color: '#000000' },
    gold: { color: '#000000' },
    platinum: { color: '#000000' },
    diamond: { color: '#000000' },
  };
  return colors[level.toLowerCase()] || colors.bronze;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface.border,
  },
  containerLarge: {
    padding: theme.spacing.xl,
  },
  avatarContainer: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  avatarContainerLarge: {
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[950],
  },
  avatarTextLarge: {
    fontSize: theme.typography.fontSize['2xl'],
  },
  info: {
    marginBottom: theme.spacing.md,
  },
  displayName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  displayNameLarge: {
    fontSize: theme.typography.fontSize['2xl'],
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary[900],
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.sm,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[300],
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  bio: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  bioLarge: {
    fontSize: theme.typography.fontSize.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  statsRowLarge: {
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[400],
  },
  statValueLarge: {
    fontSize: theme.typography.fontSize.xl,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  trustBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 2,
  },
  trustBadgeLarge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  trustBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
