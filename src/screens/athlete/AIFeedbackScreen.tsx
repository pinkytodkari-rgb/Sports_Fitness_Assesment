import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';

export const AIFeedbackScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const aiInsights = [
    {
      id: 1,
      title: 'Explosive Takeoff Acceleration',
      type: 'Strength',
      icon: 'checkmark-circle-outline',
      color: colors.emerald,
      content: 'Your initial vertical thrust reaches peak velocity in 0.18s, placing you in the 99th percentile for point guards in your age bracket.',
    },
    {
      id: 2,
      title: 'Knee Valgus Correction on Landing',
      type: 'Form Correction',
      icon: 'alert-circle-outline',
      color: colors.amber,
      content: 'In 2 out of 12 reps, your left knee showed 4.2° of inward collapse upon impact. Perform single-leg stability & glute medius activation drills.',
    },
    {
      id: 3,
      title: 'Lateral Plant Foot Angle',
      type: 'Optimization',
      icon: 'sparkles-outline',
      color: colors.accent,
      content: 'During the 5-10-5 shuttle turn, leaning your torso 3° lower will shave approximately 0.08 seconds off your total sprint time.',
    },
  ];

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="AI Biomechanical Feedback" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBox}>
          <Ionicons name="sparkles" size={28} color="#38BDF8" />
          <Text style={styles.heroTitle}>AI Assistant Biomechanical Audit</Text>
          <Text style={styles.heroSub}>
            Computer vision kinematic tracking analyzed 1,420 frame keypoints across your latest assessment trials.
          </Text>
        </View>

        {aiInsights.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.badge, { backgroundColor: `${item.color}15`, borderColor: item.color }]}>
                <Text style={[styles.badgeText, { color: item.color }]}>{item.type}</Text>
              </View>
            </View>
            <Text style={styles.cardContent}>{item.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  heroBox: {
    backgroundColor: '#0B1F3A',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  heroSub: {
    color: '#E2E8F0',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    flex: 1,
    color: colors.primary, // #0B1F3A
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardContent: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});
