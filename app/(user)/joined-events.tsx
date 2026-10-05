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
import { CommunityEvent, EventType } from '../../types/event';
import { eventService } from '../../services/eventService';

export default function JoinedEventsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [joinedEvents, setJoinedEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadJoinedEvents = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await eventService.getJoinedEvents(currentUser.id);
      setJoinedEvents(data);
    } catch (err) {
      console.error('Failed to load joined events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      loadJoinedEvents();
    }, [loadJoinedEvents])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await loadJoinedEvents();
  };

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

  const renderEventCard = ({ item }: { item: CommunityEvent }) => {
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
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{formatEventType(item.type)}</Text>
            </View>
            <View style={styles.joinedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#047857" style={{ marginRight: 3 }} />
              <Text style={styles.joinedBadgeText}>Registered</Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primaryDark} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {item.date} • {item.startTime}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.primaryDark} style={styles.infoIcon} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.participantCountRow}>
              <Ionicons name="people" size={15} color={COLORS.primaryDark} />
              <Text style={styles.participantCountText}>
                {item.participantIds.length} members joined
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Joined Events</Text>
        <Text style={styles.headerSubtitle}>
          Events and community activities you are currently registered to attend.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={styles.loadingText}>Fetching your registered events...</Text>
        </View>
      ) : (
        <FlatList
          data={joinedEvents}
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
              <Ionicons name="calendar-clear-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>You haven't joined any events yet.</Text>
              <Text style={styles.emptySubtitle}>
                Discover community clean-ups, workshops, meetings, and sports activities happening near you.
              </Text>

              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.push(ROUTES.EVENTS as any)}
              >
                <Text style={styles.exploreBtnText}>Explore Events</Text>
              </TouchableOpacity>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
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
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardContent: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  joinedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  participantCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantCountText: {
    fontSize: 12,
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
  exploreBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
