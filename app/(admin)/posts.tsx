import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAppData } from '../../contexts/AppDataContext';
import { CommunityPost, PostType } from '../../types/community';

type FilterTab = 'All' | 'General' | 'Information' | 'Announcement' | 'Question' | 'Recommendation' | 'Community Help';

export default function AdminPostsScreen() {
  const router = useRouter();
  const { posts, refreshData } = useAppData();

  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
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

  const getFilteredPosts = () => {
    let list = posts;

    if (activeTab !== 'All') {
      const typeMap: Record<FilterTab, string> = {
        All: 'All',
        General: 'general',
        Information: 'information',
        Announcement: 'announcement',
        Question: 'question',
        Recommendation: 'recommendation',
        'Community Help': 'community_help',
      };
      const targetType = typeMap[activeTab];
      list = list.filter((p) => p.type === targetType || (activeTab === 'Announcement' && p.isAnnouncement));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredList = getFilteredPosts();

  const renderPostCard = ({ item }: { item: CommunityPost }) => {
    const isAnn = item.isAnnouncement || item.type === 'announcement';

    return (
      <TouchableOpacity
        style={[styles.card, isAnn && styles.announcementCard]}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: ROUTES.ADMIN_POST_DETAILS as any,
            params: { id: item.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, isAnn && styles.annBadge]}>
            <Text style={[styles.typeBadgeText, isAnn && styles.annBadgeText]}>
              {isAnn ? 'ANNOUNCEMENT' : item.type.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.createdAt}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.authorText}>By {item.authorName} • {item.communityName}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.statsRow}>
            <Ionicons name="heart-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>{item.likeCount}</Text>
            <Ionicons name="chatbubble-outline" size={14} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
            <Text style={styles.statText}>{item.commentCount}</Text>
          </View>

          <Text style={styles.viewDetailsText}>View Post ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Search & Create Announcement Button */}
      <View style={styles.headerArea}>
        <View style={styles.headerTopRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title, author, content..."
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
            style={styles.createAnnBtn}
            onPress={() => router.push(ROUTES.ADMIN_CREATE_ANNOUNCEMENT as any)}
          >
            <Ionicons name="add" size={16} color={COLORS.white} />
            <Text style={styles.createAnnBtnText}>Announcement</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <FlatList
          data={['All', 'Announcement', 'Information', 'Question', 'Recommendation', 'Community Help', 'General'] as FilterTab[]}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = activeTab === item;
            return (
              <TouchableOpacity
                style={[styles.tabChip, isActive && styles.activeTabChip]}
                onPress={() => setActiveTab(item)}
              >
                <Text style={[styles.tabChipText, isActive && styles.activeTabChipText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ gap: 6 }}
        />
      </View>

      {/* Post List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={renderPostCard}
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
            <Ionicons name="newspaper-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No posts found.</Text>
            <Text style={styles.emptySubtitle}>
              No community posts or announcements matching your search query.
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
  createAnnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9F1239',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    gap: 4,
  },
  createAnnBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
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
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  announcementCard: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
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
    fontSize: 11,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  authorText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
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
});
