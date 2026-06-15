import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useAuth } from '../../auth/AuthContext';

export default function AuthLayout() {
  const { status } = useAuth();

  // Once signed in, the splash route handles role-based redirection.
  if (status === 'signedIn') {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
