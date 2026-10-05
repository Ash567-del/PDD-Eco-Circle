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
import { eventService } from '../../services/eventService';
import { adminActivityService } from '../../services/adminActivityService';
import { CommunityEvent, EventStatus, EventType } from '../../types/event';

type StatusTab = 'All' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export default function AdminEventsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { events, sendNotification, refreshData } = useAppData();

  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Cancellation Modal
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [targetEvent, setTargetEvent] = useState<CommunityEvent | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const promptCancel = (event: CommunityEvent) => {
    setTargetEvent(event);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetEvent) return;
    setCancelModalVisible(false);
    try {
      const res = await eventService.cancelEvent(targetEvent.id);
      if (res) {
        await refreshData();

        // Notify all registered participants
        for (const pid of targetEvent.participantIds) {
          if (pid !== currentUser?.id) {
            await sendNotification({
              userId: pid,
              type: 'event_reminder',
              title: 'Event Cancelled',
              message: `${targetEvent.title} has been cancelled by the community administrator.`,
              relatedId: targetEvent.id,
              relatedType: 'event',
            });
          }
        }

        await adminActivityService.logActivity(
          'Event Cancelled',
          `${currentUser?.fullName || 'Admin'} cancelled event '${targetEvent.title}'.`,
          'event',
          currentUser?.fullName || 'Admin'
        );

        Alert.alert('Event Cancelled', `${targetEvent.title} has been cancelled.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to cancel event.');
    }
  };

  const getFilteredEvents = () => {
    let list = events;

    if (activeTab !== 'All') {
      const targetStatus = activeTab.toLowerCase() as EventStatus;
      list = list.filter((e) => e.status === targetStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.organizerName.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredEvents = getFilteredEvents();

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'upcoming':
        return { label: 'Upcoming', bg: '#D1FAE5', text: '#047857' };
      case 'ongoing':
        return { label: 'Ongoing', bg: '#E0F2FE', text: '#0284C7' };
      case 'completed':
        return { label: 'Completed', bg: '#F1F5F9', text: '#64748B' };
      case 'cancelled':
        return { label: 'Cancelled', bg: '#FEE2E2', text: '#DC2626' };
    }
  };

  const renderEventCard = ({ item }: { item: CommunityEvent }) => {
    const statusStyle = getStatusBadge(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.type.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.primaryDark} />
          <Text style={styles.infoText}>
            {item.date} • {item.startTime} - {item.endTime}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.primaryDark} />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.infoSubText}>
            {item.participantIds.length} / {item.maxParticipants || '∞'} members registered
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: ROUTES.EVENT_DETAILS as any,
                params: { id: item.id },
              })
            }
          >
            <Text style={styles.actionBtnText}>View</Text>
          </TouchableOpacity>

          {item.status === 'upcoming' || item.status === 'ongoing' ? (
            <>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  router.push({
                    pathname: ROUTES.ADMIN_EDIT_EVENT as any,
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => promptCancel(item)}>
                <Text style={styles.cancelBtnText}>Cancel Event</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Search & Create Event Button */}
      <View style={styles.headerArea}>
        <View style={styles.headerTopRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events by title, location..."
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

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push(ROUTES.ADMIN_CREATE_EVENT as any)}
          >
            <Ionicons name="add" size={16} color={COLORS.white} />
            <Text style={styles.createBtnText}>+ Event</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.tabsRow}>
          {(['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'] as StatusTab[]).map(
            (tab) => {
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
            }
          )}
        </View>
      </View>

      {/* Main FlatList */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
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
            <Ionicons name="calendar-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No events found.</Text>
            <Text style={styles.emptySubtitle}>
              No community events matching your status and search filters.
            </Text>
          </View>
        }
      />

      {/* Cancel Event Modal */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="warning" size={44} color="#DC2626" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Cancel Event?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to cancel '{targetEvent?.title}'? All registered participants will receive a cancellation notification.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalKeepBtn}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalKeepBtnText}>Keep Active</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={handleConfirmCancel}
              >
                <Text style={styles.modalCancelBtnText}>Cancel Event</Text>
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
  headerTopRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    gap: 4,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  activeTabChip: {
    backgroundColor: COLORS.primaryDark,
  },
  tabChipText: {
    fontSize: 11,
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
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoSubText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#DC2626',
  },
  cancelBtnText: {
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
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
