import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';

export default function VerificationSuccessScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Access control: if user is not approved, send them back to pending verification or login
    if (currentUser && currentUser.verificationStatus !== 'approved') {
      router.replace(ROUTES.PENDING_VERIFICATION as any);
    }
  }, [currentUser, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
        </View>

        <StatusBadge status="VERIFIED" />

        <Text style={styles.title}>You're Verified!</Text>
        <Text style={styles.subtitle}>
          Your community membership has been verified. Welcome to Eco Circle!
        </Text>

        <Card style={styles.card}>
          <Text style={styles.welcomeText}>
            Hello {currentUser?.fullName || 'Neighbor'}! You can now start sharing unused resources, requesting needed items, participating in events, and engaging with your community.
          </Text>

          <Button
            title="Enter Eco Circle"
            onPress={() => router.replace(ROUTES.HOME as any)}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    padding: 20,
  },
  welcomeText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
    marginBottom: 20,
    textAlign: 'center',
  },
});
