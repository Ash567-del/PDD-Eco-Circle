import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ResourceItem } from '../../types/resource';
import { authService } from '../../services/authService';
import { resourceService } from '../../services/resourceService';
import { requestService } from '../../services/requestService';
import { communityService } from '../../services/communityService';
import { eventService } from '../../services/eventService';
import { problemService } from '../../services/problemService';

interface AnalyticsData {
  members: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  resources: {
    total: number;
    available: number;
    requested: number;
    reserved: number;
    collected: number;
  };
  requests: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
  };
  community: {
    totalPosts: number;
    announcements: number;
    totalComments: number;
    totalLikes: number;
  };
  events: {
    total: number;
    upcoming: number;
    completed: number;
    totalParticipants: number;
  };
  problems: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

export default function AdminAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const allUsers = await authService.getAllUsers();
      const pendingUsers = allUsers.filter((u) => u.verificationStatus === 'pending');
      const approvedUsers = allUsers.filter((u) => u.verificationStatus === 'approved');
      const rejectedUsers = allUsers.filter((u) => u.verificationStatus === 'rejected');

      const resources = await resourceService.getResources();
      const requests = await requestService.getAllRequests();
      const posts = await communityService.getPosts();
      const events = await eventService.getEvents();
      const problems = await problemService.getProblems();

      // Member stats
      const membersTotal = pendingUsers.length + approvedUsers.length + rejectedUsers.length;

      // Resource stats
      const resAvailable = resources.filter((r: ResourceItem) => r.status === 'available').length;
      const resRequested = resources.filter((r: ResourceItem) => r.status === 'requested').length;
      const resReserved = resources.filter((r: ResourceItem) => r.status === 'reserved').length;
      const resCollected = resources.filter((r: ResourceItem) => r.status === 'collected').length;

      // Request stats
      const reqPending = requests.filter((r) => r.status === 'pending').length;
      const reqAccepted = requests.filter((r) => r.status === 'accepted').length;
      const reqRejected = requests.filter((r) => r.status === 'rejected').length;
      const reqCompleted = requests.filter((r) => r.status === 'completed').length;

      // Community stats
      const announcements = posts.filter((p) => p.isAnnouncement || p.type === 'announcement').length;
      const totalComments = posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
      const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

      // Event stats
      const evUpcoming = events.filter((e) => e.status === 'upcoming' || e.status === 'ongoing').length;
      const evCompleted = events.filter((e) => e.status === 'completed').length;
      const evParticipants = events.reduce((sum, e) => sum + e.participantIds.length, 0);

      // Problem stats
      const probOpen = problems.filter((p) => p.status === 'reported' || p.status === 'under_review').length;
      const probInProgress = problems.filter((p) => p.status === 'in_progress').length;
      const probResolved = problems.filter((p) => p.status === 'resolved').length;
      const probClosed = problems.filter((p) => p.status === 'closed').length;

      setData({
        members: {
          total: membersTotal,
          pending: pendingUsers.length,
          approved: approvedUsers.length,
          rejected: rejectedUsers.length,
        },
        resources: {
          total: resources.length,
          available: resAvailable,
          requested: resRequested,
          reserved: resReserved,
          collected: resCollected,
        },
        requests: {
          total: requests.length,
          pending: reqPending,
          accepted: reqAccepted,
          rejected: reqRejected,
          completed: reqCompleted,
        },
        community: {
          totalPosts: posts.length,
          announcements,
          totalComments,
          totalLikes,
        },
        events: {
          total: events.length,
          upcoming: evUpcoming,
          completed: evCompleted,
          totalParticipants: evParticipants,
        },
        problems: {
          total: problems.length,
          open: probOpen,
          inProgress: probInProgress,
          resolved: probResolved,
          closed: probClosed,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const renderBar = (value: number, total: number, color: string) => {
    const percentage = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
    return (
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Generating analytics dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Analytics</Text>
        <Text style={styles.headerSubtitle}>
          Real-time metrics and growth overview for Eco Circle.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Section 1: MEMBERS */}
        {data && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="people" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Members ({data.members.total})</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{data.members.approved}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.accentAmber }]}>
                  {data.members.pending}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.accentRose }]}>
                  {data.members.rejected}
                </Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Verification Rate</Text>
                <Text style={styles.progressValue}>
                  {data.members.total > 0
                    ? Math.round((data.members.approved / data.members.total) * 100)
                    : 0}
                  %
                </Text>
              </View>
              {renderBar(data.members.approved, data.members.total, COLORS.primary)}
            </View>
          </View>
        )}

        {/* Section 2: RESOURCES */}
        {data && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cube" size={20} color={COLORS.accentBlue} />
              <Text style={styles.cardTitle}>Shared Resources ({data.resources.total})</Text>
            </View>

            <View style={styles.grid2x2}>
              <View style={styles.gridItem}>
                <Text style={styles.gridValue}>{data.resources.available}</Text>
                <Text style={styles.gridLabel}>Available</Text>
                {renderBar(data.resources.available, data.resources.total, COLORS.primary)}
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridValue}>{data.resources.requested}</Text>
                <Text style={styles.gridLabel}>Requested</Text>
                {renderBar(data.resources.requested, data.resources.total, COLORS.accentAmber)}
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridValue}>{data.resources.reserved}</Text>
                <Text style={styles.gridLabel}>Reserved</Text>
                {renderBar(data.resources.reserved, data.resources.total, COLORS.accentPurple)}
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridValue}>{data.resources.collected}</Text>
                <Text style={styles.gridLabel}>Collected</Text>
                {renderBar(data.resources.collected, data.resources.total, COLORS.primaryDark)}
              </View>
            </View>
          </View>
        )}

        {/* Section 3: REQUESTS */}
        {data && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="swap-horizontal" size={20} color={COLORS.accentPurple} />
              <Text style={styles.cardTitle}>Resource Requests ({data.requests.total})</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.accentAmber }]}>
                  {data.requests.pending}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.accentBlue }]}>
                  {data.requests.accepted}
                </Text>
                <Text style={styles.statLabel}>Accepted</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.primary }]}>
                  {data.requests.completed}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.accentRose }]}>
                  {data.requests.rejected}
                </Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>
        )}

        {/* Section 4: COMMUNITY ENGAGEMENT */}
        {data && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="newspaper" size={20} color={COLORS.accentAmber} />
              <Text style={styles.cardTitle}>Community Feed Engagement</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{data.community.totalPosts}</Text>
                <Text style={styles.statLabel}>Total Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.primary }]}>
                  {data.community.announcements}
                </Text>
                <Text style={styles.statLabel}>Announcements</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{data.community.totalComments}</Text>
                <Text style={styles.statLabel}>Comments</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.accentRose }]}>
                  {data.community.totalLikes}
                </Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>
          </View>
        )}

        {/* Section 5: EVENTS */}
        {data && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={20} color={COLORS.accentRose} />
              <Text style={styles.cardTitle}>Events ({data.events.total})</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{data.events.upcoming}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.primary }]}>
                  {data.events.completed}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.primary }]}>
                  {data.events.totalParticipants}
                </Text>
                <Text style={styles.statLabel}>Total RSVPs</Text>
              </View>
            </View>
          </View>
        )}

        {/* Section 6: PROBLEMS */}
        {data && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={20} color={COLORS.accentRose} />
              <Text style={styles.cardTitle}>Reported Problems ({data.problems.total})</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.accentRose }]}>
                  {data.problems.open}
                </Text>
                <Text style={styles.statLabel}>Open</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.accentAmber }]}>
                  {data.problems.inProgress}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: COLORS.primary }]}>
                  {data.problems.resolved}
                </Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{data.problems.closed}</Text>
                <Text style={styles.statLabel}>Closed</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Resolution Speed Rate</Text>
                <Text style={styles.progressValue}>
                  {data.problems.total > 0
                    ? Math.round(
                        ((data.problems.resolved + data.problems.closed) /
                          data.problems.total) *
                          100
                      )
                    : 0}
                  %
                </Text>
              </View>
              {renderBar(
                data.problems.resolved + data.problems.closed,
                data.problems.total,
                COLORS.primary
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  progressSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  barBackground: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  gridLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
});
