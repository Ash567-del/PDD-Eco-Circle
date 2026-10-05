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

export default function ContactOwnerScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();

  const [request, setRequest] = useState<ResourceRequest | null>(null);
  const [resource, setResource] = useState<ResourceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      if (!requestId) return;
      const req = await requestService.getRequestById(requestId);
      if (req) {
        setRequest(req);
        const res = await resourceService.getResourceById(req.resourceId);
        setResource(res);
      }
      setLoading(false);
    };

    fetchContactInfo();
  }, [requestId]);

  const handleSendMessage = () => {
    Alert.alert(
      'Community Messaging',
      'Real-time community direct messaging & chat will be available in the upcoming communications update.',
      [{ text: 'Got it' }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading contact details...</Text>
      </SafeAreaView>
    );
  }

  if (!request || request.status !== 'accepted') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="lock-closed-outline" size={48} color={COLORS.accentRose} />
        <Text style={styles.errorTitle}>Access Restricted</Text>
        <Text style={styles.errorSubtitle}>
          Owner contact information is unlocked only after a resource request has been accepted.
        </Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ width: 180, marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Connection Success Banner */}
        <View style={styles.bannerCircle}>
          <Ionicons name="checkmark-circle" size={54} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>You're Connected!</Text>
        <Text style={styles.subtitle}>
          Your request for <Text style={{ fontWeight: '700', color: COLORS.text }}>{request.resourceTitle}</Text> has been accepted by the owner.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Item Owner Information</Text>

          <View style={styles.ownerRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={26} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{request.ownerName}</Text>
              <View style={styles.badgeRow}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                <Text style={styles.badgeText}>Verified Community Member</Text>
              </View>
            </View>
          </View>

          {resource && (
            <View style={styles.locationBox}>
              <Ionicons name="location-outline" size={18} color={COLORS.primaryDark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationTitle}>Pickup Address / Area:</Text>
                <Text style={styles.locationText}>{resource.location}</Text>
                <Text style={styles.communityText}>{resource.communityName}</Text>
              </View>
            </View>
          )}

          <Button
            title="Message Owner"
            onPress={handleSendMessage}
            style={{ marginTop: 18 }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.background },
  loadingText: { fontSize: 13, color: COLORS.textMuted, marginTop: 10 },
  errorTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  errorSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 18 },
  content: { padding: 20, paddingBottom: 36, alignItems: 'center' },
  bannerCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 14 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.primaryDark, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20, paddingHorizontal: 12 },
  card: { width: '100%', padding: 20 },
  cardHeaderTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  ownerName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  badgeText: { fontSize: 12, color: COLORS.primaryDark, fontWeight: '600' },
  locationBox: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.background, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  locationTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  locationText: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 1 },
  communityText: { fontSize: 12, color: COLORS.primaryDark, marginTop: 2 },
});
