import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { authService } from '../../services/authService';
import { adminActivityService } from '../../services/adminActivityService';
import { Avatar } from '../../components/common/Avatar';
import { UserProfile } from '../../types/auth';

export default function UserVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { currentUser, approveUser, rejectUser } = useAuth();
  const { sendNotification } = useAppData();

  const [applicant, setApplicant] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const fetchApplicant = useCallback(async () => {
    if (!params.id) return;
    try {
      const users = await authService.getAllUsers();
      const found = users.find((u) => u.id === params.id);
      setApplicant(found || null);
    } catch (err) {
      console.error('Failed to load applicant:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      fetchApplicant();
    }, [fetchApplicant])
  );

  const handleApprove = async () => {
    if (!applicant) return;
    setActionLoading(true);
    try {
      await approveUser(applicant.id);
      await sendNotification({
        userId: applicant.id,
        type: 'general',
        title: 'Membership Approved',
        message: 'Your Eco Circle membership has been approved. Welcome to the community!',
      });
      await adminActivityService.logActivity(
        'Member Approved',
        `${currentUser?.fullName || 'Admin'} approved ${applicant.fullName}.`,
        'user',
        currentUser?.fullName || 'Admin'
      );
      Alert.alert('Approved', `${applicant.fullName} has been approved successfully.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!applicant) return;
    setRejectModalVisible(false);
    setActionLoading(true);
    try {
      await rejectUser(applicant.id, 'Verification criteria not satisfied.');
      await sendNotification({
        userId: applicant.id,
        type: 'general',
        title: 'Membership Application Update',
        message: 'Your Eco Circle membership application was not approved. Please contact your administrator.',
      });
      await adminActivityService.logActivity(
        'Member Rejected',
        `${currentUser?.fullName || 'Admin'} rejected ${applicant.fullName}'s membership application.`,
        'user',
        currentUser?.fullName || 'Admin'
      );
      Alert.alert('Rejected', `${applicant.fullName}'s application has been rejected.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryDark} />
        <Text style={styles.loadingText}>Loading applicant details...</Text>
      </SafeAreaView>
    );
  }

  if (!applicant) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        <Text style={styles.notFoundTitle}>Applicant Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Avatar */}
        <View style={styles.headerCard}>
          <Avatar name={applicant.fullName} imageUrl={applicant.avatarUrl} size={70} />
          <Text style={styles.fullName}>{applicant.fullName}</Text>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>PENDING VERIFICATION</Text>
          </View>
        </View>

        {/* Application Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Applicant Information</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoVal}>{applicant.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoVal}>{applicant.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Community Name</Text>
              <Text style={styles.infoVal}>{applicant.communityName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="home-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>House / Flat Number</Text>
              <Text style={styles.infoVal}>{applicant.houseNumber}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Area / Sector</Text>
              <Text style={styles.infoVal}>{applicant.area}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primaryDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Registration Date</Text>
              <Text style={styles.infoVal}>{applicant.joinedDate}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      {applicant.verificationStatus === 'pending' ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => setRejectModalVisible(true)}
            disabled={actionLoading}
          >
            <Ionicons name="close" size={18} color={COLORS.white} />
            <Text style={styles.actionBtnText}>Reject Member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveBtn}
            onPress={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color={COLORS.white} />
                <Text style={styles.actionBtnText}>Approve Member</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Reject Confirmation Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="alert-circle" size={44} color="#DC2626" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Reject Membership?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to reject this application? The user will be notified of the rejection.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmRejectBtn}
                onPress={handleRejectConfirm}
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
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 10,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
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
  footer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  approveBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#047857',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
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
