import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: number;
  style?: StyleProp<ViewStyle & ImageStyle>;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  imageUrl,
  size = 50,
  style,
}) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const borderRadius = size / 2;
  const fontSize = Math.max(12, Math.floor(size * 0.4));

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius,
          },
          style as StyleProp<ImageStyle>,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallbackContainer,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style as StyleProp<ViewStyle>,
      ]}
    >
      <Text style={[styles.initialsText, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primaryDark,
  },
  initialsText: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
});
