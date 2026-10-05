import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { eventService } from '../../services/eventService';
import { adminActivityService } from '../../services/adminActivityService';
import { useAppData } from '../../contexts/AppDataContext';
import { EventType, CommunityEvent } from '../../types/event';

const EVENT_TYPES: { label: string; value: EventType }[] = [
  { label: 'Clean Up', value: 'clean_up' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Social', value: 'social' },
  { label: 'Sports', value: 'sports' },
  { label: 'Awareness', value: 'awareness' },
  { label: 'Other', value: 'other' },
];

export default function EditEventScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { refreshData } = useAppData();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<CommunityEvent | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('clean_up');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id);
    }
  }, [params.id]);

  const loadEvent = async (id: string) => {
    try {
      setLoading(true);
      const data = await eventService.getEventById(id);
      if (data) {
        setEvent(data);
        setTitle(data.title);
        setDescription(data.description);
        setType(data.type);
        setDate(data.date);
        setStartTime(data.startTime);
        setEndTime(data.endTime);
        setLocation(data.location);
        setMaxParticipants(data.maxParticipants ? String(data.maxParticipants) : '');
        setImageUrl(data.imageUrl || '');
      } else {
        Alert.alert('Error', 'Event not found.');
        router.back();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Event title is required.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Description is required.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Validation Error', 'Date is required.');
      return;
    }
    if (!startTime.trim() || !endTime.trim()) {
      Alert.alert('Validation Error', 'Start time and end time are required.');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Location is required.');
      return;
    }

    try {
      setSaving(true);
      const updated = await eventService.updateEvent(params.id, {
        title: title.trim(),
        description: description.trim(),
        type,
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        location: location.trim(),
        maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
        imageUrl: imageUrl.trim() || undefined,
      });

      if (updated) {
        await adminActivityService.logActivity(
          'Event Updated',
          `Admin updated event "${title.trim()}".`,
          'event'
        );
        await refreshData();
        Alert.alert('Success', 'Event updated successfully.', [
          { text: 'OK', onPress: () => router.push(ROUTES.ADMIN_EVENTS as any) },
        ]);
      } else {
        Alert.alert('Error', 'Failed to update event.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while updating the event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Event</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Park Cleanup Drive"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Type Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Event Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {EVENT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, type === t.value && styles.activeTypeChip]}
                onPress={() => setType(t.value)}
              >
                <Text style={[styles.typeChipText, type === t.value && styles.activeTypeChipText]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Time row */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Start Time *</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="09:00 AM"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>End Time *</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="12:00 PM"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Central Community Park"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Max Participants */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Max Participants</Text>
          <TextInput
            style={styles.input}
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            placeholder="e.g. 50 (leave empty for unlimited)"
            keyboardType="number-pad"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Image URL */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Image URL (Optional)</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the event goals, prerequisites, and instructions..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Update Event</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
  },
  typeScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  activeTypeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeTypeChipText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
