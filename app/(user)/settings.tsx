import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { notificationPreferences, updateNotificationPreferences } = useAppData();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleToggle = async (key: keyof typeof notificationPreferences, value: boolean) => {
    await updateNotificationPreferences({ [key]: value });
  };

  const handleLogoutConfirm = async () => {
    setLogoutModalVisible(false);
    await logout();
    router.replace(ROUTES.WELCOME as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ACCOUNT SECTION */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => router.push(ROUTES.EDIT_PROFILE as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
              <Ionicons name="person-outline" size={18} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Edit Profile</Text>
              <Text style={styles.rowSubtitle}>Update your personal and address details</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => router.push(ROUTES.NOTIFICATIONS as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="notifications-outline" size={18} color={COLORS.accentBlue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Notification Center</Text>
              <Text style={styles.rowSubtitle}>View and manage recent alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* PREFERENCES SECTION */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Preferences</Text>
        <View style={styles.cardGroup}>
          <View style={styles.rowItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="chatbubbles-outline" size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Community Updates</Text>
              <Text style={styles.rowSubtitle}>Alerts for announcements & discussion posts</Text>
            </View>
            <Switch
              value={notificationPreferences.communityUpdates}
              onValueChange={(val) => handleToggle('communityUpdates', val)}
              trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
              thumbColor={
                notificationPreferences.communityUpdates ? COLORS.primaryDark : '#94A3B8'
              }
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="calendar-outline" size={18} color="#047857" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Event Reminders</Text>
              <Text style={styles.rowSubtitle}>Reminders for upcoming community events</Text>
            </View>
            <Switch
              value={notificationPreferences.eventReminders}
              onValueChange={(val) => handleToggle('eventReminders', val)}
              trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
              thumbColor={
                notificationPreferences.eventReminders ? COLORS.primaryDark : '#94A3B8'
              }
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="cube-outline" size={18} color={COLORS.accentBlue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Resource Request Alerts</Text>
              <Text style={styles.rowSubtitle}>Alerts when neighbors request your items</Text>
            </View>
            <Switch
              value={notificationPreferences.resourceRequests}
              onValueChange={(val) => handleToggle('resourceRequests', val)}
              trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
              thumbColor={
                notificationPreferences.resourceRequests ? COLORS.primaryDark : '#94A3B8'
              }
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="warning-outline" size={18} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Problem Status Updates</Text>
              <Text style={styles.rowSubtitle}>Updates when reported issues change status</Text>
            </View>
            <Switch
              value={notificationPreferences.problemStatusUpdates}
              onValueChange={(val) => handleToggle('problemStatusUpdates', val)}
              trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
              thumbColor={
                notificationPreferences.problemStatusUpdates ? COLORS.primaryDark : '#94A3B8'
              }
            />
          </View>
        </View>

        {/* SECURITY & LOGOUT SECTION */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Security</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => setLogoutModalVisible(true)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: '#DC2626' }]}>Sign Out</Text>
              <Text style={styles.rowSubtitle}>Safely disconnect current session</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ABOUT SECTION */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>About</Text>
        <View style={styles.aboutCard}>
          <Ionicons name="leaf-outline" size={32} color={COLORS.primaryDark} style={{ marginBottom: 6 }} />
          <Text style={styles.appName}>Eco Circle</Text>
          <Text style={styles.appTagline}>"Share. Connect. Solve. Together."</Text>
          <Text style={styles.appVersion}>Version 1.0.0 (Phase 6 Build)</Text>
        </View>
      </ScrollView>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="log-out" size={44} color="#DC2626" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Logout?</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout from Eco Circle?</Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalLogoutBtn}
                onPress={handleLogoutConfirm}
              >
                <Text style={styles.modalLogoutBtnText}>Logout</Text>
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
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  rowSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 62,
  },
  aboutCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  appTagline: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.primaryDark,
    marginTop: 2,
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 11,
    color: COLORS.textMuted,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
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
  modalLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalLogoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
