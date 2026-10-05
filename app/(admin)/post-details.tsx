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
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { communityService } from '../../services/communityService';
import { adminActivityService } from '../../services/adminActivityService';
import { CommunityPost, PostComment } from '../../types/community';

export default function AdminPostDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { sendNotification, refreshData } = useAppData();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPostDetails = useCallback(async () => {
    if (!params.id) return;
    try {
      const data = await communityService.getPostById(params.id);
      setPost(data);
      if (data) {
        const cmts = await communityService.getComments(data.id);
        setComments(cmts);
      }
    } catch (err) {
      console.error('Failed to load post details:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      fetchPostDetails();
    }, [fetchPostDetails])
  );

  const handleRemoveConfirm = async () => {
    if (!post) return;
    setModalVisible(false);
    setActionLoading(true);
    try {
      const res = await communityService.adminRemovePost(post.id);
      if (res.success) {
        await refreshData();
        await sendNotification({
          userId: post.authorId,
          type: 'general',
          title: 'Post Moderation Update',
          message: `Your community post '${post.title}' was removed by an administrator.`,
        });
        await adminActivityService.logActivity(
          'Post Removed',
          `${currentUser?.fullName || 'Admin'} removed post '${post.title}' by ${post.authorName}.`,
          'post',
          currentUser?.fullName || 'Admin'
        );

        Alert.alert('Removed', 'Community post removed successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', res.message || 'Failed to remove post.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to remove post.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryDark} />
        <Text style={styles.loadingText}>Loading post details...</Text>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        <Text style={styles.notFoundTitle}>Post Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isAnn = post.isAnnouncement || post.type === 'announcement';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {post.imageUrl ? (
          <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : null}

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, isAnn && styles.annBadge]}>
              <Text style={[styles.typeBadgeText, isAnn && styles.annBadgeText]}>
                {isAnn ? 'ANNOUNCEMENT' : post.type.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.dateText}>{post.createdAt}</Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.authorSub}>
            Posted by <Text style={{ fontWeight: '700' }}>{post.authorName}</Text> • {post.communityName}
          </Text>

          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>{post.content}</Text>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>
              Comments ({comments.length})
            </Text>

            {comments.length > 0 ? (
              comments.map((cmt) => (
                <View key={cmt.id} style={styles.commentBox}>
                  <Text style={styles.cmtAuthor}>{cmt.authorName}</Text>
                  <Text style={styles.cmtText}>{cmt.content}</Text>
                  <Text style={styles.cmtDate}>{cmt.createdAt}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noCmtText}>No comments on this post yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Remove Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => setModalVisible(true)}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.removeBtnText}>Remove Community Post</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="trash" size={44} color="#DC2626" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Remove Community Post?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove this post from the community feed? The author will be notified.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmRemoveBtn}
                onPress={handleRemoveConfirm}
              >
                <Text style={styles.modalConfirmRemoveBtnText}>Remove</Text>
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
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 16,
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
    height: 200,
  },
  content: {
    padding: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  annBadge: {
    backgroundColor: '#FFE4E6',
  },
  annBadgeText: {
    color: '#9F1239',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  authorSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  bodyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  commentsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  commentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cmtAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  cmtText: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 2,
  },
  cmtDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  noCmtText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  removeBtn: {
    height: 48,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  removeBtnText: {
    color: COLORS.white,
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
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalConfirmRemoveBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmRemoveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
