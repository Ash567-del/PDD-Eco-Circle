import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Input } from '../../components/forms/Input';
import { resourceService } from '../../services/resourceService';
import { requestService } from '../../services/requestService';
import { ResourceItem } from '../../types/resource';
import { ResourceRequest } from '../../types/request';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';

export default function ResourceDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [resource, setResource] = useState<ResourceItem | null>(null);
  const [existingRequest, setExistingRequest] = useState<ResourceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Request Message Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (id) {
      const item = await resourceService.getResourceById(id);
      setResource(item);

      if (item && currentUser) {
        const req = await requestService.getExistingUserRequest(item.id, currentUser.id);
        setExistingRequest(req);
      }
    }
    setLoading(false);
  }, [id, currentUser]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const isOwner = currentUser && resource && currentUser.id === resource.ownerId;

  const handleOpenRequestModal = () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to request this resource.');
      return;
    }
    setModalVisible(true);
  };

  const handleSendRequest = async () => {
    if (!resource || !currentUser) return;

    setSubmittingRequest(true);
    const res = await requestService.createRequest(resource.id, currentUser, message);
    setSubmittingRequest(false);

    if (res.success && res.request) {
      setModalVisible(false);
      setMessage('');
      await fetchDetails();
      await refreshData();
      Alert.alert('Request Sent!', 'Your resource request has been sent to the owner.', [
        {
          text: 'View My Requests',
          onPress: () => router.push(ROUTES.MY_RESOURCE_REQUESTS as any),
        },
      ]);
    } else {
      Alert.alert('Request Failed', res.message || 'Unable to submit request.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </SafeAreaView>
    );
  }

  if (!resource) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.accentRose} />
        <Text style={styles.notFoundTitle}>Resource Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          The requested community item may have been removed or is unavailable.
        </Text>
        <Button title="Back to Resources" onPress={() => router.back()} style={{ width: 200, marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Large Resource Image */}
        <Image source={{ uri: resource.imageUrl }} style={styles.image} resizeMode="cover" />

        <View style={styles.contentContainer}>
          {/* Header & Badges */}
          <View style={styles.topBadgesRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{resource.category}</Text>
            </View>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>Condition: {resource.condition}</Text>
            </View>
            <StatusBadge status={resource.status} />
          </View>

          <Text style={styles.title}>{resource.title}</Text>
          <Text style={styles.postedTime}>Posted {resource.createdAt}</Text>

          {/* Item Description */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Item Description</Text>
            <Text style={styles.descriptionText}>{resource.description}</Text>
          </Card>

          {/* Location & Community */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pickup & Location Details</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={18} color={COLORS.primaryDark} />
              <Text style={styles.infoText}>{resource.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={18} color={COLORS.primaryDark} />
              <Text style={styles.infoText}>{resource.communityName}</Text>
            </View>
          </Card>

          {/* Owner Info Section */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Shared by</Text>
            <View style={styles.ownerRow}>
              <View style={styles.ownerAvatarCircle}>
                <Ionicons name="person" size={24} color={COLORS.primaryDark} />
              </View>
              <View style={styles.ownerInfoWrapper}>
                <Text style={styles.ownerName}>{resource.ownerName}</Text>
                <View style={styles.verifiedRow}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                  <Text style={styles.verifiedText}>Verified Community Member</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Action Buttons Logic based on Owner vs Requester & Status */}
          {isOwner ? (
            <Card style={styles.ownerCard}>
              <Text style={styles.ownerNoticeTitle}>⭐ You own this shared resource</Text>
              <View style={styles.ownerActionRow}>
                <Button
                  title="Edit Resource"
                  variant="outline"
                  onPress={() =>
                    router.push({
                      pathname: ROUTES.EDIT_RESOURCE as any,
                      params: { id: resource.id },
                    })
                  }
                  style={{ flex: 1, marginRight: 6 }}
                />
                <Button
                  title="View Requests"
                  onPress={() => router.push(ROUTES.RECEIVED_REQUESTS as any)}
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </View>
            </Card>
          ) : existingRequest ? (
            <Card style={styles.requestStatusCard}>
              <Text style={styles.requestStatusHeader}>Your Request Status:</Text>
              <StatusBadge status={existingRequest.status} />

              {existingRequest.status === 'accepted' && (
                <Button
                  title="Contact Owner"
                  onPress={() =>
                    router.push({
                      pathname: ROUTES.CONTACT_OWNER as any,
                      params: { requestId: existingRequest.id },
                    })
                  }
                  style={{ marginTop: 14 }}
                />
              )}

              {existingRequest.status === 'pending' && (
                <Text style={styles.pendingNote}>
                  Your request is waiting for the owner's response.
                </Text>
              )}
            </Card>
          ) : (
            <Button
              title="Request This Resource"
              onPress={handleOpenRequestModal}
              disabled={resource.status !== 'available'}
              style={{ marginTop: 10, marginBottom: 20 }}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal for Request Message */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Resource</Text>
              <Ionicons
                name="close"
                size={24}
                color={COLORS.text}
                onPress={() => setModalVisible(false)}
              />
            </View>

            <Text style={styles.modalSub}>
              Item: <Text style={{ fontWeight: '700', color: COLORS.text }}>{resource.title}</Text>
            </Text>

            <Input
              label="Short Message to Owner (Optional)"
              placeholder="e.g. I would like this study table for my child's homework..."
              multiline
              numberOfLines={4}
              maxLength={500}
              value={message}
              onChangeText={setMessage}
            />
            <Text style={styles.charCount}>{message.length}/500 characters</Text>

            <View style={styles.modalActionsRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Send Request"
                onPress={handleSendRequest}
                loading={submittingRequest}
                style={{ flex: 2, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.background },
  loadingText: { fontSize: 13, color: COLORS.textMuted, marginTop: 10 },
  notFoundTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  notFoundSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
  scrollContent: { paddingBottom: 36 },
  image: { width: '100%', height: 250, backgroundColor: COLORS.primaryLight },
  contentContainer: { padding: 18 },
  topBadgesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  categoryBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },
  conditionBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  conditionText: { fontSize: 12, fontWeight: '600', color: COLORS.accentBlue },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  postedTime: { fontSize: 12, color: COLORS.textMuted, marginBottom: 16 },
  sectionCard: { padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  descriptionText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  infoText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ownerAvatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  ownerInfoWrapper: { flex: 1 },
  ownerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  verifiedText: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '600' },
  ownerCard: { padding: 16, marginBottom: 16, backgroundColor: COLORS.primaryLight },
  ownerNoticeTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 12 },
  ownerActionRow: { flexDirection: 'row' },
  requestStatusCard: { padding: 16, marginBottom: 16, alignItems: 'center' },
  requestStatusHeader: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  pendingNote: { fontSize: 12, color: COLORS.textMuted, marginTop: 10, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  modalSub: { fontSize: 13, color: COLORS.textMuted, marginBottom: 14 },
  charCount: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginTop: -8, marginBottom: 14 },
  modalActionsRow: { flexDirection: 'row' },
});
