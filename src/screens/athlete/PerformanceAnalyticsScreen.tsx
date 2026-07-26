import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { StatCard } from '../../components/common/StatCard';
import { LineChart } from '../../components/common/LineChart';
import { RadarChart } from '../../components/common/RadarChart';

export const PerformanceAnalyticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  const weeklyData = [
    { label: 'Mon', value: 92 },
    { label: 'Tue', value: 93.5 },
    { label: 'Wed', value: 91 },
    { label: 'Thu', value: 95.2 },
    { label: 'Fri', value: 96 },
    { label: 'Sat', value: 96.4 },
  ];

  const monthlyData = [
    { label: 'W1', value: 88 },
    { label: 'W2', value: 91 },
    { label: 'W3', value: 94 },
    { label: 'W4', value: 96.4 },
  ];

  const athleteRadarData = [
    { label: 'SPEED', value: 98 },
    { label: 'POWER', value: 92 },
    { label: 'AGILITY', value: 99 },
    { label: 'ENDURANCE', value: 91 },
    { label: 'TECHNIQUE', value: 95 },
  ];

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Performance Analytics" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Toggle Selector */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setTimeframe('weekly')}
            style={[styles.toggleBtn, timeframe === 'weekly' && styles.activeToggle]}
          >
            <Text style={[styles.toggleText, timeframe === 'weekly' && styles.activeToggleText]}>
              Weekly Trend
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTimeframe('monthly')}
            style={[styles.toggleBtn, timeframe === 'monthly' && styles.activeToggle]}
          >
            <Text style={[styles.toggleText, timeframe === 'monthly' && styles.activeToggleText]}>
              Monthly Velocity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Line Chart Container */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            {timeframe === 'weekly' ? '7-Day Biomechanical Velocity' : 'Monthly Performance Growth'}
          </Text>
          <LineChart
            data={timeframe === 'weekly' ? weeklyData : monthlyData}
            width={340}
            height={190}
            color={colors.accent}
            unit="pt"
          />
        </View>

        {/* Radar Skills Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Overall Athlete Metric Radar</Text>
          <RadarChart data={athleteRadarData} size={250} primaryColor={colors.primary} />
        </View>

        {/* Stat Highlights */}
        <View style={styles.statsGrid}>
          <StatCard title="Peak Power Output" value="38.5 in" icon="flash-outline" trend="+1.2 in" color={colors.primary} />
          <StatCard title="Reaction Time" value="210 ms" icon="pulse-outline" trend="Top 1%" color={colors.emerald} />
        </View>

        {/* Deep Dive Action Links */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AIFeedback')}
          style={styles.actionCard}
          activeOpacity={0.8}
        >
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>AI Biomechanical Form Correction</Text>
            <Text style={styles.actionSub}>Review video angle analysis & form tips</Text>
          </View>
          <Text style={styles.actionLinkText}>View Insights →</Text>
        </TouchableOpacity>
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
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.button,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
  },
  activeToggle: {
    backgroundColor: colors.primary, // #0B1F3A
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  chartTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: spacing.lg,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    ...shadows.soft,
  },
  actionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  actionTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  actionSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  actionLinkText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
});
