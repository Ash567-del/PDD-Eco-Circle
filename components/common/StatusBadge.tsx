import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getColors = () => {
    switch (status.toUpperCase()) {
      case 'VERIFIED':
      case 'APPROVED':
      case 'ACCEPTED':
      case 'AVAILABLE':
      case 'RESOLVED':
        return { bg: COLORS.primaryLight, text: COLORS.primaryDark };
      case 'PENDING':
      case 'IN_PROGRESS':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'REJECTED':
      case 'UNAVAILABLE':
      case 'CANCELLED':
        return { bg: '#FFE4E6', text: '#9F1239' };
      case 'ADMIN':
        return { bg: '#F3E8FF', text: '#6B21A8' };
      default:
        return { bg: '#E2E8F0', text: COLORS.textMuted };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{status.replace('_', ' ')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
