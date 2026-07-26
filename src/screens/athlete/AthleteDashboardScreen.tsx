import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { StatCard } from '../../components/common/StatCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { ProgressRing } from '../../components/common/ProgressRing';
import { AssessmentCard } from '../../components/cards/AssessmentCard';
import { useApp } from '../../context/AppContext';
import assessmentsData from '../../data/assessments.json';
import leaderboardData from '../../data/leaderboard.json';
import { DrillAssessment } from '../../types';

export const AthleteDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useApp();

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dynamic Welcome Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroInner}>
            <View style={styles.heroRow}>
              <View style={styles.heroTextWrapper}>
                <Text style={styles.greetingText}>Welcome back, {user.name.split(' ')[0]} 👋</Text>
                <Text style={styles.heroTitle}>Biometric Readiness Score</Text>
                <Text style={styles.heroDesc}>
                  Your muscles & kinetic stability are optimized for peak performance today.
                </Text>

                <TouchableOpacity
                  onPress={() => navigation.navigate('LiveAssessment', { drill: assessmentsData[0] })}
                  style={styles.heroCTA}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play-circle" size={18} color="#0B1F3A" />
                  <Text style={styles.heroCTAText}>Quick Assessment</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressWrapper}>
                <ProgressRing progress={96} size={94} strokeWidth={8} color="#38BDF8" label="AI INDEX" />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Overall AI Rating" value="96.4" icon="shield-checkmark-outline" trend="+2.4% this week" color={colors.accent} />
          <StatCard title="Total Drills" value="28" icon="fitness-outline" subtitle="8 tests verified" color={colors.primary} />
        </View>

        {/* Featured Drills Section */}
        <SectionHeader
          title="Recommended Drills"
          subtitle="AI-tailored biomechanical tests"
          actionText="View All"
          onActionPress={() => navigation.navigate('AssessmentCenterTab')}
        />

        {assessmentsData.slice(0, 2).map((drill) => (
          <AssessmentCard
            key={drill.id}
            drill={drill as DrillAssessment}
            onPress={() => navigation.navigate('LiveAssessment', { drill })}
          />
        ))}

        {/* Quick AI Feedback Banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AIFeedback')}
          style={styles.feedbackBanner}
          activeOpacity={0.85}
        >
          <View style={styles.feedbackInner}>
            <Ionicons name="bulb-outline" size={24} color={colors.accent} />
            <View style={styles.feedbackTextGroup}>
              <Text style={styles.feedbackTitle}>AI Coach Recommendation</Text>
              <Text style={styles.feedbackSub}>"Explosive first step strength is in top 1%. Increase knee flexion stability on landings."</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Global Regional Leaderboard Preview */}
        <SectionHeader
          title="Regional Leaderboard"
          subtitle="Western Conference Point Guards"
          actionText="Achievements"
          onActionPress={() => navigation.navigate('Achievements')}
        />

        {leaderboardData.slice(0, 3).map((item) => (
          <View key={item.rank} style={styles.leaderboardRow}>
            <Text style={styles.rankNum}>#{item.rank}</Text>
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderName}>{item.name}</Text>
              <Text style={styles.leaderSport}>{item.sport}</Text>
            </View>
            <View style={styles.leaderScoreBadge}>
              <Text style={styles.leaderScoreText}>{item.score}</Text>
            </View>
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
    paddingBottom: 100,
  },
  heroCard: {
    borderRadius: borderRadius.card, // 18px
    overflow: 'hidden',
    backgroundColor: '#0B1F3A', // Dark Navy Brand Hero
    marginBottom: spacing.md,
    ...shadows.card,
  },
  heroInner: {
    padding: spacing.lg, // 20-24px
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextWrapper: {
    flex: 1,
    marginRight: spacing.md,
  },
  greetingText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  heroDesc: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.button,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  heroCTAText: {
    color: '#0B1F3A',
    fontSize: 13,
    fontWeight: '700',
  },
  progressWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  feedbackBanner: {
    borderRadius: borderRadius.card, // 18px
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginVertical: spacing.md,
    ...shadows.soft,
  },
  feedbackInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  feedbackTextGroup: {
    flex: 1,
  },
  feedbackTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.soft,
  },
  rankNum: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    width: 36,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  leaderSport: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  leaderScoreBadge: {
    backgroundColor: '#0B1F3A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
  },
  leaderScoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
