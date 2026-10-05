import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { PostCard } from '../../components/community/PostCard';
import { resourceService } from '../../services/resourceService';
import { communityService } from '../../services/communityService';
import { eventService } from '../../services/eventService';
import { problemService } from '../../services/problemService';
import { ResourceItem } from '../../types/resource';
import { CommunityPost } from '../../types/community';
import { CommunityEvent } from '../../types/event';
import { CommunityProblem } from '../../types/problem';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { unreadNotifCount } = useAppData();

  const [recentResources, setRecentResources] = useState<ResourceItem[]>([]);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityEvent[]>([]);
  const [latestProblem, setLatestProblem] = useState<CommunityProblem | null>(null);
  const [stats, setStats] = useState({ available: 24, requested: 5, shared: 18 });

  useEffect(() => {
    const loadDashboardData = async () => {
      const resources = await resourceService.getResources();
      setRecentResources(resources.slice(0, 5));
      const s = await resourceService.getResourceStats();
      setStats(s);

      const posts = await communityService.getPosts();
      setRecentPosts(posts.slice(0, 2));

      const events = await eventService.getUpcomingEvents();
      setUpcomingEvents(events.slice(0, 2));

      if (currentUser) {
        const probs = await problemService.getProblemsByUser(currentUser.id);
        if (probs.length > 0) {
          setLatestProblem(probs[0]);
        }
      }
    };
    loadDashboardData();
  }, [currentUser]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Greeting Header Bar */}
        <View style={styles.topHeaderBar}>
          <View style={styles.greetingWrapper}>
            <Text style={styles.greetingTitle}>
              Good morning, {currentUser?.fullName?.split(' ')[0] || 'Member'} 👋
            </Text>
            <Text style={styles.greetingSubtitle}>Welcome back to Eco Circle</Text>
          </View>

          <Pressable
            style={styles.notifButton}
            onPress={() => router.push(ROUTES.NOTIFICATIONS as any)}
            accessibilityLabel="View Notifications"
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            {unreadNotifCount > 0 ? (
              <View style={styles.notifBadgeContainer}>
                <Text style={styles.notifBadgeText}>
                  {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Your Community Card */}
        <Card style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <View style={styles.communityInfo}>
              <Text style={styles.communityLabel}>YOUR COMMUNITY</Text>
              <Text style={styles.communityName}>{currentUser?.communityName || 'Green Valley Community'}</Text>
            </View>
            <StatusBadge status="VERIFIED" />
          </View>
          <Text style={styles.communityFooterText}>
            📍 Area: {currentUser?.area || 'Central District'}
          </Text>
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionHeaderTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {/* Action 1: Share Resource */}
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.SHARE_RESOURCE as any)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="add-circle-outline" size={26} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.actionTitle}>Share Resource</Text>
            <Text style={styles.actionDesc}>Give something a new purpose</Text>
          </Pressable>

          {/* Action 2: Find Resources */}
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.RESOURCES as any)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="search-outline" size={26} color={COLORS.accentBlue} />
            </View>
            <Text style={styles.actionTitle}>Find Resources</Text>
            <Text style={styles.actionDesc}>Discover useful items nearby</Text>
          </Pressable>

          {/* Action 3: Community Events */}
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.EVENTS as any)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="calendar-outline" size={26} color="#92400E" />
            </View>
            <Text style={styles.actionTitle}>Community Events</Text>
            <Text style={styles.actionDesc}>See what's happening</Text>
          </Pressable>

          {/* Action 4: Report Problem */}
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.REPORT_PROBLEM as any)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FFE4E6' }]}>
              <Ionicons name="warning-outline" size={26} color="#9F1239" />
            </View>
            <Text style={styles.actionTitle}>Report Problem</Text>
            <Text style={styles.actionDesc}>Help improve our community</Text>
          </Pressable>
        </View>

        {/* Next Upcoming Events Section */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Community Events</Text>
          <Pressable onPress={() => router.push(ROUTES.EVENTS as any)}>
            <Text style={styles.seeAllLink}>View All Events</Text>
          </Pressable>
        </View>

        <View style={styles.eventsPreviewContainer}>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((evt) => (
              <TouchableOpacity
                key={evt.id}
                style={styles.eventMiniCard}
                onPress={() =>
                  router.push({
                    pathname: ROUTES.EVENT_DETAILS as any,
                    params: { id: evt.id },
                  })
                }
              >
                <View style={styles.eventMiniIcon}>
                  <Ionicons name="calendar" size={20} color={COLORS.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventMiniTitle} numberOfLines={1}>
                    {evt.title}
                  </Text>
                  <Text style={styles.eventMiniSub}>
                    {evt.date} • {evt.startTime}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyMiniText}>No upcoming events scheduled right now.</Text>
          )}
        </View>

        {/* Latest Reported Problem Section */}
        <View style={[styles.recentSectionHeader, { marginTop: 14 }]}>
          <Text style={styles.sectionHeaderTitle}>Community Issues</Text>
          <Pressable onPress={() => router.push(ROUTES.MY_PROBLEMS as any)}>
            <Text style={styles.seeAllLink}>View My Reports</Text>
          </Pressable>
        </View>

        <View style={styles.problemPreviewContainer}>
          {latestProblem ? (
            <TouchableOpacity
              style={styles.problemMiniCard}
              onPress={() =>
                router.push({
                  pathname: ROUTES.PROBLEM_DETAILS as any,
                  params: { id: latestProblem.id },
                })
              }
            >
              <View style={styles.problemMiniIcon}>
                <Ionicons name="alert-circle" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.problemMiniTitle} numberOfLines={1}>
                  {latestProblem.title}
                </Text>
                <Text style={styles.problemMiniSub}>
                  Status: {latestProblem.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.noProblemMiniCard}
              onPress={() => router.push(ROUTES.REPORT_PROBLEM as any)}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.primaryDark} />
              <Text style={styles.noProblemMiniText}>
                No issues reported by you. Tap to report a problem.
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Community Updates Section */}
        <View style={[styles.recentSectionHeader, { marginTop: 14 }]}>
          <Text style={styles.sectionHeaderTitle}>Community Updates</Text>
          <Pressable onPress={() => router.push(ROUTES.COMMUNITY as any)}>
            <Text style={styles.seeAllLink}>View Feed</Text>
          </Pressable>
        </View>

        {recentPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={currentUser ? post.likedBy?.includes(currentUser.id) : false}
          />
        ))}

        {/* Recently Shared Section */}
        <View style={[styles.recentSectionHeader, { marginTop: 14 }]}>
          <Text style={styles.sectionHeaderTitle}>Recently Shared</Text>
          <Pressable onPress={() => router.push(ROUTES.RESOURCES as any)}>
            <Text style={styles.seeAllLink}>See All</Text>
          </Pressable>
        </View>

        <FlatList
          data={recentResources}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <ResourceCard item={item} horizontal />}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  greetingWrapper: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  notifBadgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  notifBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  communityCard: {
    backgroundColor: COLORS.primaryDark,
    marginBottom: 22,
    padding: 18,
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  communityInfo: {
    flex: 1,
  },
  communityLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.8,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 2,
  },
  communityFooterText: {
    fontSize: 12,
    color: COLORS.primaryLight,
    marginTop: 4,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  eventsPreviewContainer: {
    marginBottom: 16,
    gap: 8,
  },
  eventMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  eventMiniIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventMiniTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  eventMiniSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyMiniText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    padding: 8,
  },
  problemPreviewContainer: {
    marginBottom: 16,
  },
  problemMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  problemMiniIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  problemMiniTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  problemMiniSub: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 2,
  },
  noProblemMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  noProblemMiniText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
});
