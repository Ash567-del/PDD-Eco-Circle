import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { communityService } from '../../services/communityService';
import { PostType, CommunityPost } from '../../types/community';

const POST_TYPES: { label: string; value: PostType }[] = [
  { label: 'General', value: 'general' },
  { label: 'Information', value: 'information' },
  { label: 'Question', value: 'question' },
  { label: 'Recommendation', value: 'recommendation' },
  { label: 'Community Help', value: 'community_help' },
];

export default function EditPostScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<CommunityPost | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('general');
  const [imageUrl, setImageUrl] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id || !currentUser) return;
      const item = await communityService.getPostById(id);

      if (!item) {
        Alert.alert('Error', 'Post not found.');
        router.back();
        return;
      }

      if (item.authorId !== currentUser.id) {
        Alert.alert('Access Denied', 'You are not authorized to edit this post.');
        router.back();
        return;
      }

      setPost(item);
      setTitle(item.title);
      setContent(item.content);
      setType(item.type);
      setImageUrl(item.imageUrl || '');
      setLoading(false);
    };

    fetchPost();
  }, [id, currentUser, router]);

  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    }

    if (!content.trim() || content.trim().length < 10) {
      errs.content = 'Content must be at least 10 characters long.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!currentUser || !id) return;
    if (!validateForm()) return;

    setSubmitting(true);
    const res = await communityService.updatePost(id, currentUser.id, {
      title: title.trim(),
      content: content.trim(),
      type,
      imageUrl: imageUrl.trim() || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      await refreshData();
      Alert.alert('Success', 'Post updated successfully.', [
        {
          text: 'OK',
          onPress: () => router.replace(ROUTES.MY_POSTS as any),
        },
      ]);
    } else {
      Alert.alert('Update Failed', res.message || 'Unable to update post.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading post details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.screenTitle}>Edit Post</Text>
          <Text style={styles.screenSubtitle}>Update content for your community post.</Text>

          <Card style={styles.card}>
            {/* Post Type Chips */}
            <Text style={styles.fieldLabel}>Post Type *</Text>
            <View style={styles.chipsGrid}>
              {POST_TYPES.map((pt) => {
                const isSelected = type === pt.value;
                return (
                  <Pressable
                    key={pt.value}
                    style={[styles.chip, isSelected ? styles.chipSelected : null]}
                    onPress={() => setType(pt.value)}
                  >
                    <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                      {pt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              label="Title *"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <Input
              label="Content *"
              multiline
              numberOfLines={5}
              value={content}
              onChangeText={setContent}
              error={errors.content}
            />

            <Input
              label="Image URL"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={submitting}
              style={{ marginTop: 14 }}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { fontSize: 13, color: COLORS.textMuted, marginTop: 10 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  screenSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
  card: { padding: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 4 },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  chipText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  chipTextSelected: { color: COLORS.white, fontWeight: '700' },
});
