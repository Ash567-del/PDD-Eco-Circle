import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';

export default function UserLayout() {
  const { currentUser } = useAuth();

  // Route Protection Rules:
  // 1. Unauthenticated -> Redirect to Welcome
  if (!currentUser) {
    return <Redirect href={ROUTES.WELCOME as any} />;
  }

  // 2. Authenticated user with 'pending' verification -> Redirect to Pending Verification
  if (currentUser.verificationStatus === 'pending') {
    return <Redirect href={ROUTES.PENDING_VERIFICATION as any} />;
  }

  // 3. Authenticated user with 'rejected' status -> Redirect to Login
  if (currentUser.verificationStatus === 'rejected') {
    return <Redirect href={ROUTES.USER_LOGIN as any} />;
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
        name="home"
        options={{
          title: 'Home',
          headerTitle: 'Eco Circle',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          headerTitle: 'Find Resources',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          headerTitle: 'Community Feed',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          headerTitle: 'Community Events',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: 'Notifications',
          headerTitle: 'Alerts & Notifications',
        }}
      />

      {/* Stack screens - Hidden from tab bar */}
      <Tabs.Screen name="resource-details" options={{ href: null, headerTitle: 'Resource Details' }} />
      <Tabs.Screen name="share-resource" options={{ href: null, headerTitle: 'Share Resource' }} />
      <Tabs.Screen name="my-resources" options={{ href: null, headerTitle: 'My Shared Resources' }} />
      <Tabs.Screen name="edit-resource" options={{ href: null, headerTitle: 'Edit Resource' }} />
      <Tabs.Screen name="my-resource-requests" options={{ href: null, headerTitle: 'My Requests' }} />
      <Tabs.Screen name="received-requests" options={{ href: null, headerTitle: 'Received Requests' }} />
      <Tabs.Screen name="request-details" options={{ href: null, headerTitle: 'Request Details' }} />
      <Tabs.Screen name="contact-owner" options={{ href: null, headerTitle: 'Contact Owner' }} />
      <Tabs.Screen name="create-post" options={{ href: null, headerTitle: 'Create Post' }} />
      <Tabs.Screen name="post-details" options={{ href: null, headerTitle: 'Post Details' }} />
      <Tabs.Screen name="edit-post" options={{ href: null, headerTitle: 'Edit Post' }} />
      <Tabs.Screen name="my-posts" options={{ href: null, headerTitle: 'My Posts' }} />
      <Tabs.Screen name="community-information" options={{ href: null, headerTitle: 'Community Info' }} />
      <Tabs.Screen name="announcements" options={{ href: null, headerTitle: 'Announcements' }} />

      {/* Phase 5 Stack Screens */}
      <Tabs.Screen name="event-details" options={{ href: null, headerTitle: 'Event Details' }} />
      <Tabs.Screen name="joined-events" options={{ href: null, headerTitle: 'My Joined Events' }} />
      <Tabs.Screen name="report-problem" options={{ href: null, headerTitle: 'Report Problem' }} />
      <Tabs.Screen name="my-problems" options={{ href: null, headerTitle: 'My Reported Problems' }} />
      <Tabs.Screen name="problem-details" options={{ href: null, headerTitle: 'Problem Details' }} />

      {/* Phase 6 Stack Screens */}
      <Tabs.Screen name="edit-profile" options={{ href: null, headerTitle: 'Edit Profile' }} />
      <Tabs.Screen name="settings" options={{ href: null, headerTitle: 'Settings' }} />
    </Tabs>
  );
}
