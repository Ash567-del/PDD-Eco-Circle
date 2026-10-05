import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';

export default function UserRegisterScreen() {
  const router = useRouter();
  const { registerUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [area, setArea] = useState('');
  const [communityName, setCommunityName] = useState('Greenwood Sector 4');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid Email Address is required.';
    if (!phone.trim()) errs.phone = 'Phone Number is required.';
    if (!houseNumber.trim()) errs.houseNumber = 'House / Flat Number is required.';
    if (!area.trim()) errs.area = 'Street / Area is required.';
    if (!communityName.trim()) errs.communityName = 'Community Name is required.';

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    const res = await registerUser({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      houseNumber: houseNumber.trim(),
      area: area.trim(),
      communityName: communityName.trim(),
      password,
    });

    setSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Registration Submitted',
        'Your registration was submitted successfully. Your account is waiting for community admin verification.',
        [
          {
            text: 'View Verification Status',
            onPress: () => router.replace(ROUTES.PENDING_VERIFICATION as any),
          },
        ]
      );
    } else {
      Alert.alert('Registration Failed', res.message || 'Unable to complete registration.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Member Registration</Text>
          <Text style={styles.subtitle}>
            Register for your verified community access. An Admin will review your residency proof.
          </Text>

          <Card style={styles.card}>
            <Input
              label="Full Name *"
              placeholder="e.g. Sarah Jenkins"
              iconName="person-outline"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
            />

            <Input
              label="Email Address *"
              placeholder="sarah@example.com"
              iconName="mail-outline"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Input
              label="Phone Number *"
              placeholder="+1 555-0188"
              iconName="call-outline"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
            />

            <Input
              label="House / Flat Number *"
              placeholder="e.g. Flat 18B"
              iconName="home-outline"
              value={houseNumber}
              onChangeText={setHouseNumber}
              error={errors.houseNumber}
            />

            <Input
              label="Street / Area *"
              placeholder="e.g. Pine Avenue, Sector 2"
              iconName="location-outline"
              value={area}
              onChangeText={setArea}
              error={errors.area}
            />

            <Input
              label="Community Name *"
              placeholder="e.g. Greenwood Sector 4"
              iconName="business-outline"
              value={communityName}
              onChangeText={setCommunityName}
              error={errors.communityName}
            />

            <Input
              label="Password (min 8 chars) *"
              placeholder="••••••••"
              iconName="lock-closed-outline"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <Input
              label="Confirm Password *"
              placeholder="••••••••"
              iconName="lock-closed-outline"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />

            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>🛡️ Community Verification Notice</Text>
              <Text style={styles.noticeText}>
                Your details will be verified by the Community Admin before access to shared resources is granted.
              </Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={submitting}
              style={{ marginTop: 12 }}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 20,
  },
  card: {
    padding: 18,
  },
  noticeBox: {
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginVertical: 12,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 16,
  },
});
