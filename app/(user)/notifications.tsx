import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { AppNotification, NotificationType } from '../../types/notification';

export default function NotificationsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    notifications,
    unreadNotifCount,
    refreshData,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationItem,
  } = useAppData();

  const [refreshing, setRefreshing] = useState(false);

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

  const handleNotificationPress = async (item: AppNotification) => {
    // 1. Mark as read
    if (item.status === 'unread') {
      await markNotificationAsRead(item.id);
    }

    // 2. Safe navigation map
    switch (item.type) {
      case 'resource_request':
        router.push(ROUTES.RECEIVED_REQUESTS as any);
        break;

      case 'request_accepted':
      case 'request_rejected':
        router.push(ROUTES.MY_RESOURCE_REQUESTS as any);
        break;

      case 'event_joined':
      case 'event_reminder':
        if (item.relatedId) {
          router.push({
            pathname: ROUTES.EVENT_DETAILS as any,
            params: { id: item.relatedId },
          });
        } else {
          router.push(ROUTES.EVENTS as any);
        }
        break;

      case 'community_announcement':
        router.push(ROUTES.ANNOUNCEMENTS as any);
        break;

      case 'post_comment':
      case 'post_like':
        if (item.relatedId) {
          router.push({
            pathname: ROUTES.POST_DETAILS as any,
            params: { id: item.relatedId },
          });
        } else {
          router.push(ROUTES.COMMUNITY as any);
        }
        break;

      case 'problem_update':
        if (item.relatedId) {
          router.push({
            pathname: ROUTES.PROBLEM_DETAILS as any,
            params: { id: item.relatedId },
          });
        } else {
          router.push(ROUTES.MY_PROBLEMS as any);
        }
        break;

      default:
        // general / fallback
        break;
    }
  };

  const handleDelete = (item: AppNotification) => {
    Alert.alert('Delete Notification', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNotificationItem(item.id);
        },
      },
    ]);
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'resource_request':
        return { icon: 'hand-right', color: COLORS.accentAmber, bg: '#FEF3C7' };
      case 'request_accepted':
        return { icon: 'checkmark-circle', color: '#047857', bg: '#D1FAE5' };
      case 'request_rejected':
        return { icon: 'close-circle', color: '#DC2626', bg: '#FEE2E2' };
      case 'event_joined':
      case 'event_reminder':
        return { icon: 'calendar', color: COLORS.primaryDark, bg: '#D1FAE5' };
      case 'community_announcement':
        return { icon: 'megaphone', color: '#9F1239', bg: '#FFE4E6' };
      case 'post_comment':
        return { icon: 'chatbubble-ellipses', color: COLORS.accentBlue, bg: '#E0F2FE' };
      case 'post_like':
        return { icon: 'heart', color: '#DB2777', bg: '#FCE7F3' };
      case 'problem_update':
        return { icon: 'warning', color: '#7C3AED', bg: '#EDE9FE' };
      default:
        return { icon: 'notifications', color: COLORS.primaryDark, bg: '#F1F5F9' };
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  const userNotifications = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id)
    : [];

  const renderNotificationCard = ({ item }: { item: AppNotification }) => {
    const isUnread = item.status === 'unread';
    const iconConfig = getIconForType(item.type);

    return (
      <TouchableOpacity
        style={[styles.card, isUnread ? styles.unreadCard : styles.readCard]}
        activeOpacity={0.85}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.icon as any} size={20} color={iconConfig.color} />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.title, isUnread ? styles.unreadTitle : styles.readTitle]}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>

          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadNotifCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadNotifCount} new</Text>
            </View>
          )}
        </View>

        {unreadNotifCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllNotificationsAsRead}>
            <Ionicons name="checkmark-done" size={16} color={COLORS.primaryDark} />
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={userNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationCard}
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
            <Ionicons name="notifications-off-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No notifications yet.</Text>
            <Text style={styles.emptySubtitle}>
              Important community updates, item request alerts, and event reminders will appear here.
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  countBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  unreadCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
  },
  readCard: {
    backgroundColor: COLORS.white,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
  },
  unreadTitle: {
    fontWeight: '800',
    color: COLORS.text,
  },
  readTitle: {
    fontWeight: '600',
    color: COLORS.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryDark,
  },
  message: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 4,
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
});
