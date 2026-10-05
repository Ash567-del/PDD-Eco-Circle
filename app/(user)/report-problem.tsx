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
import { useAppData } from '../../contexts/AppDataContext';
import { ProblemCategory } from '../../types/problem';
import { problemService } from '../../services/problemService';

const CATEGORIES: { label: string; value: ProblemCategory; icon: string }[] = [
  { label: 'Water', value: 'water', icon: 'water-outline' },
  { label: 'Electricity', value: 'electricity', icon: 'flash-outline' },
  { label: 'Cleanliness', value: 'cleanliness', icon: 'trash-outline' },
  { label: 'Roads', value: 'roads', icon: 'construct-outline' },
  { label: 'Parking', value: 'parking', icon: 'car-outline' },
  { label: 'Security', value: 'security', icon: 'shield-checkmark-outline' },
  { label: 'Noise', value: 'noise', icon: 'volume-high-outline' },
  { label: 'Maintenance', value: 'maintenance', icon: 'hammer-outline' },
  { label: 'Other', value: 'other', icon: 'ellipsis-horizontal-circle-outline' },
];

export default function ReportProblemScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('water');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim()) {
      errs.title = 'Problem title is required.';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    }

    if (!description.trim()) {
      errs.description = 'Description is required.';
    } else if (description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters long.';
    }

    if (!location.trim()) {
      errs.location = 'Location detail is required.';
    }

    if (!category) {
      errs.category = 'Please select a problem category.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to report a problem.');
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      await problemService.createProblem({
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        imageUrl: imageUrl.trim() || undefined,
        reportedById: currentUser.id,
        reportedByName: currentUser.fullName || 'Community Member',
        communityName: currentUser.communityName || 'Green Valley Community',
      });

      await refreshData();

      Alert.alert('Success', 'Problem reported successfully.', [
        {
          text: 'OK',
          onPress: () => router.replace(ROUTES.MY_PROBLEMS as any),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit problem report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Report a Community Problem</Text>
          <Text style={styles.subtitle}>
            Help us improve the community by reporting infrastructure or safety issues.
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.form}>
          {/* Title Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Problem Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g., Streetlight Not Working"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>

          {/* Category Chips */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Problem Category *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.categoryChip, isSelected && styles.selectedCategoryChip]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={16}
                      color={isSelected ? COLORS.white : COLORS.primaryDark}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.selectedCategoryChipText,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
          </View>

          {/* Location Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Location / Block Details *</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="e.g., Near Block B Basement Entrance"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
          </View>

          {/* Description Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Detailed Description *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, errors.description && styles.inputError]}
              placeholder="Explain the problem clearly so maintenance staff can resolve it fast..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.description ? (
              <Text style={styles.errorText}>{errors.description}</Text>
            ) : null}
          </View>

          {/* Optional Image URL */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Photo URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.hintText}>
              Add an image link showing the damaged bench, water leak, or light fixture.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="send" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Submit Report</Text>
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
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
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
  multilineInput: {
    height: 100,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primaryDark,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedCategoryChipText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primaryDark,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
