import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAppData } from '../../contexts/AppDataContext';
import { authService } from '../../services/authService';
import { Avatar } from '../../components/common/Avatar';
import { UserProfile } from '../../types/auth';

export default function AdminMemberProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { resources, requests, posts, events, problems } = useAppData();

  const [member, setMember] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMember = useCallback(async () => {
    if (!params.id) return;
    try {
      const users = await authService.getAllUsers();
      const found = users.find((u) => u.id === params.id);
      setMember(found || null);
    } catch (err) {
      console.error('Failed to load member profile:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      fetchMember();
    }, [fetchMember])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryDark} />
        <Text style={styles.loadingText}>Loading member profile...</Text>
      </SafeAreaView>
    );
  }

  if (!member) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        <Text style={styles.notFoundTitle}>Member Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const userId = member.id;
  const sharedCount = resources.filter((r) => r.ownerId === userId).length;
  const requestsMadeCount = requests.filter((r) => r.requesterId === userId).length;
  const postsCount = posts.filter((p) => p.authorId === userId).length;
  const eventsJoinedCount = events.filter((e) => e.participantIds.includes(userId)).length;
  const problemsReportedCount = problems.filter((p) => p.reportedById === userId).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Profile Card */}
        <View style={styles.profileHeaderCard}>
          <Avatar name={member.fullName} imageUrl={member.avatarUrl} size={72} />
          <Text style={styles.fullName}>{member.fullName}</Text>
          <Text style={styles.emailText}>{member.email}</Text>
          <Text style={styles.communityText}>📍 {member.communityName}</Text>

          <View style={styles.statusBadgeRow}>
            <View
              style={[
                styles.badge,
                member.verificationStatus === 'approved' && { backgroundColor: '#D1FAE5' },
                member.verificationStatus === 'pending' && { backgroundColor: '#FEF3C7' },
                member.verificationStatus === 'rejected' && { backgroundColor: '#FEE2E2' },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  member.verificationStatus === 'approved' && { color: '#047857' },
                  member.verificationStatus === 'pending' && { color: '#D97706' },
                  member.verificationStatus === 'rejected' && { color: '#DC2626' },
                ]}
              >
                {member.verificationStatus.toUpperCase()} MEMBER
              </Text>
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{member.role.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Member Activity Summary */}
        <Text style={styles.sectionTitle}>Member Activity Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{sharedCount}</Text>
            <Text style={styles.statLabel}>Resources Shared</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.accentBlue }]}>{requestsMadeCount}</Text>
            <Text style={styles.statLabel}>Requests Made</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#6B21A8' }]}>{postsCount}</Text>
            <Text style={styles.statLabel}>Posts Created</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>{eventsJoinedCount}</Text>
            <Text style={styles.statLabel}>Events Joined</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#DC2626' }]}>{problemsReportedCount}</Text>
            <Text style={styles.statLabel}>Issues Reported</Text>
          </View>
        </View>

        {/* Personal Contact & Address Details */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Contact & Address</Text>
        <View style={styles.detailsCard}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoVal}>{member.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="home-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>House / Flat</Text>
              <Text style={styles.infoVal}>{member.houseNumber}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Area / Sector</Text>
              <Text style={styles.infoVal}>{member.area}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Registration Date</Text>
              <Text style={styles.infoVal}>{member.joinedDate}</Text>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 10,
  },
  emailText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  communityText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginTop: 4,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  roleBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
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
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 1,
  },
});
