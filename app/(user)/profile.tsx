import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/common/Avatar';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { resources, requests, posts, events, problems } = useAppData();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Dynamic Activity Statistics calculation
  const userId = currentUser?.id || '';
  const sharedCount = resources.filter((r) => r.ownerId === userId).length;
  const requestsSentCount = requests.filter((r) => r.requesterId === userId).length;
  const postsCount = posts.filter((p) => p.authorId === userId).length;
  const eventsJoinedCount = events.filter((e) => e.participantIds.includes(userId)).length;
  const problemsReportedCount = problems.filter((p) => p.reportedById === userId).length;

  const handleLogoutConfirm = async () => {
    setLogoutModalVisible(false);
    await logout();
    router.replace(ROUTES.WELCOME as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.headerRow}>
            <Avatar
              name={currentUser?.fullName}
              imageUrl={currentUser?.avatarUrl}
              size={64}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{currentUser?.fullName || 'Community Member'}</Text>
              <Text style={styles.email}>{currentUser?.email}</Text>
              <Text style={styles.communityName}>📍 {currentUser?.communityName}</Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <StatusBadge status={currentUser?.verificationStatus || 'VERIFIED'} />
            <Text style={styles.areaText}>{currentUser?.area}</Text>
          </View>
        </Card>

        {/* YOUR ACTIVITY STATISTICS */}
        <Text style={styles.sectionHeader}>Your Activity</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{sharedCount}</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.accentBlue }]}>
              {requestsSentCount}
            </Text>
            <Text style={styles.statLabel}>Requests</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#6B21A8' }]}>{postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>{eventsJoinedCount}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#DC2626' }]}>
              {problemsReportedCount}
            </Text>
            <Text style={styles.statLabel}>Issues</Text>
          </View>
        </ScrollView>

        {/* MY ACTIVITY SECTION */}
        <Text style={[styles.sectionHeader, { marginTop: 18 }]}>My Activity</Text>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.MY_RESOURCES as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="cube-outline" size={20} color={COLORS.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>My Shared Resources</Text>
            <Text style={styles.menuSubtitle}>View, edit, or delete items you listed</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.MY_RESOURCE_REQUESTS as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="paper-plane-outline" size={20} color={COLORS.accentBlue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>My Resource Requests</Text>
            <Text style={styles.menuSubtitle}>Track status of items you requested</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.RECEIVED_REQUESTS as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="hand-right-outline" size={20} color="#92400E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Received Requests</Text>
            <Text style={styles.menuSubtitle}>Review incoming item requests from neighbors</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.MY_POSTS as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="document-text-outline" size={20} color="#6B21A8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>My Posts</Text>
            <Text style={styles.menuSubtitle}>Manage updates and questions created by you</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.JOINED_EVENTS as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="bookmark-outline" size={20} color="#047857" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>My Joined Events</Text>
            <Text style={styles.menuSubtitle}>Events you are registered to attend</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.MY_PROBLEMS as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="list-outline" size={20} color="#7C3AED" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>My Reported Problems</Text>
            <Text style={styles.menuSubtitle}>Track status updates and resolution notes</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        {/* COMMUNITY SECTION */}
        <Text style={[styles.sectionHeader, { marginTop: 18 }]}>Community</Text>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.COMMUNITY_INFO as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Community Information</Text>
            <Text style={styles.menuSubtitle}>Guidelines, office contacts, and emergency info</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.ANNOUNCEMENTS as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#FFE4E6' }]}>
            <Ionicons name="megaphone-outline" size={20} color="#9F1239" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Announcements</Text>
            <Text style={styles.menuSubtitle}>Important broadcasts from community admin</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        {/* ACCOUNT SECTION */}
        <Text style={[styles.sectionHeader, { marginTop: 18 }]}>Account</Text>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.EDIT_PROFILE as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="create-outline" size={20} color={COLORS.accentBlue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Edit Profile</Text>
            <Text style={styles.menuSubtitle}>Update contact and address information</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.NOTIFICATIONS as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="notifications-outline" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Notifications</Text>
            <Text style={styles.menuSubtitle}>View activity alerts and notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push(ROUTES.SETTINGS as any)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="settings-outline" size={20} color={COLORS.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Settings</Text>
            <Text style={styles.menuSubtitle}>Preferences, notification toggles, and security</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>

        <Pressable
          style={[styles.menuItem, { borderColor: '#FEE2E2' }]}
          onPress={() => setLogoutModalVisible(true)}
        >
          <View style={[styles.menuIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuTitle, { color: '#DC2626' }]}>Logout</Text>
            <Text style={styles.menuSubtitle}>Safely end your session</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </Pressable>
      </ScrollView>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="log-out" size={44} color="#DC2626" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Logout?</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout from Eco Circle?</Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalLogoutBtn}
                onPress={handleLogoutConfirm}
              >
                <Text style={styles.modalLogoutBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 36 },
  profileCard: { padding: 18, marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  email: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  communityName: { fontSize: 12, fontWeight: '600', color: COLORS.primaryDark, marginTop: 4 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  areaText: { fontSize: 12, color: COLORS.textMuted },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
    paddingBottom: 4,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 78,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  menuSubtitle: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalLogoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
