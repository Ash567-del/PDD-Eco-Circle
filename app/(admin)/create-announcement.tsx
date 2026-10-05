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
import { communityService } from '../../services/communityService';
import { authService } from '../../services/authService';
import { adminActivityService } from '../../services/adminActivityService';

export default function CreateAnnouncementScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { sendNotification, refreshData } = useAppData();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim()) {
      errs.title = 'Announcement title is required.';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    }

    if (!content.trim()) {
      errs.content = 'Announcement content is required.';
    } else if (content.trim().length < 10) {
      errs.content = 'Content must be at least 10 characters long.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePublish = async () => {
    if (!currentUser) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await communityService.createPost({
        authorId: currentUser.id,
        authorName: currentUser.fullName || 'Community Admin',
        communityName: currentUser.communityName || 'Green Valley Community',
        title: title.trim(),
        content: content.trim(),
        type: 'announcement',
        isAnnouncement: true,
        imageUrl: imageUrl.trim() || undefined,
      });

      if (res.success && res.post) {
        await refreshData();

        // Notify verified members
        const users = await authService.getAllUsers();
        const approvedUsers = users.filter(
          (u) => u.verificationStatus === 'approved' && u.id !== currentUser.id
        );

        for (const user of approvedUsers) {
          await sendNotification({
            userId: user.id,
            type: 'community_announcement',
            title: 'New Community Announcement',
            message: title.trim(),
            relatedId: res.post.id,
            relatedType: 'post',
          });
        }

        await adminActivityService.logActivity(
          'Announcement Published',
          `${currentUser.fullName} published official announcement '${title.trim()}'.`,
          'post',
          currentUser.fullName
        );

        Alert.alert('Success', 'Announcement published successfully.', [
          { text: 'OK', onPress: () => router.replace(ROUTES.ADMIN_POSTS as any) },
        ]);
      } else {
        Alert.alert('Publish Failed', res.message || 'Failed to publish announcement.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to publish announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Official Announcement</Text>
          <Text style={styles.headerSubtitle}>
            Publish important community notifications directly to member feeds and alerts.
          </Text>
        </View>

        <View style={styles.formCard}>
          {/* Title Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Announcement Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g., Water Supply Maintenance Notice"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
          </View>

          {/* Content Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Announcement Content *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput, errors.content && styles.inputError]}
              placeholder="Provide complete broadcast details for community members..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={COLORS.textMuted}
            />
            {errors.content ? <Text style={styles.errorText}>{errors.content}</Text> : null}
          </View>

          {/* Optional Image URL */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Banner Photo URL (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/banner.jpg"
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Publish Button */}
          <TouchableOpacity
            style={styles.publishBtn}
            onPress={handlePublish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="megaphone" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.publishBtnText}>Publish Announcement</Text>
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
    height: 120,
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
  publishBtn: {
    backgroundColor: '#9F1239',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  publishBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
