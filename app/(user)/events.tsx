import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { CommunityEvent, EventStatus, EventType } from '../../types/event';
import { eventService } from '../../services/eventService';

type FilterTab = 'All' | 'Upcoming' | 'Joined' | 'Past';

export default function EventsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [activeTab, setActiveTab] = useState<FilterTab>('Upcoming');
  const [eventsList, setEventsList] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadEvents = useCallback(async () => {
    try {
      const data = await eventService.getEvents();
      setEventsList(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await loadEvents();
  };

  const getFilteredEvents = () => {
    if (!currentUser) return [];

    switch (activeTab) {
      case 'Upcoming':
        return eventsList.filter((e) => e.status === 'upcoming' || e.status === 'ongoing');
      case 'Joined':
        return eventsList.filter((e) => e.participantIds.includes(currentUser.id));
      case 'Past':
        return eventsList.filter((e) => e.status === 'completed');
      case 'All':
      default:
        return eventsList;
    }
  };

  const filteredEvents = getFilteredEvents();

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

  const getTypeBadgeColor = (type: EventType) => {
    switch (type) {
      case 'clean_up':
        return { bg: '#D1FAE5', text: '#047857' };
      case 'meeting':
        return { bg: '#E0F2FE', text: '#0284C7' };
      case 'workshop':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'sports':
        return { bg: '#FCE7F3', text: '#DB2777' };
      case 'awareness':
        return { bg: '#EDE9FE', text: '#7C3AED' };
      case 'social':
        return { bg: '#FFEDD5', text: '#C2410C' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

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
      default:
        return { label: status, bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const renderEventCard = ({ item }: { item: CommunityEvent }) => {
    const isJoined = currentUser ? item.participantIds.includes(currentUser.id) : false;
    const typeStyle = getTypeBadgeColor(item.type);
    const statusStyle = getStatusBadge(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: ROUTES.EVENT_DETAILS as any,
            params: { id: item.id },
          })
        }
      >
        <Image
          source={{
            uri: item.imageUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600',
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        <View style={styles.cardContent}>
          {/* Header Badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: typeStyle.bg }]}>
              <Text style={[styles.badgeText, { color: typeStyle.text }]}>
                {formatEventType(item.type)}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {statusStyle.label}
              </Text>
            </View>

            {isJoined && (
              <View style={[styles.badge, styles.joinedBadge]}>
                <Ionicons name="checkmark-circle" size={12} color="#047857" style={{ marginRight: 2 }} />
                <Text style={styles.joinedBadgeText}>Joined</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Details */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.primaryDark} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {item.date} • {item.startTime}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={15} color={COLORS.primaryDark} style={styles.infoIcon} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={15} color={COLORS.textMuted} style={styles.infoIcon} />
            <Text style={styles.infoSubText}>Organized by {item.organizerName}</Text>
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.participantCountRow}>
              <Ionicons name="people" size={16} color={COLORS.primaryDark} />
              <Text style={styles.participantCountText}>
                {item.participantIds.length}
                {item.maxParticipants ? ` / ${item.maxParticipants}` : ''} members joined
              </Text>
            </View>

            <Text style={styles.viewDetailsText}>View Details ›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Community Events</Text>
            <Text style={styles.headerSubtitle}>
              Discover activities and events happening in your community.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.joinedBtn}
            onPress={() => router.push(ROUTES.JOINED_EVENTS as any)}
          >
            <Ionicons name="bookmark" size={16} color={COLORS.primaryDark} />
            <Text style={styles.joinedBtnText}>My Joined</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          {(['Upcoming', 'Joined', 'Past', 'All'] as FilterTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, isActive && styles.activeFilterChip]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={styles.loadingText}>Loading community events...</Text>
        </View>
      ) : (
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
              <Text style={styles.emptyTitle}>No community events available</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'Joined'
                  ? "You haven't joined any community events yet."
                  : 'Check back later for newly scheduled activities.'}
              </Text>
              {activeTab === 'Joined' && (
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => setActiveTab('Upcoming')}
                >
                  <Text style={styles.emptyBtnText}>Browse Upcoming Events</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  joinedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 8,
  },
  joinedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    marginLeft: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeFilterChip: {
    backgroundColor: COLORS.primaryDark,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeFilterChipText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
  },
  joinedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 8,
    width: 18,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  infoSubText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  participantCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
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
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyBtn: {
    marginTop: 18,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
