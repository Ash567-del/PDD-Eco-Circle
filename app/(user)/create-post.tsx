import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { communityService } from '../../services/communityService';
import { PostType } from '../../types/community';

const POST_TYPES: { label: string; value: PostType }[] = [
  { label: 'General', value: 'general' },
  { label: 'Information', value: 'information' },
  { label: 'Question', value: 'question' },
  { label: 'Recommendation', value: 'recommendation' },
  { label: 'Community Help', value: 'community_help' },
];

export default function CreatePostScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('general');
  const [imageUrl, setImageUrl] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please log in to publish a post.');
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);
    const res = await communityService.createPost({
      title: title.trim(),
      content: content.trim(),
      type,
      imageUrl: imageUrl.trim() || undefined,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      communityName: currentUser.communityName,
    });
    setSubmitting(false);

    if (res.success) {
      await refreshData();
      Alert.alert('Post Published!', 'Your community post has been published.', [
        {
          text: 'View Feed',
          onPress: () => router.replace(ROUTES.COMMUNITY as any),
        },
      ]);
    } else {
      Alert.alert('Error', res.message || 'Unable to publish post.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.screenTitle}>Create Community Post</Text>
          <Text style={styles.screenSubtitle}>
            Share updates, ask questions, or provide local recommendations.
          </Text>

          <Card style={styles.card}>
            {/* Post Type Chips */}
            <Text style={styles.fieldLabel}>Select Post Type *</Text>
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
              label="Post Title *"
              placeholder="e.g. Weekend Composting Workshop Tips"
              iconName="document-text-outline"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <Input
              label="Content *"
              placeholder="Write your message to the community..."
              iconName="create-outline"
              multiline
              numberOfLines={5}
              value={content}
              onChangeText={setContent}
              error={errors.content}
            />

            <Input
              label="Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              iconName="image-outline"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            <Button
              title="Publish Post"
              onPress={handleSubmit}
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
