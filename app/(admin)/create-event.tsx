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
import { eventService } from '../../services/eventService';
import { adminActivityService } from '../../services/adminActivityService';
import { EventType } from '../../types/event';

const EVENT_TYPES: { label: string; value: EventType }[] = [
  { label: 'Clean Up', value: 'clean_up' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Social', value: 'social' },
  { label: 'Sports', value: 'sports' },
  { label: 'Awareness', value: 'awareness' },
  { label: 'Other', value: 'other' },
];

export default function CreateEventScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('clean_up');
  const [date, setDate] = useState('2026-10-20');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('30');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim()) errs.title = 'Event Title is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (!date.trim()) errs.date = 'Date is required.';
    if (!startTime.trim()) errs.startTime = 'Start time is required.';
    if (!endTime.trim()) errs.endTime = 'End time is required.';
    if (!location.trim()) errs.location = 'Location is required.';
    if (!maxParticipants.trim() || isNaN(Number(maxParticipants))) {
      errs.maxParticipants = 'Valid capacity number is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!currentUser) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await eventService.createEvent({
        title: title.trim(),
        description: description.trim(),
        type,
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        location: location.trim(),
        maxParticipants: parseInt(maxParticipants, 10),
        organizerId: currentUser.id,
        organizerName: currentUser.fullName || 'Community Admin',
        communityName: currentUser.communityName || 'Green Valley Community',
        imageUrl: imageUrl.trim() || undefined,
      });

      if (res) {
        await refreshData();
        await adminActivityService.logActivity(
          'Event Created',
          `${currentUser.fullName} created new community event '${title.trim()}'.`,
          'event',
          currentUser.fullName
        );

        Alert.alert('Success', 'Event created successfully.', [
          { text: 'OK', onPress: () => router.replace(ROUTES.ADMIN_EVENTS as any) },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Community Event</Text>
          <Text style={styles.headerSubtitle}>
            Schedule activities, workshops, or meetings for members.
          </Text>
        </View>

        <View style={styles.formCard}>
          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g., Tree Plantation Drive"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>

          {/* Type Picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Event Type *</Text>
            <View style={styles.typeGrid}>
              {EVENT_TYPES.map((t) => {
                const isSelected = type === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.typeChip, isSelected && styles.selectedTypeChip]}
                    onPress={() => setType(t.value)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        isSelected && styles.selectedTypeChipText,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Date & Time Row */}
          <View style={styles.rowTwo}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={[styles.input, errors.date && styles.inputError]}
                placeholder="2026-10-20"
                value={date}
                onChangeText={setDate}
                placeholderTextColor={COLORS.textMuted}
              />
              {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Capacity *</Text>
              <TextInput
                style={[styles.input, errors.maxParticipants && styles.inputError]}
                placeholder="30"
                keyboardType="numeric"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                placeholderTextColor={COLORS.textMuted}
              />
              {errors.maxParticipants ? (
                <Text style={styles.errorText}>{errors.maxParticipants}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.rowTwo}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>Start Time *</Text>
              <TextInput
                style={[styles.input, errors.startTime && styles.inputError]}
                placeholder="09:00 AM"
                value={startTime}
                onChangeText={setStartTime}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.label}>End Time *</Text>
              <TextInput
                style={[styles.input, errors.endTime && styles.inputError]}
                placeholder="12:00 PM"
                value={endTime}
                onChangeText={setEndTime}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              placeholder="e.g., Central Community Park"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Event Description *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, errors.description && styles.inputError]}
              placeholder="Explain activity goals, requirements, and meeting point..."
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

          {/* Image URL */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cover Photo URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="calendar" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Create Event</Text>
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
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  selectedTypeChip: {
    backgroundColor: COLORS.primaryDark,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedTypeChipText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
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
