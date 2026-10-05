import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { CommunityProblem, ProblemStatus, ProblemCategory } from '../../types/problem';
import { problemService } from '../../services/problemService';

export default function MyProblemsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [myProblems, setMyProblems] = useState<CommunityProblem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadMyProblems = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await problemService.getProblemsByUser(currentUser.id);
      setMyProblems(data);
    } catch (err) {
      console.error('Failed to load user problems:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      loadMyProblems();
    }, [loadMyProblems])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    await loadMyProblems();
  };

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

  const getStatusBadgeStyle = (status: ProblemStatus) => {
    switch (status) {
      case 'reported':
        return { label: 'Reported', bg: '#FEF3C7', text: '#D97706' };
      case 'under_review':
        return { label: 'Under Review', bg: '#EDE9FE', text: '#7C3AED' };
      case 'in_progress':
        return { label: 'In Progress', bg: '#E0F2FE', text: '#0284C7' };
      case 'resolved':
        return { label: 'Resolved', bg: '#D1FAE5', text: '#047857' };
      case 'closed':
        return { label: 'Closed', bg: '#F1F5F9', text: '#64748B' };
      default:
        return { label: status, bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const renderProblemCard = ({ item }: { item: CommunityProblem }) => {
    const statusStyle = getStatusBadgeStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: ROUTES.PROBLEM_DETAILS as any,
            params: { id: item.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{formatCategory(item.category)}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.primaryDark} style={styles.icon} />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color={COLORS.textMuted} style={styles.icon} />
          <Text style={styles.dateText}>
            Reported on {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.viewStatusText}>Track Status Timeline ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>My Reported Problems</Text>
            <Text style={styles.headerSubtitle}>
              Track status updates and resolution progress for issues you reported.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.reportNewBtn}
            onPress={() => router.push(ROUTES.REPORT_PROBLEM as any)}
          >
            <Ionicons name="add" size={18} color={COLORS.white} />
            <Text style={styles.reportNewBtnText}>Report New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={styles.loadingText}>Loading your reported problems...</Text>
        </View>
      ) : (
        <FlatList
          data={myProblems}
          keyExtractor={(item) => item.id}
          renderItem={renderProblemCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primaryDark]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>You haven't reported any community problems.</Text>
              <Text style={styles.emptySubtitle}>
                Report water leaks, streetlight outages, garbage issues, or road repair needs directly to community administrators.
              </Text>

              <TouchableOpacity
                style={styles.reportBtn}
                onPress={() => router.push(ROUTES.REPORT_PROBLEM as any)}
              >
                <Text style={styles.reportBtnText}>Report a Problem</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  reportNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  reportNewBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'flex-end',
  },
  viewStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 14,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  reportBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  reportBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
