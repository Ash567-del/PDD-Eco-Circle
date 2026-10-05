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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { problemService } from '../../services/problemService';
import { notificationService } from '../../services/notificationService';
import { adminActivityService } from '../../services/adminActivityService';
import { useAppData } from '../../contexts/AppDataContext';
import { CommunityProblem, ProblemStatus } from '../../types/problem';
import { StatusBadge } from '../../components/common/StatusBadge';

const STATUS_OPTIONS: { label: string; value: ProblemStatus }[] = [
  { label: 'Reported', value: 'reported' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

export default function AdminProblemDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { refreshData } = useAppData();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [problem, setProblem] = useState<CommunityProblem | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<ProblemStatus>('reported');
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    if (params.id) {
      loadProblem(params.id);
    }
  }, [params.id]);

  const loadProblem = async (id: string) => {
    try {
      setLoading(true);
      const data = await problemService.getProblemById(id);
      if (data) {
        setProblem(data);
        setSelectedStatus(data.status);
        setResolutionNote(data.resolutionNote || '');
      } else {
        Alert.alert('Error', 'Problem report not found.');
        router.back();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load problem details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!problem) return;

    if (selectedStatus === 'resolved' && !resolutionNote.trim()) {
      Alert.alert(
        'Resolution Note Required',
        'Please provide a brief resolution note explaining how the issue was resolved.'
      );
      return;
    }

    try {
      setUpdating(true);

      const updated = await problemService.updateProblem(problem.id, {
        status: selectedStatus,
        resolutionNote: resolutionNote.trim() || undefined,
      });

      if (updated) {
        const statusDisplay = selectedStatus.replace('_', ' ').toUpperCase();

        let message = `Your reported issue '${problem.title}' is now marked as ${statusDisplay}.`;
        if (selectedStatus === 'resolved' && resolutionNote.trim()) {
          message += ` Resolution Note: ${resolutionNote.trim()}`;
        }

        await notificationService.createNotification({
          userId: problem.reportedById,
          type: 'problem_update',
          title: 'Problem Status Updated',
          message,
          relatedId: problem.id,
          relatedType: 'problem',
        });

        await adminActivityService.logActivity(
          'Problem Status Updated',
          `Admin updated problem "${problem.title}" status to ${statusDisplay}.`,
          'problem'
        );

        await refreshData();
        setProblem(updated);

        Alert.alert('Success', `Problem status updated to ${statusDisplay}.`);
      } else {
        Alert.alert('Error', 'Failed to update problem status.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while updating problem status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading problem details...</Text>
      </SafeAreaView>
    );
  }

  if (!problem) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Problem Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title & Status */}
        <View style={styles.titleCard}>
          <View style={styles.statusRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{problem.category}</Text>
            </View>
            <StatusBadge status={problem.status} />
          </View>
          <Text style={styles.title}>{problem.title}</Text>
          <Text style={styles.dateText}>
            Reported on {new Date(problem.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* Optional Image */}
        {problem.imageUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: problem.imageUrl }} style={styles.image} resizeMode="cover" />
          </View>
        )}

        {/* Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{problem.description}</Text>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{problem.location}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={COLORS.primary} />
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Reported By</Text>
                <Text style={styles.infoValue}>{problem.reportedByName}</Text>
              </View>
            </View>

            {problem.updatedAt && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Last Updated</Text>
                  <Text style={styles.infoValue}>
                    {new Date(problem.updatedAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Existing Resolution Note if any */}
        {problem.resolutionNote && (
          <View style={styles.resolutionCard}>
            <View style={styles.resolutionHeader}>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.resolutionTitle}>Current Resolution Note</Text>
            </View>
            <Text style={styles.resolutionText}>{problem.resolutionNote}</Text>
          </View>
        )}

        {/* Admin Action: Status Transition */}
        <View style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <Text style={styles.subLabel}>Select new problem status:</Text>

          <View style={styles.statusPickerGrid}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.statusOptionBtn,
                  selectedStatus === opt.value && styles.activeStatusOptionBtn,
                ]}
                onPress={() => setSelectedStatus(opt.value)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === opt.value && styles.activeStatusOptionText,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Resolution Note Field */}
          <Text style={styles.subLabel}>Resolution / Moderation Note:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={resolutionNote}
            onChangeText={setResolutionNote}
            placeholder="Add details regarding status change or issue resolution..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.updateButton, updating && styles.disabledButton]}
            onPress={handleUpdateStatus}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>Update Status</Text>
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
  titleCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextGroup: {
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 1,
  },
  resolutionCard: {
    backgroundColor: '#ECFDF5',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  resolutionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginLeft: 6,
  },
  resolutionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 12,
    marginBottom: 8,
  },
  statusPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  statusOptionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeStatusOptionBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeStatusOptionText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
