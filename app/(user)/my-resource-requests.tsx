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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { requestService } from '../../services/requestService';
import { ResourceRequest } from '../../types/request';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';

export default function MyResourceRequestsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [myRequests, setMyRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const list = await requestService.getRequestsByRequester(currentUser.id);
    setMyRequests(list);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyRequests();
    await refreshData();
    setRefreshing(false);
  };

  const handleCancel = (req: ResourceRequest) => {
    Alert.alert(
      'Cancel Request',
      `Are you sure you want to cancel your request for "${req.resourceTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            if (!currentUser) return;
            const res = await requestService.cancelRequest(req.id, currentUser.id);
            if (res.success) {
              await fetchMyRequests();
              await refreshData();
              Alert.alert('Request Cancelled', 'Your request has been cancelled.');
            } else {
              Alert.alert('Error', res.message || 'Unable to cancel request.');
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
        <Text style={styles.headerTitle}>My Resource Requests</Text>
        <Text style={styles.headerSubtitle}>
          Track items you have requested from other community members.
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading your requests...</Text>
        </View>
      ) : (
        <FlatList
          data={myRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="paper-plane-outline" size={40} color={COLORS.primaryDark} />
              </View>
              <Text style={styles.emptyTitle}>No Requests Sent Yet</Text>
              <Text style={styles.emptySubtitle}>
                You haven't requested any resources from your neighbors yet. Browse available items to find what you need!
              </Text>
              <Button
                title="Browse Resources"
                onPress={() => router.push(ROUTES.RESOURCES as any)}
                style={{ marginTop: 18, width: 200 }}
              />
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.requestCard}>
              <View style={styles.cardHeaderRow}>
                {item.resourceImageUrl ? (
                  <Image source={{ uri: item.resourceImageUrl }} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <Ionicons name="cube-outline" size={24} color={COLORS.primaryDark} />
                  </View>
                )}
                <View style={styles.titleWrapper}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.resourceTitle}
                  </Text>
                  <Text style={styles.ownerText}>Owner: {item.ownerName}</Text>
                  <Text style={styles.requestDate}>Requested: {item.createdAt}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              {item.message ? (
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>"{item.message}"</Text>
                </View>
              ) : null}

              {/* Action Buttons depending on status */}
              {item.status === 'accepted' && (
                <Button
                  title="Contact Owner"
                  onPress={() =>
                    router.push({
                      pathname: ROUTES.CONTACT_OWNER as any,
                      params: { requestId: item.id },
                    })
                  }
                  style={{ marginTop: 10 }}
                />
              )}

              {item.status === 'pending' && (
                <Button
                  title="Cancel Request"
                  variant="outline"
                  onPress={() => handleCancel(item)}
                  style={{ marginTop: 10 }}
                />
              )}
            </Card>
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
  requestCard: { padding: 14, marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  thumbnail: { width: 60, height: 60, borderRadius: 8, backgroundColor: COLORS.primaryLight },
  thumbPlaceholder: { width: 60, height: 60, borderRadius: 8, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  titleWrapper: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  ownerText: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  requestDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  messageBox: { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8, marginTop: 4, marginBottom: 4 },
  messageText: { fontSize: 12, color: COLORS.text, fontStyle: 'italic' },
});
