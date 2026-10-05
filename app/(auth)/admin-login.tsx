import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { loginAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter admin email address and password.');
      return;
    }

    setLoading(true);
    const res = await loginAdmin(email.trim(), password);
    setLoading(false);

    if (!res.success || !res.user) {
      setErrorMessage(res.message || 'Invalid administrator credentials.');
      return;
    }

    if (res.user.role !== 'admin') {
      setErrorMessage('Access Denied: Standard user accounts cannot log in to Admin portal.');
      return;
    }

    router.replace(ROUTES.ADMIN_DASHBOARD as any);
  };

  const setDemoAdmin = () => {
    setEmail('admin@ecocircle.org');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBox}>
          <View style={styles.shieldCircle}>
            <Ionicons name="shield-checkmark" size={36} color="#6B21A8" />
          </View>
          <Text style={styles.title}>Admin Portal Login</Text>
          <Text style={styles.subtitle}>
            Authorized management portal for community administrators and verification officers.
          </Text>
        </View>

        <Card style={styles.card}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Input
            label="Admin Email *"
            placeholder="admin@ecocircle.org"
            iconName="shield-outline"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label="Password *"
            placeholder="••••••••"
            iconName="lock-closed-outline"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title="Admin Login"
            onPress={handleAdminLogin}
            loading={loading}
            style={{ marginTop: 10, marginBottom: 16 }}
          />

          {/* Quick Demo Admin Button */}
          <Pressable style={styles.demoBtn} onPress={setDemoAdmin}>
            <Text style={styles.demoBtnText}>⚡ Demo Admin (admin@ecocircle.org / admin123)</Text>
          </Pressable>
        </Card>
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
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  shieldCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    padding: 18,
  },
  errorBanner: {
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#9F1239',
    fontWeight: '600',
  },
  demoBtn: {
    backgroundColor: '#F3E8FF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B21A8',
  },
});
