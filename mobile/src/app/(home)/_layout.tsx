// HomeShell: bottom tabs for the homeowner role.
// Discover | Messages | Emergency (raised) | Recommend | You

import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs, useRouter } from 'expo-router';
import React from 'react';

import { useAuth } from '../../auth/AuthContext';
import { RaisedTabButton } from '../../components/RaisedTabButton';
import { useTheme } from '../../theme/ThemeContext';
import { font, fontSize } from '../../theme/tokens';

export default function HomeShellLayout() {
  const { status, role } = useAuth();
  const { scheme } = useTheme();
  const router = useRouter();

  if (status === 'loading') return null;
  if (status === 'signedOut' || role !== 'homeowner') {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      initialRouteName="discover"
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
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'Emergency',
          tabBarLabel: () => null,
          tabBarButton: () => (
            <RaisedTabButton
              icon="alert"
              color={scheme.red}
              accessibilityLabel="Emergency"
              onPress={() => router.push('/(home)/emergency')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recommend"
        options={{
          title: 'Recommend',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="thumbs-up-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'You',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
