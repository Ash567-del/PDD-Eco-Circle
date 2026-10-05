import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
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
import { adminActivityService } from '../../services/adminActivityService';
import { Avatar } from '../../components/common/Avatar';
import { UserProfile, VerificationStatus } from '../../types/auth';

type FilterTab = 'Pending' | 'Approved' | 'Rejected' | 'All';

export default function MemberManagementScreen() {
  const router = useRouter();
  const { currentUser, approveUser, rejectUser } = useAuth();
  const { sendNotification, refreshData } = useAppData();

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Rejection Modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const data = await authService.getAllUsers();
      setUsersList(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await loadUsers();
  };

  const handleApprove = async (user: UserProfile) => {
    try {
      await approveUser(user.id);
      await sendNotification({
        userId: user.id,
        type: 'general',
        title: 'Membership Approved',
        message: 'Your Eco Circle membership has been approved. Welcome to the community!',
      });
      await adminActivityService.logActivity(
        'Member Approved',
        `${currentUser?.fullName || 'Admin'} approved ${user.fullName} for ${user.communityName}.`,
        'user',
        currentUser?.fullName || 'Admin'
      );
      await loadUsers();
      Alert.alert('Approved', `${user.fullName} has been approved successfully.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to approve member.');
    }
  };

  const promptReject = (user: UserProfile) => {
    setTargetUser(user);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!targetUser) return;
    setRejectModalVisible(false);
    try {
      const reason = rejectReason.trim() || 'Address proof did not satisfy community criteria.';
      await rejectUser(targetUser.id, reason);
      await sendNotification({
        userId: targetUser.id,
        type: 'general',
        title: 'Membership Application Update',
        message: 'Your Eco Circle membership application was not approved. Please contact your administrator.',
      });
      await adminActivityService.logActivity(
        'Member Application Rejected',
        `${currentUser?.fullName || 'Admin'} rejected ${targetUser.fullName}'s membership request.`,
        'user',
        currentUser?.fullName || 'Admin'
      );
      await loadUsers();
      Alert.alert('Rejected', `${targetUser.fullName}'s application has been rejected.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to reject member.');
    }
  };

  const getFilteredUsers = () => {
    let list = usersList;

    if (activeTab === 'Pending') {
      list = list.filter((u) => u.verificationStatus === 'pending');
    } else if (activeTab === 'Approved') {
      list = list.filter((u) => u.verificationStatus === 'approved');
    } else if (activeTab === 'Rejected') {
      list = list.filter((u) => u.verificationStatus === 'rejected');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.communityName.toLowerCase().includes(q) ||
          u.area.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredUsers = getFilteredUsers();

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return { label: 'Verified Member', bg: '#D1FAE5', text: '#047857' };
      case 'pending':
        return { label: 'Pending Verification', bg: '#FEF3C7', text: '#D97706' };
      case 'rejected':
        return { label: 'Rejected', bg: '#FEE2E2', text: '#DC2626' };
    }
  };

  const renderUserCard = ({ item }: { item: UserProfile }) => {
    const badgeStyle = getStatusBadge(item.verificationStatus);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Avatar name={item.fullName} imageUrl={item.avatarUrl} size={48} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.fullName}>{item.fullName}</Text>
              {item.role === 'admin' && (
                <View style={styles.adminRoleTag}>
                  <Text style={styles.adminRoleTagText}>ADMIN</Text>
                </View>
              )}
            </View>
            <Text style={styles.emailText}>{item.email}</Text>
            <Text style={styles.phoneText}>📞 {item.phone}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>House/Flat</Text>
            <Text style={styles.detailVal}>{item.houseNumber}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Area</Text>
            <Text style={styles.detailVal}>{item.area}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Joined</Text>
            <Text style={styles.detailVal}>{item.joinedDate}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
              {badgeStyle.label}
            </Text>
          </View>

          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => {
                if (item.verificationStatus === 'pending') {
                  router.push({
                    pathname: ROUTES.ADMIN_USER_VERIFICATION as any,
                    params: { id: item.id },
                  });
                } else {
                  router.push({
                    pathname: ROUTES.ADMIN_MEMBER_PROFILE as any,
                    params: { id: item.id },
                  });
                }
              }}
            >
              <Text style={styles.detailsBtnText}>View Details</Text>
            </TouchableOpacity>

            {item.verificationStatus === 'pending' && (
              <>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApprove(item)}
                >
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => promptReject(item)}
                >
                  <Ionicons name="close" size={14} color={COLORS.white} />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.headerArea}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, phone, area..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textMuted}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips */}
        <View style={styles.tabsRow}>
          {(['Pending', 'Approved', 'Rejected', 'All'] as FilterTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabChip, isActive && styles.activeTabChip]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabChipText, isActive && styles.activeTabChipText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main FlatList */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primaryDark]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No members found.</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'Pending'
                ? 'No pending user membership requests right now.'
                : 'No users matching your search filters.'}
            </Text>
          </View>
        }
      />

      {/* Rejection Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="alert-circle" size={44} color="#DC2626" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Reject Membership?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to reject {targetUser?.fullName}'s application?
            </Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Reason for rejection (optional)..."
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmRejectBtn}
                onPress={handleConfirmReject}
              >
                <Text style={styles.modalConfirmRejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerArea: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
  },
  activeTabChip: {
    backgroundColor: COLORS.primaryDark,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeTabChipText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  adminRoleTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminRoleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  emailText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  phoneText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#047857',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
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
    marginBottom: 14,
  },
  reasonInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 18,
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
  modalConfirmRejectBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmRejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
