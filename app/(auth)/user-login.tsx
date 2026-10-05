import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';

export default function UserLoginScreen() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    const res = await loginUser(email.trim(), password);
    setLoading(false);

    if (!res.success || !res.user) {
      setErrorMessage(res.message || 'Invalid email or password.');
      return;
    }

    const { verificationStatus } = res.user;

    if (verificationStatus === 'pending') {
      router.replace(ROUTES.PENDING_VERIFICATION as any);
    } else if (verificationStatus === 'approved') {
      router.replace(ROUTES.VERIFICATION_SUCCESS as any);
    } else if (verificationStatus === 'rejected') {
      setErrorMessage('Your registration was not approved. Please contact your community administrator.');
    }
  };

  const setQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('user123');
    setErrorMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Member Login</Text>
        <Text style={styles.subtitle}>Enter your credentials to access your community network.</Text>

        <Card style={styles.card}>
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Input
            label="Email Address *"
            placeholder="e.g. sarah@example.com"
            iconName="mail-outline"
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
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 10, marginBottom: 16 }}
          />

          {/* Quick Demo Test Buttons */}
          <View style={styles.demoSection}>
            <Text style={styles.demoHeader}>⚡ Quick Demo Credentials:</Text>
            <Pressable style={styles.demoBtn} onPress={() => setQuickDemo('approved@example.com')}>
              <Text style={styles.demoBtnText}>Approved Member (sarah@example.com)</Text>
            </Pressable>
            <Pressable style={styles.demoBtn} onPress={() => setQuickDemo('pending@example.com')}>
              <Text style={styles.demoBtnText}>Pending Member (marcus@example.com)</Text>
            </Pressable>
            <Pressable style={styles.demoBtn} onPress={() => setQuickDemo('rejected@example.com')}>
              <Text style={styles.demoBtnText}>Rejected Member (john@example.com)</Text>
            </Pressable>
          </View>
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Need an account?</Text>
          <Pressable onPress={() => router.push(ROUTES.USER_REGISTER as any)}>
            <Text style={styles.footerLink}>Register Here</Text>
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
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
  demoSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
    marginTop: 6,
  },
  demoHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  demoBtn: {
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textDecorationLine: 'underline',
  },
});
