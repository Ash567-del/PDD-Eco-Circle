import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { resourceService } from '../../services/resourceService';
import { requestService } from '../../services/requestService';
import { adminActivityService } from '../../services/adminActivityService';
import { ResourceItem } from '../../types/resource';

export default function AdminResourceDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { sendNotification, refreshData } = useAppData();

  const [resource, setResource] = useState<ResourceItem | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!params.id) return;
    try {
      const res = await resourceService.getResourceById(params.id);
      setResource(res);

      if (res) {
        const reqs = await requestService.getRequestsForResource(res.id);
        setRequestCount(reqs.length);
      }
    } catch (err) {
      console.error('Failed to load resource details:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [fetchDetails])
  );

  const handleRemoveConfirm = async () => {
    if (!resource) return;
    setModalVisible(false);
    setActionLoading(true);
    try {
      const res = await resourceService.adminRemoveResource(resource.id);
      if (res.success) {
        await refreshData();
        await sendNotification({
          userId: resource.ownerId,
          type: 'general',
          title: 'Resource Moderation Update',
          message: `Your shared resource '${resource.title}' was removed by a community administrator.`,
        });
        await adminActivityService.logActivity(
          'Resource Removed',
          `${currentUser?.fullName || 'Admin'} removed resource '${resource.title}'.`,
          'resource',
          currentUser?.fullName || 'Admin'
        );

        Alert.alert('Removed', 'Resource has been removed from the community.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', res.message || 'Failed to remove resource.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to remove resource.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryDark} />
        <Text style={styles.loadingText}>Loading resource details...</Text>
      </SafeAreaView>
    );
  }

  if (!resource) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        <Text style={styles.notFoundTitle}>Resource Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{
            uri: resource.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19655?w=600',
          }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{resource.category}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{resource.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.title}>{resource.title}</Text>
          <Text style={styles.communityTag}>{resource.communityName}</Text>

          {/* Details Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoGridRow}>
              <Ionicons name="person-outline" size={18} color={COLORS.primaryDark} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Owner Name</Text>
                <Text style={styles.infoVal}>{resource.ownerName}</Text>
              </View>
            </View>

            <View style={styles.infoGridRow}>
              <Ionicons name="location-outline" size={18} color={COLORS.primaryDark} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoVal}>{resource.location}</Text>
              </View>
            </View>

            <View style={styles.infoGridRow}>
              <Ionicons name="sparkles-outline" size={18} color={COLORS.primaryDark} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Condition</Text>
                <Text style={styles.infoVal}>{resource.condition}</Text>
              </View>
            </View>

            <View style={styles.infoGridRow}>
              <Ionicons name="hand-right-outline" size={18} color={COLORS.primaryDark} />
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Requests Received</Text>
                <Text style={styles.infoVal}>{requestCount} request(s)</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{resource.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Remove Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => setModalVisible(true)}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.removeBtnText}>Remove Resource</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Removal Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="trash" size={44} color="#DC2626" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Remove Resource?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove this resource from the community? The owner will be notified.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmRemoveBtn}
                onPress={handleRemoveConfirm}
              >
                <Text style={styles.modalConfirmRemoveBtnText}>Remove</Text>
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
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  communityTag: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 12,
  },
  infoGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
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
  descCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  removeBtn: {
    height: 48,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  removeBtnText: {
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
  modalConfirmRemoveBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmRemoveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
