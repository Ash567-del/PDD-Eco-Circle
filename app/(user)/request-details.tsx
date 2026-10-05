import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { requestService } from '../../services/requestService';
import { resourceService } from '../../services/resourceService';
import { ResourceRequest } from '../../types/request';
import { ResourceItem } from '../../types/resource';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';

export default function RequestDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [request, setRequest] = useState<ResourceRequest | null>(null);
  const [resource, setResource] = useState<ResourceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      const req = await requestService.getRequestById(id);
      if (req) {
        setRequest(req);
        const res = await resourceService.getResourceById(req.resourceId);
        setResource(res);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [id]);

  const handleAccept = async () => {
    if (!request || !currentUser) return;
    const res = await requestService.acceptRequest(request.id, currentUser.id);
    if (res.success) {
      await refreshData();
      Alert.alert('Request Accepted', `You accepted ${request.requesterName}'s request.`);
      router.back();
    } else {
      Alert.alert('Error', res.message || 'Unable to accept request.');
    }
  };

  const handleReject = async () => {
    if (!request || !currentUser) return;
    const res = await requestService.rejectRequest(request.id, currentUser.id);
    if (res.success) {
      await refreshData();
      Alert.alert('Request Rejected', `Request rejected.`);
      router.back();
    } else {
      Alert.alert('Error', res.message || 'Unable to reject request.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.accentRose} />
        <Text style={styles.notFoundTitle}>Request Not Found</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ width: 180, marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const isOwner = currentUser && currentUser.id === request.ownerId;
  const isRequester = currentUser && currentUser.id === request.requesterId;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Request Details</Text>
          <StatusBadge status={request.status} />
        </View>

        {/* Resource Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>Requested Item</Text>
          <Text style={styles.itemTitle}>{request.resourceTitle}</Text>
          {resource && (
            <Text style={styles.itemMeta}>Category: {resource.category} • Condition: {resource.condition}</Text>
          )}
        </Card>

        {/* Requester Info */}
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>Requester Info</Text>
          <Text style={styles.infoName}>{request.requesterName}</Text>
          <Text style={styles.infoCommunity}>{request.requesterCommunity}</Text>

          {request.message ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>"{request.message}"</Text>
            </View>
          ) : null}
        </Card>

        {/* Actions based on role */}
        {isOwner && request.status === 'pending' && (
          <View style={styles.actionsRow}>
            <Button title="Accept Request" onPress={handleAccept} style={{ flex: 1, marginRight: 6 }} />
            <Button title="Reject" variant="danger" onPress={handleReject} style={{ flex: 1, marginLeft: 6 }} />
          </View>
        )}

        {isRequester && request.status === 'accepted' && (
          <Button
            title="Contact Owner"
            onPress={() =>
              router.push({
                pathname: ROUTES.CONTACT_OWNER as any,
                params: { requestId: request.id },
              })
            }
            style={{ marginTop: 10 }}
          />
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
  content: { padding: 20, paddingBottom: 36 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  card: { padding: 16, marginBottom: 14 },
  sectionHeader: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 6 },
  itemTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  itemMeta: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  infoName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  infoCommunity: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  messageBox: { backgroundColor: COLORS.background, padding: 10, borderRadius: 8, marginTop: 10 },
  messageLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginBottom: 2 },
  messageText: { fontSize: 13, color: COLORS.text, fontStyle: 'italic' },
  actionsRow: { flexDirection: 'row', marginTop: 10 },
});
