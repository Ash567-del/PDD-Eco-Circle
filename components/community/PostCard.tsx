import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CommunityPost, PostType } from '../../types/community';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

interface PostCardProps {
  post: CommunityPost;
  isLiked?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isLiked = false }) => {
  const router = useRouter();

  const getTypeBadgeStyle = (type: PostType) => {
    switch (type) {
      case 'announcement':
        return { bg: '#FFE4E6', text: '#9F1239', label: 'ANNOUNCEMENT' };
      case 'information':
        return { bg: '#E0F2FE', text: COLORS.accentBlue, label: 'INFORMATION' };
      case 'question':
        return { bg: '#FEF3C7', text: '#92400E', label: 'QUESTION' };
      case 'recommendation':
        return { bg: COLORS.primaryLight, text: COLORS.primaryDark, label: 'RECOMMENDATION' };
      case 'community_help':
        return { bg: '#F3E8FF', text: '#6B21A8', label: 'COMMUNITY HELP' };
      case 'general':
      default:
        return { bg: '#F1F5F9', text: COLORS.textMuted, label: 'GENERAL' };
    }
  };

  const badgeInfo = getTypeBadgeStyle(post.type);

  const handlePress = () => {
    router.push({
      pathname: ROUTES.POST_DETAILS as any,
      params: { id: post.id },
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        post.isAnnouncement ? styles.announcementCard : null,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View post: ${post.title}`}
    >
      {/* Author & Header Row */}
      <View style={styles.authorRow}>
        <View style={styles.avatarCircle}>
          <Ionicons
            name={post.isAnnouncement ? 'megaphone' : 'person'}
            size={18}
            color={post.isAnnouncement ? '#9F1239' : COLORS.primaryDark}
          />
        </View>
        <View style={styles.authorInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
          </View>
          <Text style={styles.timeText}>{post.createdAt} • {post.communityName}</Text>
        </View>

        <View style={[styles.typeBadge, { backgroundColor: badgeInfo.bg }]}>
          <Text style={[styles.typeBadgeText, { color: badgeInfo.text }]}>{badgeInfo.label}</Text>
        </View>
      </View>

      {/* Post Title & Preview Content */}
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.contentPreview} numberOfLines={3}>
        {post.content}
      </Text>

      {/* Optional Post Image */}
      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
      ) : null}

      {/* Footer Metrics Row */}
      <View style={styles.footerRow}>
        <View style={styles.metricItem}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? COLORS.accentRose : COLORS.textMuted}
          />
          <Text style={[styles.metricText, isLiked ? styles.likedText : null]}>
            {post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="chatbubble-outline" size={17} color={COLORS.textMuted} />
          <Text style={styles.metricText}>
            {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  announcementCard: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
    borderLeftWidth: 4,
    borderLeftColor: '#F43F5E',
  },
  pressed: {
    opacity: 0.98,
    transform: [{ scale: 0.99 }],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  contentPreview: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.primaryLight,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  likedText: {
    color: COLORS.accentRose,
  },
});
