import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { StatCard } from '../../components/common/StatCard';
import { ProgressRing } from '../../components/common/ProgressRing';
import { RadarChart } from '../../components/common/RadarChart';
import { GradientButton } from '../../components/common/GradientButton';
import { AssessmentResult } from '../../types';

export const AssessmentResultScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const result: AssessmentResult = route.params?.result || {
    id: 'res-default',
    assessmentId: 'drill-1',
    assessmentTitle: 'Vertical Jump Mechanics',
    athleteId: 'ath-1',
    date: 'Just Now',
    overallScore: 96,
    correctReps: 12,
    incorrectReps: 1,
    postureScore: 97,
    consistency: 94,
    stability: 96,
    jointAngles: {
      kneeFlexion: 112,
      hipAngle: 88,
      shoulderAlignment: 99,
    },
    recommendations: [
      'Top 1% vertical displacement & explosive velocity takeoff.',
      'Slight knee valgus on rep 7 landing - focus on glute medius activation.',
      'Symmetry index: 98% balanced right/left force distribution.'
    ],
    durationSeconds: 60,
  };

  const radarSkillPoints = [
    { label: 'POWER', value: result.overallScore },
    { label: 'POSTURE', value: result.postureScore },
    { label: 'STABILITY', value: result.stability },
    { label: 'CONSISTENCY', value: result.consistency },
    { label: 'TECHNIQUE', value: 95 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Banner */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trial Analysis Report</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Reports')} style={styles.shareBtn}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Score Hero Card */}
      <View style={styles.scoreHero}>
        <Text style={styles.drillName}>{result.assessmentTitle}</Text>
        <Text style={styles.dateText}>Performed: {result.date}</Text>

        <View style={styles.ringCenter}>
          <ProgressRing
            progress={result.overallScore}
            size={130}
            strokeWidth={12}
            color="#38BDF8"
            label="SCORE"
          />
        </View>

        <View style={styles.repSummaryRow}>
          <View style={styles.repItem}>
            <Text style={[styles.repVal, { color: '#22C55E' }]}>{result.correctReps}</Text>
            <Text style={styles.repLbl}>VALID REPS</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.repItem}>
            <Text style={[styles.repVal, { color: '#EF4444' }]}>{result.incorrectReps}</Text>
            <Text style={styles.repLbl}>INCORRECT</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.repItem}>
            <Text style={[styles.repVal, { color: '#F59E0B' }]}>{result.durationSeconds}s</Text>
            <Text style={styles.repLbl}>TIME</Text>
          </View>
        </View>
      </View>

      {/* Detailed Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard title="Posture Rating" value={`${result.postureScore}%`} icon="body-outline" color={colors.emerald} />
        <StatCard title="Kinetic Stability" value={`${result.stability}%`} icon="pulse-outline" color={colors.accent} />
      </View>

      {/* Radar Breakdown */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Biomechanical Skill Radar</Text>
        <RadarChart data={radarSkillPoints} size={250} primaryColor={colors.primary} />
      </View>

      {/* AI Recommendations */}
      <View style={styles.sectionCard}>
        <View style={styles.recHeader}>
          <Ionicons name="sparkles" size={20} color={colors.accent} />
          <Text style={styles.sectionTitle}>AI Scout Recommendations</Text>
        </View>

        {result.recommendations.map((rec, index) => (
          <View key={index} style={styles.recBullet}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.emerald} />
            <Text style={styles.recText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* Action Footer */}
      <View style={styles.footerGroup}>
        <GradientButton
          title="Done & View Analytics"
          icon="analytics-outline"
          onPress={() => navigation.navigate('MainTabs')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary, // #0B1F3A
  },
  shareBtn: {
    padding: spacing.xs,
  },
  scoreHero: {
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#0B1F3A',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  drillName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  dateText: {
    color: '#93C5FD',
    fontSize: 12,
    marginTop: 2,
  },
  ringCenter: {
    marginVertical: spacing.lg,
  },
  repSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  repItem: {
    alignItems: 'center',
  },
  repVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  repLbl: {
    color: '#DBEAFE',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  recBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: spacing.sm,
  },
  recText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  footerGroup: {
    marginTop: spacing.sm,
  },
});
