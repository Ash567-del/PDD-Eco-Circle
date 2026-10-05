import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from '../../components/community/PostCard';
import { communityService } from '../../services/communityService';
import { CommunityPost, PostType } from '../../types/community';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';

const FILTER_TYPES: { label: string; value: PostType | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Information', value: 'information' },
  { label: 'Questions', value: 'question' },
  { label: 'Recommendations', value: 'recommendation' },
  { label: 'Community Help', value: 'community_help' },
  { label: 'Announcements', value: 'announcement' },
];

export default function CommunityScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedType, setSelectedType] = useState<PostType | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedPosts = useCallback(async () => {
    setLoading(true);
    const data = await communityService.getPostsByType(selectedType);
    setPosts(data);
    setLoading(false);
  }, [selectedType]);

  useEffect(() => {
    fetchFeedPosts();
  }, [fetchFeedPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeedPosts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header & Quick Access Shortcuts */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Community Feed</Text>
            <Text style={styles.headerSubtitle}>Stay connected with people in your community.</Text>
          </View>
        </View>

        {/* Quick Access Shortcuts Scrollable Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shortcutsRow}
        >
          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push(ROUTES.COMMUNITY_INFO as any)}
          >
            <Ionicons name="information-circle-outline" size={18} color={COLORS.primaryDark} />
            <Text style={styles.shortcutText}>Info</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push(ROUTES.ANNOUNCEMENTS as any)}
          >
            <Ionicons name="megaphone-outline" size={18} color="#9F1239" />
            <Text style={styles.shortcutText}>Alerts</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push(ROUTES.MY_POSTS as any)}
          >
            <Ionicons name="documents-outline" size={18} color={COLORS.accentBlue} />
            <Text style={styles.shortcutText}>My Posts</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push(ROUTES.EVENTS as any)}
          >
            <Ionicons name="calendar-outline" size={18} color="#D97706" />
            <Text style={styles.shortcutText}>Events</Text>
          </Pressable>

          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push(ROUTES.REPORT_PROBLEM as any)}
          >
            <Ionicons name="warning-outline" size={18} color="#DC2626" />
            <Text style={styles.shortcutText}>Report Problem</Text>
          </Pressable>
        </ScrollView>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContainer}
        >
          {FILTER_TYPES.map((ft) => {
            const isSelected = selectedType === ft.value;
            return (
              <Pressable
                key={ft.value}
                style={[styles.chip, isSelected ? styles.chipSelected : null]}
                onPress={() => setSelectedType(ft.value)}
              >
                <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                  {ft.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Feed List */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={styles.loaderText}>Loading community posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primaryDark]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Community Posts Yet</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to share an update, ask a question, or share helpful information!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              isLiked={currentUser ? item.likedBy?.includes(currentUser.id) : false}
            />
          )}
        />
      )}

      {/* Floating Create Post Button */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => router.push(ROUTES.CREATE_POST as any)}
        accessibilityLabel="Create Post"
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.floatingButtonText}>Create Post</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTopRow: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  shortcutsRow: {
    gap: 8,
    paddingBottom: 10,
  },
  shortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterChipsContainer: {
    paddingBottom: 10,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loaderText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
