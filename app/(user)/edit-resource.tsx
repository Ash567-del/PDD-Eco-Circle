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
import { resourceService } from '../../services/resourceService';
import { ResourceCategory, ResourceCondition, ResourceItem } from '../../types/resource';

const CATEGORIES: ResourceCategory[] = [
  'Furniture',
  'Books',
  'Electronics',
  'Clothing',
  'Kitchen',
  'Toys',
  'Other',
];

const CONDITIONS: ResourceCondition[] = ['New', 'Like New', 'Good', 'Used'];

export default function EditResourceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<ResourceItem | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Furniture');
  const [condition, setCondition] = useState<ResourceCondition>('Good');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      if (!id || !currentUser) return;
      const item = await resourceService.getResourceById(id);

      if (!item) {
        Alert.alert('Error', 'Resource not found.');
        router.back();
        return;
      }

      // Security check: Only resource owner can edit
      if (item.ownerId !== currentUser.id) {
        Alert.alert('Access Denied', 'You are not authorized to edit this resource.');
        router.back();
        return;
      }

      setResource(item);
      setTitle(item.title);
      setDescription(item.description);
      setCategory(item.category);
      setCondition(item.condition);
      setLocation(item.location);
      setImageUrl(item.imageUrl);
      setLoading(false);
    };

    fetchResource();
  }, [id, currentUser, router]);

  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    }

    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters long.';
    }

    if (!location.trim()) {
      errs.location = 'Pickup location is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!currentUser || !id) return;
    if (!validateForm()) return;

    setSubmitting(true);
    const res = await resourceService.updateResource(id, currentUser.id, {
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      location: location.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      await refreshData();
      Alert.alert('Success', 'Resource updated successfully.', [
        {
          text: 'OK',
          onPress: () => router.replace(ROUTES.MY_RESOURCES as any),
        },
      ]);
    } else {
      Alert.alert('Update Failed', res.message || 'Unable to update resource.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading resource details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.screenTitle}>Edit Resource</Text>
          <Text style={styles.screenSubtitle}>Update details for your shared item.</Text>

          <Card style={styles.card}>
            <Input
              label="Resource Title *"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <Input
              label="Description *"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
              error={errors.description}
            />

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>Category *</Text>
            <View style={styles.chipsGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[styles.chip, isSelected ? styles.chipSelected : null]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Condition Selector */}
            <Text style={styles.fieldLabel}>Condition *</Text>
            <View style={styles.chipsGrid}>
              {CONDITIONS.map((cond) => {
                const isSelected = condition === cond;
                return (
                  <Pressable
                    key={cond}
                    style={[styles.chip, isSelected ? styles.chipSelected : null]}
                    onPress={() => setCondition(cond)}
                  >
                    <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                      {cond}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              label="Pickup Location *"
              value={location}
              onChangeText={setLocation}
              error={errors.location}
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
  content: { padding: 20, paddingBottom: 40 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  screenSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
  card: { padding: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 4 },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  chipText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  chipTextSelected: { color: COLORS.white, fontWeight: '700' },
});
