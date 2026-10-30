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
        {/* Dynamic Welcome Hero Card - Clean Light & Orange Athletic Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroAccentBar} />
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
                  activeOpacity={0.85}
                >
                  <Ionicons name="play-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.heroCTAText}>Quick Assessment</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressWrapper}>
                <ProgressRing progress={96} size={94} strokeWidth={8} color={colors.primary} label="AI INDEX" />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Overall AI Rating" value="96.4" icon="shield-checkmark-outline" trend="+2.4% this week" color={colors.primary} />
          <StatCard title="Total Drills" value="28" icon="fitness-outline" subtitle="8 tests verified" color={colors.secondary} />
        </View>

        {/* Featured Drills Section */}
        <SectionHeader
          title="Recommended Drills"
          subtitle="AI-tailored biomechanical tests"
          actionText="View All"
          onActionPress={() => navigation.navigate('AssessmentCenterTab')}
        />

        {assessmentsData.slice(0, 3).map((drill) => (
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
            <View style={styles.bulbWrapper}>
              <Ionicons name="bulb" size={20} color={colors.primary} />
            </View>
            <View style={styles.feedbackTextGroup}>
              <Text style={styles.feedbackTitle}>AI Coach Recommendation</Text>
              <Text style={styles.feedbackSub}>"Push-up elbow depth exceeded 90° standard. Focus on maintaining symmetric knee drive on landings."</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* AI Sports Nutrition & Fuel Strategy Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('NutritionCoach')}
          style={styles.nutritionCard}
          activeOpacity={0.85}
        >
          <View style={styles.nutritionInner}>
            <View style={styles.nutritionIconBox}>
              <Ionicons name="restaurant" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.nutritionTextGroup}>
              <View style={styles.nutritionTagRow}>
                <Text style={styles.nutritionTagText}>AI RECOVERY & NUTRITION</Text>
                <View style={styles.activeDot} />
              </View>
              <Text style={styles.nutritionTitle}>Custom Fuel Blueprints</Text>
              <Text style={styles.nutritionSub}>
                Get 3-4 tailored meals, exact macros & hydration protocols mapped to your training activity.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  heroCard: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    position: 'relative',
    ...shadows.card,
  },
  heroAccentBar: {
    height: 4,
    backgroundColor: colors.primary,
    width: '100%',
  },
  heroInner: {
    padding: spacing.lg,
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
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  heroDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.button,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    ...shadows.glow,
  },
  heroCTAText: {
    color: '#FFFFFF',
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
    borderRadius: borderRadius.card,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginVertical: spacing.md,
    ...shadows.soft,
  },
  feedbackInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  bulbWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 85, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackTextGroup: {
    flex: 1,
  },
  feedbackTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  nutritionCard: {
    borderRadius: borderRadius.card,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  nutritionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  nutritionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  nutritionTextGroup: {
    flex: 1,
  },
  nutritionTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  nutritionTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emerald,
  },
  nutritionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  nutritionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
    marginTop: 2,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.soft,
  },
  rankNum: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    width: 36,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  leaderSport: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  leaderScoreBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
  },
  leaderScoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
