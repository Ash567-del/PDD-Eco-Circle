import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';

export default function PendingVerificationScreen() {
  const router = useRouter();
  const { currentUser, checkVerificationStatus, approveUser } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    const status = await checkVerificationStatus();
    setChecking(false);

    if (status === 'approved' || currentUser?.verificationStatus === 'approved') {
      router.replace(ROUTES.VERIFICATION_SUCCESS as any);
    } else if (status === 'rejected') {
      Alert.alert('Verification Status', 'Your registration application was not approved by the Admin.');
    } else {
      Alert.alert('Status Update', 'Your account is still waiting for Admin approval.');
    }
  };

  const handleSimulateAdminApprove = async () => {
    if (currentUser) {
      await approveUser(currentUser.id);
      router.replace(ROUTES.VERIFICATION_SUCCESS as any);
    } else {
      Alert.alert('Dev Simulator', 'No active session. Please log in as a pending user first.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="time-outline" size={48} color={COLORS.accentAmber} />
        </View>

        <Text style={styles.title}>Verification Pending</Text>
        <Text style={styles.message}>
          Your Eco Circle account has been created successfully. A community administrator needs to verify your membership before you can access the community.
        </Text>

        {/* Progress Flow Visualization */}
        <Card style={styles.progressCard}>
          <Text style={styles.flowTitle}>Community Access Roadmap</Text>
          
          <View style={styles.stepRow}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            <Text style={styles.stepCompleted}>Account Registration</Text>
          </View>

          <View style={styles.stepConnectorLine} />

          <View style={styles.stepRow}>
            <Ionicons name="time" size={24} color={COLORS.accentAmber} />
            <Text style={styles.stepActive}>Admin Verification (In Progress)</Text>
          </View>

          <View style={styles.stepConnectorLine} />

          <View style={styles.stepRow}>
            <Ionicons name="ellipse-outline" size={24} color={COLORS.textMuted} />
            <Text style={styles.stepPending}>Community Access Granted</Text>
          </View>

          <View style={styles.statusBanner}>
            <Text style={styles.statusLabel}>Current Status:</Text>
            <StatusBadge status={currentUser?.verificationStatus || 'PENDING'} />
          </View>
        </Card>

        {/* User Info Preview */}
        {currentUser && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Applicant Profile</Text>
            <Text style={styles.infoText}>Name: {currentUser.fullName}</Text>
            <Text style={styles.infoText}>Email: {currentUser.email}</Text>
            <Text style={styles.infoText}>Community: {currentUser.communityName}</Text>
          </Card>
        )}

        <Button
          title="Check Verification Status"
          onPress={handleCheckStatus}
          loading={checking}
          style={{ marginBottom: 10 }}
        />

        <Button
          title="⚡ Dev Simulator: Auto-Approve User"
          variant="secondary"
          onPress={handleSimulateAdminApprove}
          style={{ marginBottom: 10 }}
        />

        <Button
          title="Back to Login"
          variant="outline"
          onPress={() => router.replace(ROUTES.USER_LOGIN as any)}
        />

        <Text style={styles.footerNote}>
          Only verified community members can access Eco Circle.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
    alignItems: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  progressCard: {
    width: '100%',
    padding: 18,
    marginBottom: 16,
  },
  flowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepCompleted: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  stepActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  stepPending: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  stepConnectorLine: {
    width: 2,
    height: 18,
    backgroundColor: COLORS.border,
    marginLeft: 11,
    marginVertical: 4,
  },
  statusBanner: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoCard: {
    width: '100%',
    padding: 14,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text,
    marginVertical: 2,
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
