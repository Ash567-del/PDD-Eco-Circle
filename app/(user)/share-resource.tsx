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
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import { resourceService } from '../../services/resourceService';
import { ResourceCategory, ResourceCondition } from '../../types/resource';

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

export default function ShareResourceScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { refreshData } = useAppData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Furniture');
  const [condition, setCondition] = useState<ResourceCondition>('Good');
  const [location, setLocation] = useState(currentUser?.area || 'Sector 4 Community Hub');
  const [imageUrl, setImageUrl] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim()) {
      errs.title = 'Title is required.';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    }

    if (!description.trim()) {
      errs.description = 'Description is required.';
    } else if (description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters long.';
    }

    if (!location.trim()) {
      errs.location = 'Pickup location is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please log in to share a resource.');
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);
    const res = await resourceService.createResource({
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      location: location.trim(),
      imageUrl: imageUrl.trim() || undefined,
      ownerId: currentUser.id,
      ownerName: currentUser.fullName,
      communityName: currentUser.communityName,
    });
    setSubmitting(false);

    if (res.success) {
      await refreshData();
      Alert.alert('Success!', 'Resource shared successfully!', [
        {
          text: 'View My Resources',
          onPress: () => router.replace(ROUTES.MY_RESOURCES as any),
        },
      ]);
    } else {
      Alert.alert('Error', res.message || 'Unable to share resource.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.screenTitle}>Share a Resource</Text>
          <Text style={styles.screenSubtitle}>
            Give something you no longer need a new purpose within your community.
          </Text>

          <Card style={styles.card}>
            <Input
              label="Resource Title *"
              placeholder="e.g. Wooden Dining Table"
              iconName="cube-outline"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <Input
              label="Description *"
              placeholder="Describe the item, dimensions, features, or minor flaws..."
              iconName="document-text-outline"
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
              label="Pickup Location / Area *"
              placeholder="e.g. Sector 4 Community Hub"
              iconName="location-outline"
              value={location}
              onChangeText={setLocation}
              error={errors.location}
            />

            <Input
              label="Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              iconName="image-outline"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            <View style={styles.ownerNoticeBox}>
              <Ionicons name="person-circle-outline" size={20} color={COLORS.primaryDark} />
              <Text style={styles.ownerNoticeText}>
                Posting as: <Text style={{ fontWeight: '700' }}>{currentUser?.fullName}</Text> ({currentUser?.communityName})
              </Text>
            </View>

            <Button
              title="Share Resource"
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  screenSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 20,
  },
  card: {
    padding: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 4,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  ownerNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  ownerNoticeText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    flex: 1,
  },
});
