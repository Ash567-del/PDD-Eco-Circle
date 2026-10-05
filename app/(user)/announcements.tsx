import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from '../../components/community/PostCard';
import { communityService } from '../../services/communityService';
import { CommunityPost } from '../../types/community';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

export default function AnnouncementsScreen() {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const list = await communityService.getAnnouncements();
    setAnnouncements(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <Ionicons name="megaphone" size={24} color="#9F1239" />
          <Text style={styles.headerTitle}>Official Announcements</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Important notices, water/power maintenance, and security reminders from Community Admin.
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading announcements...</Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Official Announcements</Text>
              <Text style={styles.emptySubtitle}>There are currently no active community announcements.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostCard post={item} isLiked={currentUser ? item.likedBy?.includes(currentUser.id) : false} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBox: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, lineHeight: 18 },
  listContent: { padding: 16, paddingBottom: 36 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loaderText: { fontSize: 13, color: COLORS.textMuted, marginTop: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 12, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
});
