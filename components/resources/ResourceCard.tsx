import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ResourceItem } from '../../types/resource';
import { StatusBadge } from '../common/StatusBadge';
import { COLORS } from '../../constants/colors';

interface ResourceCardProps {
  item: ResourceItem;
  horizontal?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ item, horizontal = false }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/(user)/resource-details' as any,
      params: { id: item.id },
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        horizontal ? styles.horizontalCard : null,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${item.title}`}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={horizontal ? styles.horizontalImage : styles.image}
        resizeMode="cover"
      />

      <View style={styles.detailsContainer}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.locationWrapper}>
            <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <Text style={styles.timeText}>{item.createdAt}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  horizontalCard: {
    width: 240,
    marginRight: 14,
    marginBottom: 4,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.primaryLight,
  },
  horizontalImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.primaryLight,
  },
  detailsContainer: {
    padding: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
