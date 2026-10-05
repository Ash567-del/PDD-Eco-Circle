import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Eco Circle</Text>
          <Text style={styles.subtitle}>
            Your trusted community for sharing resources, information, events and solving local problems together.
          </Text>
        </View>

        {/* Community Member Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBg, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="people-outline" size={26} color={COLORS.primaryDark} />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.cardTitle}>Community Member</Text>
              <Text style={styles.cardBadge}>Verified Resident</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Share resources, connect with neighbors and participate in your community.
          </Text>
          <Button
            title="Continue as Member"
            onPress={() => router.push(ROUTES.USER_LOGIN as any)}
          />
        </Card>

        {/* Community Admin Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBg, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="shield-checkmark-outline" size={26} color="#6B21A8" />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.cardTitle}>Community Admin</Text>
              <Text style={styles.cardBadgeAdmin}>Community Manager</Text>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Manage community members, resources, events and reported problems.
          </Text>
          <Button
            title="Continue as Admin"
            variant="outline"
            onPress={() => router.push(ROUTES.ADMIN_LOGIN as any)}
          />
        </Card>

        {/* Register Account Action */}
        <View style={styles.registerPrompt}>
          <Text style={styles.registerText}>New to Eco Circle?</Text>
          <Pressable onPress={() => router.push(ROUTES.USER_REGISTER as any)}>
            <Text style={styles.registerLink}>Create an account</Text>
          </Pressable>
        </View>
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
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  card: {
    marginBottom: 18,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  titleWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  cardBadgeAdmin: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B21A8',
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 18,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textDecorationLine: 'underline',
  },
});
