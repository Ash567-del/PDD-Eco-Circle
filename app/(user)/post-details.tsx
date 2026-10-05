import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/forms/Input';
import { communityService } from '../../services/communityService';
import { CommunityPost, PostComment } from '../../types/community';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';

export default function PostDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);

  // Comment input state
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const fetchPostAndComments = useCallback(async () => {
    if (!id) return;
    const p = await communityService.getPostById(id);
    if (p) {
      setPost(p);
      const cList = await communityService.getComments(id);
      setComments(cList);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const isLiked = currentUser && post ? post.likedBy?.includes(currentUser.id) : false;
  const isAuthor = currentUser && post ? currentUser.id === post.authorId : false;

  const handleToggleLike = async () => {
    if (!currentUser || !post) {
      Alert.alert('Login Required', 'Please log in to like posts.');
      return;
    }

    const { liked, newCount } = await communityService.toggleLike(post.id, currentUser.id);
    setPost({
      ...post,
      likeCount: newCount,
      likedBy: liked ? [...post.likedBy, currentUser.id] : post.likedBy.filter((i) => i !== currentUser.id),
    });
  };

  const handleAddComment = async () => {
    if (!currentUser || !post) {
      Alert.alert('Login Required', 'Please log in to post comments.');
      return;
    }

    if (!commentText.trim()) {
      Alert.alert('Validation Error', 'Comment cannot be empty.');
      return;
    }

    setPostingComment(true);
    const res = await communityService.addComment(post.id, currentUser, commentText);
    setPostingComment(false);

    if (res.success && res.comment) {
      setCommentText('');
      setComments([res.comment, ...comments]);
      setPost({ ...post, commentCount: post.commentCount + 1 });
      await refreshData();
    } else {
      Alert.alert('Error', res.message || 'Unable to post comment.');
    }
  };

  const handleDeletePost = () => {
    if (!post || !currentUser) return;

    Alert.alert('Delete Post', 'Are you sure you want to delete this community post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await communityService.deletePost(post.id, currentUser.id);
          if (res.success) {
            await refreshData();
            Alert.alert('Deleted', 'Post removed successfully.');
            router.back();
          } else {
            Alert.alert('Error', res.message || 'Unable to delete post.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading post details...</Text>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.accentRose} />
        <Text style={styles.notFoundTitle}>Post Not Found</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ width: 180, marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Post Main Body */}
        <Card style={[styles.card, post.isAnnouncement ? styles.announcementCard : undefined]}>
          <View style={styles.authorRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{post.authorName}</Text>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
              </View>
              <Text style={styles.timeText}>{post.createdAt} • {post.communityName}</Text>
            </View>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.content}>{post.content}</Text>

          {post.imageUrl ? (
            <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : null}

          {/* Action Row: Like Button & Comment Counter */}
          <View style={styles.metricsRow}>
            <Pressable style={styles.likeButton} onPress={handleToggleLike}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? COLORS.accentRose : COLORS.textMuted}
              />
              <Text style={[styles.metricText, isLiked ? styles.likedText : null]}>
                {post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}
              </Text>
            </Pressable>

            <View style={styles.metricItem}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.textMuted} />
              <Text style={styles.metricText}>
                {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
              </Text>
            </View>
          </View>

          {/* Author Owner Actions */}
          {isAuthor && (
            <View style={styles.ownerActionsRow}>
              <Button
                title="Edit Post"
                variant="outline"
                onPress={() =>
                  router.push({
                    pathname: ROUTES.EDIT_POST as any,
                    params: { id: post.id },
                  })
                }
                style={{ flex: 1, marginRight: 6 }}
              />
              <Button
                title="Delete Post"
                variant="danger"
                onPress={handleDeletePost}
                style={{ flex: 1, marginLeft: 6 }}
              />
            </View>
          )}
        </Card>

        {/* Add Comment Input Card */}
        <Card style={styles.commentInputCard}>
          <Text style={styles.commentHeaderTitle}>Add to the Discussion</Text>
          <Input
            label=""
            placeholder="Write a comment..."
            iconName="chatbubble-ellipses-outline"
            value={commentText}
            onChangeText={setCommentText}
            maxLength={300}
          />
          <Button
            title="Post Comment"
            onPress={handleAddComment}
            loading={postingComment}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Comments List Section */}
        <Text style={styles.commentsSectionHeader}>Comments ({comments.length})</Text>

        {comments.length === 0 ? (
          <Card style={styles.emptyCommentsCard}>
            <Text style={styles.emptyCommentsText}>No comments yet. Be the first to comment!</Text>
          </Card>
        ) : (
          comments.map((c) => (
            <Card key={c.id} style={styles.commentCard}>
              <View style={styles.commentAuthorRow}>
                <Ionicons name="person-circle-outline" size={22} color={COLORS.primaryDark} />
                <Text style={styles.commentAuthor}>{c.authorName}</Text>
                <Text style={styles.commentTime}>{c.createdAt}</Text>
              </View>
              <Text style={styles.commentText}>{c.content}</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.background },
  loadingText: { fontSize: 13, color: COLORS.textMuted, marginTop: 10 },
  notFoundTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  scrollContent: { padding: 18, paddingBottom: 36 },
  card: { padding: 18, marginBottom: 16 },
  announcementCard: { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  authorName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  timeText: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  content: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 14 },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 14, backgroundColor: COLORS.primaryLight },
  metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  likeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  likedText: { color: COLORS.accentRose },
  ownerActionsRow: { flexDirection: 'row', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  commentInputCard: { padding: 16, marginBottom: 20 },
  commentHeaderTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  commentsSectionHeader: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  emptyCommentsCard: { padding: 16, alignItems: 'center' },
  emptyCommentsText: { fontSize: 13, color: COLORS.textMuted, fontStyle: 'italic' },
  commentCard: { padding: 14, marginBottom: 10 },
  commentAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  commentTime: { fontSize: 11, color: COLORS.textMuted, marginLeft: 'auto' },
  commentText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
});
