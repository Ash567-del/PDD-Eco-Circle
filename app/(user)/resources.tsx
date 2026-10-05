import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/common/Button';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { resourceService } from '../../services/resourceService';
import {
  ResourceItem,
  ResourceCategory,
  ResourceCondition,
  ResourceAvailabilityStatus,
} from '../../types/resource';
import { COLORS } from '../../constants/colors';

const CATEGORIES: (ResourceCategory | 'All')[] = [
  'All',
  'Furniture',
  'Books',
  'Electronics',
  'Clothing',
  'Kitchen',
  'Toys',
  'Other',
];

const CONDITIONS: (ResourceCondition | 'Any')[] = ['Any', 'New', 'Like New', 'Good', 'Used'];
const STATUSES: (ResourceAvailabilityStatus | 'Any')[] = ['Any', 'available', 'requested', 'reserved'];

export default function ResourcesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'All'>('All');
  const [selectedCondition, setSelectedCondition] = useState<ResourceCondition | 'Any'>('Any');
  const [selectedStatus, setSelectedStatus] = useState<ResourceAvailabilityStatus | 'Any'>('Any');

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFilteredResources = useCallback(async () => {
    setLoading(true);
    const data = await resourceService.filterResources({
      searchQuery,
      category: selectedCategory,
      condition: selectedCondition,
      status: selectedStatus,
    });
    setResources(data);
    setLoading(false);
  }, [searchQuery, selectedCategory, selectedCondition, selectedStatus]);

  useEffect(() => {
    fetchFilteredResources();
  }, [fetchFilteredResources]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFilteredResources();
    setRefreshing(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCondition('Any');
    setSelectedStatus('Any');
    setFilterModalVisible(false);
  };

  const hasActiveFilters =
    selectedCondition !== 'Any' || selectedStatus !== 'Any' || selectedCategory !== 'All';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header & Search Bar Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Find Resources</Text>
        <Text style={styles.headerSubtitle}>
          Discover useful items shared by people in your community.
        </Text>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Input
              label=""
              placeholder="Search resources..."
              iconName="search-outline"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Pressable
            style={[
              styles.filterIconButton,
              hasActiveFilters ? styles.filterActiveBtn : null,
            ]}
            onPress={() => setFilterModalVisible(true)}
            accessibilityLabel="Filter Options"
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={hasActiveFilters ? COLORS.white : COLORS.text}
            />
          </Pressable>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                style={[styles.chip, isSelected ? styles.chipSelected : null]}
                onPress={() => setSelectedCategory(cat)}
                accessibilityRole="button"
                accessibilityLabel={`Category filter ${cat}`}
              >
                <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Resource FlatList */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Searching community resources...</Text>
        </View>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ResourceCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={40} color={COLORS.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No resources found</Text>
              <Text style={styles.emptySubtitle}>
                Try another search term or clear active filters to discover items.
              </Text>
              <Button
                title="Clear All Filters"
                variant="secondary"
                onPress={handleClearFilters}
                style={{ marginTop: 16, width: 200 }}
              />
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refine Resources</Text>
              <Pressable onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </Pressable>
            </View>

            {/* Condition Filter */}
            <Text style={styles.filterGroupLabel}>Condition</Text>
            <View style={styles.filterChipsGrid}>
              {CONDITIONS.map((cond) => {
                const isSelected = selectedCondition === cond;
                return (
                  <Pressable
                    key={cond}
                    style={[styles.modalChip, isSelected ? styles.modalChipSelected : null]}
                    onPress={() => setSelectedCondition(cond)}
                  >
                    <Text style={[styles.modalChipText, isSelected ? styles.modalChipTextSelected : null]}>
                      {cond}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Status Filter */}
            <Text style={styles.filterGroupLabel}>Availability</Text>
            <View style={styles.filterChipsGrid}>
              {STATUSES.map((st) => {
                const isSelected = selectedStatus === st;
                return (
                  <Pressable
                    key={st}
                    style={[styles.modalChip, isSelected ? styles.modalChipSelected : null]}
                    onPress={() => setSelectedStatus(st)}
                  >
                    <Text style={[styles.modalChipText, isSelected ? styles.modalChipTextSelected : null]}>
                      {st === 'Any' ? 'Any' : st.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActionsRow}>
              <Button
                title="Clear"
                variant="outline"
                onPress={handleClearFilters}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Apply Filters"
                onPress={() => setFilterModalVisible(false)}
                style={{ flex: 2, marginLeft: 8 }}
              />
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
  headerContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterIconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  filterActiveBtn: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  categoryChipsContainer: {
    paddingBottom: 14,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
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
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  listContent: {
    padding: 18,
    paddingBottom: 36,
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
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  filterGroupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 4,
  },
  filterChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalChipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  modalChipText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  modalChipTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  modalActionsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
