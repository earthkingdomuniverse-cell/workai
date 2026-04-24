import React from 'react';
import { Tabs } from 'expo-router';
import { theme } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';

export default function TabsLayout() {
  const { isOperator } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.secondary,
          borderTopColor: theme.colors.surface.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.background.secondary,
        },
        headerTintColor: theme.colors.text.primary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: 'Offers',
          tabBarLabel: 'Offers',
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarLabel: 'Requests',
        }}
      />
      <Tabs.Screen
        name="proposals"
        options={{
          title: 'Proposals',
          tabBarLabel: 'Proposals',
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: 'Deals',
          tabBarLabel: 'Deals',
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarLabel: 'AI',
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarLabel: 'Billing',
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarLabel: 'Wallet',
        }}
      />
      <Tabs.Screen
        name="skill-exchange"
        options={{
          title: 'Skill Exchange',
          tabBarLabel: 'Skill Exchange',
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarLabel: 'Inbox',
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarLabel: 'Activity',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarLabel: 'Admin',
          href: isOperator ? undefined : null,
        }}
      />
    </Tabs>
  );
}
