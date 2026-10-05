import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { CommunityProblem, ProblemCategory, ProblemStatus } from '../../types/problem';
import { problemService } from '../../services/problemService';

const STATUS_STEPS: { key: ProblemStatus; label: string; desc: string }[] = [
  { key: 'reported', label: 'Reported', desc: 'Issue submitted by member' },
  { key: 'under_review', label: 'Under Review', desc: 'Admin inspecting the report' },
  { key: 'in_progress', label: 'In Progress', desc: 'Maintenance team assigned' },
  { key: 'resolved', label: 'Resolved', desc: 'Work finished & verified' },
  { key: 'closed', label: 'Closed', desc: 'Report archived' },
];

export default function ProblemDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [problem, setProblem] = useState<CommunityProblem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

  const fetchProblemDetails = useCallback(async () => {
    if (!params.id) return;
    try {
      const data = await problemService.getProblemById(params.id);
      setProblem(data);
    } catch (err) {
      console.error('Failed to load problem details:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      fetchProblemDetails();
    }, [fetchProblemDetails])
  );

  const handleDelete = async () => {
    setDeleteModalVisible(false);
    if (!currentUser || !problem) return;

    setDeleteLoading(true);
    try {
      const res = await problemService.deleteProblem(problem.id, currentUser.id);
      if (res.success) {
        await refreshData();
        Alert.alert('Deleted', 'Your problem report has been deleted.', [
          {
            text: 'OK',
            onPress: () => router.replace(ROUTES.MY_PROBLEMS as any),
          },
        ]);
      } else {
        Alert.alert('Cannot Delete', res.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to delete report.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryDark} />
        <Text style={styles.loadingText}>Loading report details...</Text>
      </SafeAreaView>
    );
  }

  if (!problem) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        <Text style={styles.notFoundTitle}>Report Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          The requested problem report does not exist or has been removed.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formatCategory = (cat: ProblemCategory): string => {
    switch (cat) {
      case 'water':
        return 'Water';
      case 'electricity':
        return 'Electricity';
      case 'cleanliness':
        return 'Cleanliness';
      case 'roads':
        return 'Roads';
      case 'parking':
        return 'Parking';
      case 'security':
        return 'Security';
      case 'noise':
        return 'Noise';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Other';
    }
  };

  const isOwner = currentUser ? currentUser.id === problem.reportedById : false;
  const canDelete = isOwner && problem.status === 'reported';

  // Find step index in timeline
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === problem.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Optional Image */}
        {problem.imageUrl ? (
          <Image source={{ uri: problem.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : null}

        <View style={styles.content}>
          {/* Header Badges */}
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{formatCategory(problem.category)}</Text>
            </View>

            <View style={styles.communityBadge}>
              <Text style={styles.communityBadgeText}>{problem.communityName}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{problem.title}</Text>

          {/* Metadata Card */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.primaryDark} />
              <Text style={styles.metaText}>{problem.location}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.metaSubText}>Reported by {problem.reportedByName}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.metaSubText}>
                Date: {new Date(problem.createdAt).toLocaleDateString()} at{' '}
                {new Date(problem.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {/* Resolution Note if Available */}
          {problem.resolutionNote ? (
            <View style={styles.resolutionCard}>
              <View style={styles.resolutionHeader}>
                <Ionicons name="checkmark-done-circle" size={20} color="#047857" />
                <Text style={styles.resolutionTitle}>Resolution Update</Text>
              </View>
              <Text style={styles.resolutionBody}>{problem.resolutionNote}</Text>
            </View>
          ) : null}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problem Description</Text>
            <Text style={styles.descriptionText}>{problem.description}</Text>
          </View>

          {/* Status Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Timeline</Text>
            <Text style={styles.sectionSubtitle}>
              Live progression tracked by community administrators.
            </Text>

            <View style={styles.timelineContainer}>
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <View key={step.key} style={styles.timelineRow}>
                    {/* Circle & Line */}
                    <View style={styles.timelineGraphicCol}>
                      <View
                        style={[
                          styles.timelineDot,
                          isPassed && styles.timelineDotPassed,
                          isCurrent && styles.timelineDotCurrent,
                        ]}
                      >
                        {isPassed ? (
                          <Ionicons
                            name={isCurrent ? 'radio-button-on' : 'checkmark'}
                            size={12}
                            color={COLORS.white}
                          />
                        ) : null}
                      </View>

                      {idx < STATUS_STEPS.length - 1 ? (
                        <View
                          style={[
                            styles.timelineLine,
                            isPassed && idx < currentStepIndex && styles.timelineLinePassed,
                          ]}
                        />
                      ) : null}
                    </View>

                    {/* Step Info */}
                    <View style={styles.timelineTextCol}>
                      <Text
                        style={[
                          styles.stepLabel,
                          isPassed && styles.stepLabelPassed,
                          isCurrent && styles.stepLabelCurrent,
                        ]}
                      >
                        {step.label}
                      </Text>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Delete Action Footer (Only for report owner if status === 'reported') */}
      {canDelete ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setDeleteModalVisible(true)}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.deleteBtnText}>Delete Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : isOwner && problem.status !== 'reported' ? (
        <View style={styles.lockedFooter}>
          <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.lockedFooterText}>
            Reports under review or in progress cannot be deleted.
          </Text>
        </View>
      ) : null}

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="trash" size={44} color="#DC2626" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Delete Report?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove this report? This action cannot be undone.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirmDeleteBtn} onPress={handleDelete}>
                <Text style={styles.modalConfirmDeleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  communityBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  communityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
    lineHeight: 28,
  },
  metaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  metaSubText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  resolutionCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  resolutionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  resolutionBody: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: 8,
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineGraphicCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineDotPassed: {
    backgroundColor: COLORS.primaryDark,
  },
  timelineDotCurrent: {
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  timelineLinePassed: {
    backgroundColor: COLORS.primaryDark,
  },
  timelineTextCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 20,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepLabelPassed: {
    color: COLORS.text,
    fontWeight: '700',
  },
  stepLabelCurrent: {
    color: '#0284C7',
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  deleteBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  lockedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 6,
  },
  lockedFooterText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalConfirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmDeleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
