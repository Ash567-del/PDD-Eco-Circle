import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PostCard } from '../../components/community/PostCard';
import { communityService } from '../../services/communityService';
import { CommunityPost } from '../../types/community';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';

export default function MyPostsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyPosts = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const list = await communityService.getPostsByAuthor(currentUser.id);
    setMyPosts(list);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyPosts();
    await refreshData();
    setRefreshing(false);
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>My Posts</Text>
        <Text style={styles.headerSubtitle}>
          Manage updates, discussions, and advice you have posted.
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading your posts...</Text>
        </View>
      ) : (
        <FlatList
          data={myPosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="document-text-outline" size={40} color={COLORS.primaryDark} />
              </View>
              <Text style={styles.emptyTitle}>No Community Posts Yet</Text>
              <Text style={styles.emptySubtitle}>
                You haven't published any community posts yet. Share news, tips, or ask your neighbors a question!
              </Text>
              <Button
                title="Create Your First Post"
                onPress={() => router.push(ROUTES.CREATE_POST as any)}
                style={{ marginTop: 18, width: 220 }}
              />
            </View>
          }
          renderItem={({ item }) => (
            <PostCard post={item} isLiked={item.likedBy?.includes(currentUser.id)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBox: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  listContent: { padding: 16, paddingBottom: 36 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loaderText: { fontSize: 13, color: COLORS.textMuted, marginTop: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyIconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
});
