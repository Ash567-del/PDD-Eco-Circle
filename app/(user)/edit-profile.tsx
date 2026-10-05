import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../../components/common/Avatar';

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentUser, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [houseNumber, setHouseNumber] = useState(currentUser?.houseNumber || '');
  const [area, setArea] = useState(currentUser?.area || '');
  const [communityName, setCommunityName] = useState(currentUser?.communityName || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    } else if (fullName.trim().length < 2) {
      errs.fullName = 'Full Name must be at least 2 characters long.';
    }

    if (!phone.trim()) {
      errs.phone = 'Phone number is required.';
    }

    if (!houseNumber.trim()) {
      errs.houseNumber = 'House/Flat number is required.';
    }

    if (!area.trim()) {
      errs.area = 'Area detail is required.';
    }

    if (!communityName.trim()) {
      errs.communityName = 'Community Name is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        houseNumber: houseNumber.trim(),
        area: area.trim(),
        communityName: communityName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });

      if (res.success) {
        Alert.alert('Success', 'Profile updated successfully.', [
          {
            text: 'OK',
            onPress: () => router.replace(ROUTES.PROFILE as any),
          },
        ]);
      } else {
        Alert.alert('Update Failed', res.message || 'Failed to update profile.');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Avatar Preview */}
        <View style={styles.avatarHeader}>
          <Avatar name={fullName || currentUser?.fullName} imageUrl={avatarUrl} size={84} />
          <Text style={styles.avatarSubText}>Avatar Preview</Text>
        </View>

        <View style={styles.formCard}>
          {/* Read-Only System Fields Section */}
          <Text style={styles.sectionHeader}>System Credentials (Read-Only)</Text>

          <View style={styles.readOnlyGroup}>
            <View style={styles.readOnlyRow}>
              <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
              <Text style={styles.readOnlyLabel}>User ID:</Text>
              <Text style={styles.readOnlyVal}>{currentUser?.id}</Text>
            </View>

            <View style={styles.readOnlyRow}>
              <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
              <Text style={styles.readOnlyLabel}>Email:</Text>
              <Text style={styles.readOnlyVal}>{currentUser?.email}</Text>
            </View>

            <View style={styles.readOnlyRow}>
              <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
              <Text style={styles.readOnlyLabel}>Role:</Text>
              <Text style={styles.readOnlyVal}>{currentUser?.role?.toUpperCase()}</Text>
            </View>

            <View style={styles.readOnlyRow}>
              <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
              <Text style={styles.readOnlyLabel}>Status:</Text>
              <Text style={styles.readOnlyVal}>
                {currentUser?.verificationStatus?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Editable Fields Section */}
          <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Editable Profile Information</Text>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g., Sarah Jenkins"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
          </View>

          {/* Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+1 555-0188"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* House / Flat Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>House / Flat Number *</Text>
            <TextInput
              style={[styles.input, errors.houseNumber && styles.inputError]}
              value={houseNumber}
              onChangeText={setHouseNumber}
              placeholder="e.g., Flat 18B"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.houseNumber ? <Text style={styles.errorText}>{errors.houseNumber}</Text> : null}
          </View>

          {/* Area */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Area / Sector *</Text>
            <TextInput
              style={[styles.input, errors.area && styles.inputError]}
              value={area}
              onChangeText={setArea}
              placeholder="e.g., Pine Avenue, Sector 2"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.area ? <Text style={styles.errorText}>{errors.area}</Text> : null}
          </View>

          {/* Community Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Community Name *</Text>
            <TextInput
              style={[styles.input, errors.communityName && styles.inputError]}
              value={communityName}
              onChangeText={setCommunityName}
              placeholder="e.g., Green Valley Community"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.communityName ? (
              <Text style={styles.errorText}>{errors.communityName}</Text>
            ) : null}
          </View>

          {/* Profile Image URL */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Profile Image URL (Optional)</Text>
            <TextInput
              style={styles.input}
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              placeholder="https://images.unsplash.com/photo-..."
              autoCapitalize="none"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.hintText}>
              Leave blank to display automatically generated initials avatar.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  avatarHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarSubText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  readOnlyGroup: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readOnlyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    width: 60,
  },
  readOnlyVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  fieldGroup: {},
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  hintText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: COLORS.primaryDark,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
