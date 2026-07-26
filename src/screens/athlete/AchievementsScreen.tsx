import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';

export const AchievementsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const badges = [
    { id: 'b1', title: 'Speed Demon', desc: 'Achieved sub-4.35s sprint velocity threshold.', icon: 'flash', color: colors.amber, unlocked: true },
    { id: 'b2', title: 'Kinetic Master', desc: 'Maintained >96% posture symmetry across 10 trials.', icon: 'shield-checkmark', color: colors.emerald, unlocked: true },
    { id: 'b3', title: 'Vertical Monster', desc: 'Cleared 38.5 inches vertical jump displacement.', icon: 'trending-up', color: colors.primary, unlocked: true },
    { id: 'b4', title: 'Scout Magnet', desc: 'Shortlisted by 5+ verified collegiate scouts.', icon: 'eye', color: colors.accent, unlocked: true },
    { id: 'b5', title: 'Iron Athlete', desc: 'Complete 50 total AI biomechanical assessments.', icon: 'fitness', color: colors.textMuted, unlocked: false },
    { id: 'b6', title: 'Century Club', desc: 'Reach an overall AI rating of 98.0+.', icon: 'trophy', color: colors.textMuted, unlocked: false },
  ];

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Achievements & Badges" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.xpCard}>
          <Text style={styles.xpTitle}>Athlete Tier Level 4</Text>
          <Text style={styles.xpVal}>2,850 / 3,500 XP</Text>
          <View style={styles.xpBarTrack}>
            <View style={[styles.xpBarFill, { width: '80%' }]} />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Unlocked Badges & Milestones</Text>

        <View style={styles.badgeGrid}>
          {badges.map((b) => (
            <View key={b.id} style={[styles.badgeCard, !b.unlocked && styles.lockedCard]}>
              <View style={[styles.iconWrapper, { backgroundColor: b.unlocked ? `${b.color}15` : '#F1F5F9' }]}>
                <Ionicons name={b.icon as any} size={28} color={b.unlocked ? b.color : colors.textMuted} />
              </View>

              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>

              {b.unlocked ? (
                <View style={styles.unlockedChip}>
                  <Text style={styles.unlockedText}>UNLOCKED</Text>
                </View>
              ) : (
                <View style={styles.lockedChip}>
                  <Ionicons name="lock-closed" size={10} color={colors.textMuted} />
                  <Text style={styles.lockedText}>LOCKED</Text>
                </View>
              )}
            </View>
          ))}
        </View>
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
  xpCard: {
    backgroundColor: '#0B1F3A',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  xpTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  xpVal: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  xpBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.pill,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: borderRadius.pill,
  },
  sectionHeader: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  lockedCard: {
    opacity: 0.6,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
  unlockedChip: {
    marginTop: spacing.sm,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  unlockedText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  lockedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: spacing.sm,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  lockedText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
});
