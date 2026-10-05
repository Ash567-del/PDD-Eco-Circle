import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAppData } from '../../contexts/AppDataContext';
import { ResourceItem, ResourceAvailabilityStatus } from '../../types/resource';

type StatusFilter = 'All' | 'Available' | 'Requested' | 'Reserved' | 'Collected';

export default function AdminResourcesScreen() {
  const router = useRouter();
  const { resources, refreshData } = useAppData();

  const [activeTab, setActiveTab] = useState<StatusFilter>('All');
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

  const getFilteredResources = () => {
    let list = resources;

    if (activeTab !== 'All') {
      const targetStatus = activeTab.toLowerCase() as ResourceAvailabilityStatus;
      list = list.filter((r) => r.status === targetStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.ownerName.toLowerCase().includes(q) ||
          r.communityName.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredList = getFilteredResources();

  const getStatusBadge = (status: ResourceAvailabilityStatus) => {
    switch (status) {
      case 'available':
        return { label: 'Available', bg: '#D1FAE5', text: '#047857' };
      case 'requested':
        return { label: 'Requested', bg: '#FEF3C7', text: '#D97706' };
      case 'reserved':
        return { label: 'Reserved', bg: '#E0F2FE', text: '#0284C7' };
      case 'collected':
      default:
        return { label: 'Collected', bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const renderResourceCard = ({ item }: { item: ResourceItem }) => {
    const badgeStyle = getStatusBadge(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: ROUTES.ADMIN_RESOURCE_DETAILS as any,
            params: { id: item.id },
          })
        }
      >
        <Image
          source={{
            uri: item.imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19655?w=600',
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
              <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
                {badgeStyle.label}
              </Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.infoText}>Owner: {item.ownerName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.conditionText}>Condition: {item.condition}</Text>
            <Text style={styles.viewDetailsText}>View Details ›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Search & Tabs */}
      <View style={styles.headerArea}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, category, owner..."
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

        <View style={styles.tabsRow}>
          {(['All', 'Available', 'Requested', 'Reserved', 'Collected'] as StatusFilter[]).map(
            (tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabChip, isActive && styles.activeTabChip]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabChipText, isActive && styles.activeTabChipText]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>
      </View>

      {/* Resource List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={renderResourceCard}
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
            <Ionicons name="cube-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No resources found.</Text>
            <Text style={styles.emptySubtitle}>
              No items matching current search and status filters.
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
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
    gap: 14,
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
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.text,
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
  conditionText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
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
