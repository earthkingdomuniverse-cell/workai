import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';

export default function SettingsScreen() {
  const router = useRouter();

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { label: 'Account Settings', route: '/settings/account', icon: '👤' },
        { label: 'Notifications', route: '/settings/notifications', icon: '🔔' },
        { label: 'Privacy', route: '/settings/privacy', icon: '🔒' },
        { label: 'Appearance', route: '/settings/appearance', icon: '🎨' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Transaction History', route: '/transactions/history', icon: '💰' },
        { label: 'AI Support', route: '/ai/support', icon: '🌐' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Notifications', route: '/settings/notifications', icon: '❓' },
        { label: 'Privacy', route: '/settings/privacy', icon: '📧' },
      ],
    },
    {
      title: 'About',
      items: [
        { label: 'Appearance', route: '/settings/appearance', icon: 'ℹ️' },
        { label: 'Account Settings', route: '/settings/account', icon: '📄' },
        { label: 'Home', route: '/(tabs)/home', icon: '📋' },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {settingsGroups.map((group, groupIndex) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          {group.items.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              style={styles.item}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <Text style={styles.itemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl * 2,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  group: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.background.secondary,
  },
  groupTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  itemLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  itemArrow: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.tertiary,
  },
  footer: {
    height: theme.spacing.xl * 2,
  },
});
