import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { resourceService } from '../../services/resourceService';
import { requestService } from '../../services/requestService';
import { ResourceItem } from '../../types/resource';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';

export default function MyResourcesScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [myResources, setMyResources] = useState<ResourceItem[]>([]);
  const [requestCounts, setRequestCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyResources = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const list = await resourceService.getResourcesByOwner(currentUser.id);
    setMyResources(list);

    // Fetch request counts per resource
    const counts: { [key: string]: number } = {};
    for (const r of list) {
      const reqs = await requestService.getRequestsForResource(r.id);
      counts[r.id] = reqs.length;
    }
    setRequestCounts(counts);

    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchMyResources();
  }, [fetchMyResources]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyResources();
    await refreshData();
    setRefreshing(false);
  };

  const handleDelete = (item: ResourceItem) => {
    Alert.alert(
      'Delete Resource',
      `Are you sure you want to remove "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!currentUser) return;
            const res = await resourceService.deleteResource(item.id, currentUser.id);
            if (res.success) {
              await fetchMyResources();
              await refreshData();
              Alert.alert('Deleted', 'Resource removed successfully.');
            } else {
              Alert.alert('Unable to Delete', res.message || 'Could not delete resource.');
            }
          },
        },
      ]
    );
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>My Shared Resources</Text>
        <Text style={styles.headerSubtitle}>
          Manage your shared community items, view requests, or update details.
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading your listings...</Text>
        </View>
      ) : (
        <FlatList
          data={myResources}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="cube-outline" size={40} color={COLORS.primaryDark} />
              </View>
              <Text style={styles.emptyTitle}>No Resources Shared Yet</Text>
              <Text style={styles.emptySubtitle}>
                You haven't listed any items for your community yet. Give unused items a new purpose!
              </Text>
              <Button
                title="Share Your First Resource"
                onPress={() => router.push(ROUTES.SHARE_RESOURCE as any)}
                style={{ marginTop: 18, width: 220 }}
              />
            </View>
          }
          renderItem={({ item }) => {
            const count = requestCounts[item.id] || 0;
            return (
              <Card style={styles.resourceCard}>
                <View style={styles.cardTopRow}>
                  <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} resizeMode="cover" />
                  <View style={styles.infoWrapper}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.categoryText}>{item.category}</Text>
                      <StatusBadge status={item.status} />
                    </View>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.metaText}>
                      Condition: {item.condition} • Posted {item.createdAt}
                    </Text>
                    <View style={styles.requestCountBadge}>
                      <Ionicons name="hand-right-outline" size={12} color={COLORS.primaryDark} />
                      <Text style={styles.requestCountText}>{count} Request(s)</Text>
                    </View>
                  </View>
                </View>

                {/* Card Actions */}
                <View style={styles.cardActionsRow}>
                  <Button
                    title="Edit"
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: ROUTES.EDIT_RESOURCE as any,
                        params: { id: item.id },
                      })
                    }
                    style={{ flex: 1, marginRight: 6 }}
                  />
                  <Button
                    title="Delete"
                    variant="danger"
                    onPress={() => handleDelete(item)}
                    style={{ flex: 1, marginLeft: 6 }}
                  />
                </View>
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBox: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  listContent: {
    padding: 16,
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
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
  resourceCard: {
    padding: 14,
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
  },
  infoWrapper: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  requestCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  requestCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  cardActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
