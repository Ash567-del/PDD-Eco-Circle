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

export default function ReceivedRequestsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReceivedRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const list = await requestService.getRequestsForOwner(currentUser.id);
    setRequests(list);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchReceivedRequests();
  }, [fetchReceivedRequests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReceivedRequests();
    await refreshData();
    setRefreshing(false);
  };

  const handleAccept = async (req: ResourceRequest) => {
    if (!currentUser) return;
    const res = await requestService.acceptRequest(req.id, currentUser.id);
    if (res.success) {
      await fetchReceivedRequests();
      await refreshData();
      Alert.alert('Request Accepted', `You accepted ${req.requesterName}'s request for "${req.resourceTitle}".`);
    } else {
      Alert.alert('Error', res.message || 'Unable to accept request.');
    }
  };

  const handleReject = async (req: ResourceRequest) => {
    if (!currentUser) return;
    const res = await requestService.rejectRequest(req.id, currentUser.id);
    if (res.success) {
      await fetchReceivedRequests();
      await refreshData();
      Alert.alert('Request Rejected', `Request for "${req.resourceTitle}" rejected.`);
    } else {
      Alert.alert('Error', res.message || 'Unable to reject request.');
    }
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Received Requests</Text>
        <Text style={styles.headerSubtitle}>
          Review incoming requests from neighbors wanting your shared items.
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading received requests...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="hand-right-outline" size={40} color={COLORS.primaryDark} />
              </View>
              <Text style={styles.emptyTitle}>No Requests Received Yet</Text>
              <Text style={styles.emptySubtitle}>
                When members request items you have shared, they will appear here for your review.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.requestCard}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.resourceTitle}</Text>
                  <Text style={styles.requestDate}>Requested {item.createdAt}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.requesterBox}>
                <Ionicons name="person-circle-outline" size={32} color={COLORS.primaryDark} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.requesterName}>{item.requesterName}</Text>
                  <Text style={styles.requesterCommunity}>{item.requesterCommunity}</Text>
                </View>
              </View>

              {item.message ? (
                <View style={styles.messageBox}>
                  <Text style={styles.messageLabel}>Note from requester:</Text>
                  <Text style={styles.messageText}>"{item.message}"</Text>
                </View>
              ) : null}

              {item.status === 'pending' ? (
                <View style={styles.actionsRow}>
                  <Button
                    title="Accept Request"
                    onPress={() => handleAccept(item)}
                    style={{ flex: 1, marginRight: 6 }}
                  />
                  <Button
                    title="Reject"
                    variant="danger"
                    onPress={() => handleReject(item)}
                    style={{ flex: 1, marginLeft: 6 }}
                  />
                </View>
              ) : null}
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
  requestCard: { padding: 16, marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  requestDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  requesterBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.background, padding: 10, borderRadius: 10, marginBottom: 10 },
  requesterName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  requesterCommunity: { fontSize: 12, color: COLORS.textMuted },
  messageBox: { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8, marginBottom: 10 },
  messageLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginBottom: 2 },
  messageText: { fontSize: 13, color: COLORS.text, fontStyle: 'italic' },
  actionsRow: { flexDirection: 'row', marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
});
