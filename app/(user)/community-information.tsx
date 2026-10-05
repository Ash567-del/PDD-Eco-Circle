import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';

export default function CommunityInformationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Community Information</Text>
        <Text style={styles.screenSubtitle}>
          Guidelines, contacts, and essential info for Greenwood Sector 4 residents.
        </Text>

        {/* Section 1: About Our Community */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="leaf-outline" size={22} color={COLORS.primaryDark} />
            <Text style={styles.cardTitle}>About Eco Circle Community</Text>
          </View>
          <Text style={styles.bodyText}>
            Eco Circle is a private, verified resident network designed to promote local sustainability, circular item reuse, mutual aid, and neighborhood cooperation in Greenwood Sector 4.
          </Text>
        </Card>

        {/* Section 2: Community Guidelines */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.primaryDark} />
            <Text style={styles.cardTitle}>Community Guidelines</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>Respect all members and keep discussions constructive and friendly.</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>Keep shared community spaces clean during clean-up drives and events.</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>Do not post misleading, false, or commercial advertisement content.</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>Do not share sensitive personal information or private phone numbers publicly.</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>Use the resource-sharing system responsibly and return borrowed items on time.</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.guidelineText}>Report infrastructure or safety problems through the official Report Problem feature.</Text>
          </View>
        </Card>

        {/* Section 3: Important Contacts */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="call-outline" size={22} color={COLORS.accentBlue} />
            <Text style={styles.cardTitle}>Important Contacts</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactName}>Community Admin Office</Text>
            <Text style={styles.contactPhone}>+1 555-0100 (Ext 101)</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactName}>Maintenance & Electrical</Text>
            <Text style={styles.contactPhone}>+1 555-0144</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactName}>Main Gate Security</Text>
            <Text style={styles.contactPhone}>+1 555-0199</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactName}>Emergency First Aid / Ambulance</Text>
            <Text style={styles.contactPhone}>+1 555-0911</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 18, paddingBottom: 36 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  screenSubtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: 18 },
  card: { padding: 18, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  bodyText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
  guidelineItem: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bullet: { fontSize: 14, color: COLORS.primaryDark, fontWeight: '700' },
  guidelineText: { fontSize: 13, color: COLORS.text, flex: 1, lineHeight: 18 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  contactName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  contactPhone: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },
});
