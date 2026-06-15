// ProShell: bottom tabs for the pro role.
// Leads | Stats | + Add Kraft (raised) | Network | Account

import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs, useRouter } from 'expo-router';
import React from 'react';

import { useAuth } from '../../auth/AuthContext';
import { RaisedTabButton } from '../../components/RaisedTabButton';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize } from '../../theme/tokens';

export default function ProShellLayout() {
  const { status, role } = useAuth();
  const { scheme } = useTheme();
  const router = useRouter();

  if (status === 'loading') return null;
  if (status === 'signedOut' || role !== 'pro') {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      initialRouteName="leads"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: scheme.primary,
        tabBarInactiveTintColor: scheme.text3,
        tabBarStyle: {
          backgroundColor: scheme.surface,
          borderTopColor: scheme.border,
        },
        tabBarLabelStyle: {
          fontFamily: font.uiSemibold,
          fontSize: fontSize.xs,
        },
      }}
    >
      <Tabs.Screen
        name="leads"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-kraft"
        options={{
          title: 'Add Kraft',
          tabBarLabel: () => null,
          tabBarButton: () => (
            <RaisedTabButton
              icon="add"
              color={scheme.primary}
              accessibilityLabel="Add Kraft"
              onPress={() => router.push('/(pro)/add-kraft')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: 'Network',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
