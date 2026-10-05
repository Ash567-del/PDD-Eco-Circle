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
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { CommunityEvent, EventType, EventStatus } from '../../types/event';
import { eventService } from '../../services/eventService';

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Toast / Alert modal states
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!params.id) return;
    try {
      const data = await eventService.getEventById(params.id);
      setEvent(data);
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [fetchDetails])
  );

  const handleJoin = async () => {
    if (!currentUser || !event) return;
    setActionLoading(true);
    try {
      const res = await eventService.joinEvent(event.id, currentUser.id);
      if (res.success && res.event) {
        setEvent(res.event);
        await refreshData();
        setToastMessage("You're registered for this event!");
      } else {
        setToastMessage(res.message);
      }
    } catch (err) {
      setToastMessage('Failed to join event. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveConfirm = async () => {
    setModalVisible(false);
    if (!currentUser || !event) return;
    setActionLoading(true);
    try {
      const res = await eventService.leaveEvent(event.id, currentUser.id);
      if (res.success && res.event) {
        setEvent(res.event);
        await refreshData();
        setToastMessage('Your participation has been cancelled.');
      } else {
        setToastMessage(res.message);
      }
    } catch (err) {
      setToastMessage('Failed to cancel participation.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryDark} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        <Text style={styles.notFoundTitle}>Event Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          The requested community event does not exist or has been removed.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isJoined = currentUser ? event.participantIds.includes(currentUser.id) : false;
  const isFull = event.maxParticipants
    ? event.participantIds.length >= event.maxParticipants
    : false;

  const formatEventType = (type: EventType): string => {
    switch (type) {
      case 'clean_up':
        return 'Clean Up';
      case 'meeting':
        return 'Meeting';
      case 'workshop':
        return 'Workshop';
      case 'sports':
        return 'Sports';
      case 'awareness':
        return 'Awareness';
      case 'social':
        return 'Social';
      default:
        return 'Other';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Image */}
        <Image
          source={{
            uri: event.imageUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Content Section */}
        <View style={styles.content}>
          {/* Header Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{formatEventType(event.type)}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                event.status === 'upcoming' && { backgroundColor: '#D1FAE5' },
                event.status === 'ongoing' && { backgroundColor: '#E0F2FE' },
                event.status === 'completed' && { backgroundColor: '#F1F5F9' },
                event.status === 'cancelled' && { backgroundColor: '#FEE2E2' },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  event.status === 'upcoming' && { color: '#047857' },
                  event.status === 'ongoing' && { color: '#0284C7' },
                  event.status === 'completed' && { color: '#64748B' },
                  event.status === 'cancelled' && { color: '#DC2626' },
                ]}
              >
                {event.status.toUpperCase()}
              </Text>
            </View>

            {isJoined && (
              <View style={styles.joinedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#047857" style={{ marginRight: 4 }} />
                <Text style={styles.joinedBadgeText}>Joined ✓</Text>
              </View>
            )}
          </View>

          {/* Event Title */}
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.communityTag}>{event.communityName}</Text>

          {/* Toast Banner */}
          {toastMessage && (
            <View style={styles.toastBanner}>
              <Ionicons name="information-circle" size={18} color="#047857" />
              <Text style={styles.toastText}>{toastMessage}</Text>
              <TouchableOpacity onPress={() => setToastMessage(null)}>
                <Ionicons name="close" size={16} color="#047857" />
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Info Grid */}
          <View style={styles.infoCard}>
            <View style={styles.infoGridRow}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primaryDark} />
              <View style={styles.infoGridTextCol}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoVal}>{event.date}</Text>
              </View>
            </View>

            <View style={styles.infoGridRow}>
              <Ionicons name="time-outline" size={20} color={COLORS.primaryDark} />
              <View style={styles.infoGridTextCol}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoVal}>
                  {event.startTime} - {event.endTime}
                </Text>
              </View>
            </View>

            <View style={styles.infoGridRow}>
              <Ionicons name="location-outline" size={20} color={COLORS.primaryDark} />
              <View style={styles.infoGridTextCol}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoVal}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.infoGridRow}>
              <Ionicons name="person-outline" size={20} color={COLORS.primaryDark} />
              <View style={styles.infoGridTextCol}>
                <Text style={styles.infoLabel}>Organizer</Text>
                <Text style={styles.infoVal}>{event.organizerName}</Text>
              </View>
            </View>
          </View>

          {/* Capacity & Member Bar */}
          <View style={styles.capacitySection}>
            <View style={styles.capacityHeader}>
              <Text style={styles.sectionTitle}>Participants</Text>
              <Text style={styles.capacityCount}>
                {event.participantIds.length} / {event.maxParticipants || '∞'} members joined
              </Text>
            </View>

            {event.maxParticipants ? (
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(
                        100,
                        (event.participantIds.length / event.maxParticipants) * 100
                      )}%`,
                    },
                  ]}
                />
              </View>
            ) : null}
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer Action Area */}
      <View style={styles.footer}>
        {event.status === 'cancelled' ? (
          <View style={[styles.actionBtn, styles.disabledBtn]}>
            <Text style={styles.disabledBtnText}>Event Cancelled</Text>
          </View>
        ) : event.status === 'completed' ? (
          <View style={[styles.actionBtn, styles.disabledBtn]}>
            <Text style={styles.disabledBtnText}>Event Completed</Text>
          </View>
        ) : isJoined ? (
          <View style={styles.joinedActionCol}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelParticipationBtn]}
              onPress={() => setModalVisible(true)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="exit-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                  <Text style={styles.cancelParticipationBtnText}>Cancel Participation</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : isFull ? (
          <View style={[styles.actionBtn, styles.disabledBtn]}>
            <Text style={styles.disabledBtnText}>Event Full</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.joinBtn]}
            onPress={handleJoin}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="person-add" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.joinBtnText}>Join Event</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Confirmation Modal for Cancellation */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="warning-outline" size={44} color={COLORS.accentAmber} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Cancel Participation?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to leave this event? Your spot will be made available for other community members.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalKeepBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalKeepBtnText}>Keep My Spot</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalLeaveBtn}
                onPress={handleLeaveConfirm}
              >
                <Text style={styles.modalLeaveBtnText}>Cancel Participation</Text>
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  joinedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 28,
  },
  communityTag: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 14,
  },
  infoGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoGridTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 1,
  },
  capacitySection: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  capacityCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 4,
  },
  descSection: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: 8,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  joinBtn: {
    backgroundColor: COLORS.primaryDark,
  },
  joinBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  joinedActionCol: {
    width: '100%',
  },
  cancelParticipationBtn: {
    backgroundColor: '#DC2626',
  },
  cancelParticipationBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  disabledBtn: {
    backgroundColor: '#CBD5E1',
  },
  disabledBtnText: {
    color: '#64748B',
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
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalKeepBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalKeepBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalLeaveBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalLeaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
