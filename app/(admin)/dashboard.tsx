import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { authService } from '../../services/authService';
import { adminActivityService, AdminActivityLog } from '../../services/adminActivityService';
import { Avatar } from '../../components/common/Avatar';
import { UserProfile } from '../../types/auth';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { resources, requests, posts, events, problems, refreshData } = useAppData();

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const users = await authService.getAllUsers();
    setAllUsers(users);
    const logs = await adminActivityService.getLogs();
    setActivityLogs(logs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await loadData();
    setRefreshing(false);
  };

  // Dynamic Statistics Calculations
  const totalMembers = allUsers.length;
  const pendingApprovalsCount = allUsers.filter((u) => u.verificationStatus === 'pending').length;
  const totalResourcesCount = resources.length;
  const activeRequestsCount = requests.filter(
    (r) => r.status === 'pending' || r.status === 'accepted'
  ).length;
  const totalPostsCount = posts.length;
  const upcomingEventsCount = events.filter(
    (e) => e.status === 'upcoming' || e.status === 'ongoing'
  ).length;
  const openProblemsCount = problems.filter(
    (p) => p.status === 'reported' || p.status === 'under_review' || p.status === 'in_progress'
  ).length;
  const resolvedProblemsCount = problems.filter(
    (p) => p.status === 'resolved' || p.status === 'closed'
  ).length;

  const getActivityIcon = (type: AdminActivityLog['type']) => {
    switch (type) {
      case 'user':
        return { icon: 'person-add', color: COLORS.primaryDark, bg: '#D1FAE5' };
      case 'resource':
        return { icon: 'cube', color: COLORS.accentBlue, bg: '#E0F2FE' };
      case 'post':
        return { icon: 'megaphone', color: '#9F1239', bg: '#FFE4E6' };
      case 'event':
        return { icon: 'calendar', color: '#D97706', bg: '#FEF3C7' };
      case 'problem':
        return { icon: 'warning', color: '#7C3AED', bg: '#EDE9FE' };
      default:
        return { icon: 'notifications', color: COLORS.primaryDark, bg: '#F1F5F9' };
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primaryDark]}
          />
        }
      >
        {/* Admin Header Banner */}
        <View style={styles.adminHeaderCard}>
          <View style={styles.adminHeaderRow}>
            <Avatar name={currentUser?.fullName} imageUrl={currentUser?.avatarUrl} size={54} />
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Text style={styles.adminBadgeText}>COMMUNITY ADMIN</Text>
              </View>
              <Text style={styles.adminName}>{currentUser?.fullName || 'Administrator'}</Text>
              <Text style={styles.communityName}>{currentUser?.communityName || 'Green Valley Community'}</Text>
            </View>

            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push(ROUTES.ADMIN_PROFILE as any)}
            >
              <Ionicons name="settings-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Overview Statistics Grid */}
        <Text style={styles.sectionTitle}>Community Overview</Text>

        {/* Urgent Alert Banner if pending approvals exist */}
        {pendingApprovalsCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push(ROUTES.ADMIN_USERS as any)}
          >
            <Ionicons name="time" size={22} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Pending Member Approvals</Text>
              <Text style={styles.alertDesc}>
                {pendingApprovalsCount} new membership applicant(s) waiting for verification.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D97706" />
          </TouchableOpacity>
        )}

        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(ROUTES.ADMIN_USERS as any)}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="people" size={20} color="#047857" />
            </View>
            <Text style={styles.statNumber}>{totalMembers}</Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(ROUTES.ADMIN_USERS as any)}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="hourglass" size={20} color="#D97706" />
            </View>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>{pendingApprovalsCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(ROUTES.ADMIN_RESOURCES as any)}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="cube" size={20} color={COLORS.accentBlue} />
            </View>
            <Text style={styles.statNumber}>{totalResourcesCount}</Text>
            <Text style={styles.statLabel}>Resources</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(ROUTES.ADMIN_ANALYTICS as any)}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="hand-right" size={20} color="#6B21A8" />
            </View>
            <Text style={[styles.statNumber, { color: '#6B21A8' }]}>{activeRequestsCount}</Text>
            <Text style={styles.statLabel}>Active Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(ROUTES.ADMIN_POSTS as any)}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#FFE4E6' }]}>
              <Ionicons name="document-text" size={20} color="#9F1239" />
            </View>
            <Text style={styles.statNumber}>{totalPostsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(ROUTES.ADMIN_EVENTS as any)}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="calendar" size={20} color="#D97706" />
            </View>
            <Text style={styles.statNumber}>{upcomingEventsCount}</Text>
            <Text style={styles.statLabel}>Upcoming Events</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(ROUTES.ADMIN_PROBLEMS as any)}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="warning" size={20} color="#7C3AED" />
            </View>
            <Text style={[styles.statNumber, { color: '#7C3AED' }]}>{openProblemsCount}</Text>
            <Text style={styles.statLabel}>Open Problems</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push(ROUTES.ADMIN_PROBLEMS as any)}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#047857" />
            </View>
            <Text style={[styles.statNumber, { color: '#047857' }]}>{resolvedProblemsCount}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Admin Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.ADMIN_USERS as any)}
          >
            <Ionicons name="person-add-outline" size={22} color={COLORS.primaryDark} />
            <Text style={styles.actionCardTitle}>Pending Approvals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.ADMIN_USERS as any)}
          >
            <Ionicons name="people-outline" size={22} color={COLORS.primaryDark} />
            <Text style={styles.actionCardTitle}>Manage Members</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.ADMIN_RESOURCES as any)}
          >
            <Ionicons name="cube-outline" size={22} color={COLORS.accentBlue} />
            <Text style={styles.actionCardTitle}>Manage Resources</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.ADMIN_POSTS as any)}
          >
            <Ionicons name="newspaper-outline" size={22} color="#6B21A8" />
            <Text style={styles.actionCardTitle}>Manage Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' }]}
            onPress={() => router.push(ROUTES.ADMIN_CREATE_ANNOUNCEMENT as any)}
          >
            <Ionicons name="megaphone-outline" size={22} color="#9F1239" />
            <Text style={[styles.actionCardTitle, { color: '#9F1239' }]}>+ Announcement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.ADMIN_EVENTS as any)}
          >
            <Ionicons name="calendar-outline" size={22} color="#D97706" />
            <Text style={styles.actionCardTitle}>Manage Events</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.ADMIN_PROBLEMS as any)}
          >
            <Ionicons name="warning-outline" size={22} color="#7C3AED" />
            <Text style={styles.actionCardTitle}>Manage Problems</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(ROUTES.ADMIN_ANALYTICS as any)}
          >
            <Ionicons name="stats-chart-outline" size={22} color={COLORS.primaryDark} />
            <Text style={styles.actionCardTitle}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Community Activity Log */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Recent Community Activity</Text>
        <View style={styles.activityContainer}>
          {activityLogs.length > 0 ? (
            activityLogs.map((log) => {
              const iconCfg = getActivityIcon(log.type);
              return (
                <View key={log.id} style={styles.activityItem}>
                  <View style={[styles.activityIconCircle, { backgroundColor: iconCfg.bg }]}>
                    <Ionicons name={iconCfg.icon as any} size={16} color={iconCfg.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityAction}>{log.action}</Text>
                    <Text style={styles.activityDesc}>{log.description}</Text>
                    <Text style={styles.activityTime}>{formatRelativeTime(log.timestamp)}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyActivityText}>No recent activity logged yet.</Text>
          )}
        </View>
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
    padding: 16,
    paddingBottom: 36,
  },
  adminHeaderCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  adminHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeRow: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  adminName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  communityName: {
    fontSize: 12,
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  alertDesc: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  actionCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  activityContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  activityAction: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  activityDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  emptyActivityText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
});
