import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: COLORS.primaryDark,
        headerStyle: { backgroundColor: COLORS.background },
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="welcome" options={{ title: 'Welcome' }} />
      <Stack.Screen name="user-login" options={{ title: 'Member Login' }} />
      <Stack.Screen name="user-register" options={{ title: 'Register Account' }} />
      <Stack.Screen name="pending-verification" options={{ title: 'Pending Approval', headerLeft: () => null }} />
      <Stack.Screen name="verification-success" options={{ title: 'Account Verified' }} />
      <Stack.Screen name="admin-login" options={{ title: 'Admin Portal Login' }} />
    </Stack>
  );
}
