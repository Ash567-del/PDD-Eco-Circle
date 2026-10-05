import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

export default function AdminLayout() {
  const { currentUser } = useAuth();

  // Strict Admin Protection Rule:
  // Normal users & unauthenticated visitors MUST NOT be able to access admin routes.
  if (!currentUser || currentUser.role !== 'admin') {
    return <Redirect href={ROUTES.ADMIN_LOGIN as any} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTintColor: COLORS.primaryDark,
        headerStyle: { backgroundColor: COLORS.background },
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: COLORS.primaryDark,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Admin Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Members',
          headerTitle: 'Member Approvals',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          headerTitle: 'Resource Moderation',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: 'Posts',
          headerTitle: 'Post Moderation & Announcements',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'megaphone' : 'megaphone-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          headerTitle: 'Event Management',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="problems"
        options={{
          title: 'Problems',
          headerTitle: 'Problem Reports',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'warning' : 'warning-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          headerTitle: 'Community Metrics',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* Hidden Stack Sub-routes */}
      <Tabs.Screen name="user-verification" options={{ href: null, headerTitle: 'Applicant Verification' }} />
      <Tabs.Screen name="member-profile" options={{ href: null, headerTitle: 'Member Details' }} />
      <Tabs.Screen name="resource-details" options={{ href: null, headerTitle: 'Resource Details' }} />
      <Tabs.Screen name="post-details" options={{ href: null, headerTitle: 'Post Details' }} />
      <Tabs.Screen name="create-announcement" options={{ href: null, headerTitle: 'New Announcement' }} />
      <Tabs.Screen name="create-event" options={{ href: null, headerTitle: 'Create Event' }} />
      <Tabs.Screen name="edit-event" options={{ href: null, headerTitle: 'Edit Event' }} />
      <Tabs.Screen name="problem-details" options={{ href: null, headerTitle: 'Problem Details' }} />
      <Tabs.Screen name="profile" options={{ href: null, headerTitle: 'Admin Account' }} />
    </Tabs>
  );
}
