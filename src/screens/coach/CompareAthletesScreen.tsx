import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { RadarChart } from '../../components/common/RadarChart';
import { useApp } from '../../context/AppContext';

export const CompareAthletesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { selectedCompareAthletes, allAthletes, clearCompareAthletes } = useApp();

  const ath1 = selectedCompareAthletes[0] || allAthletes[0];
  const ath2 = selectedCompareAthletes[1] || allAthletes[1];

  const ath1Data = [
    { label: 'SPEED', value: ath1.speed },
    { label: 'POWER', value: ath1.power },
    { label: 'AGILITY', value: ath1.agility },
    { label: 'ENDURANCE', value: ath1.endurance },
    { label: 'TECHNIQUE', value: ath1.technique },
  ];

  const ath2Data = [
    { label: 'SPEED', value: ath2.speed },
    { label: 'POWER', value: ath2.power },
    { label: 'AGILITY', value: ath2.agility },
    { label: 'ENDURANCE', value: ath2.endurance },
    { label: 'TECHNIQUE', value: ath2.technique },
  ];

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Prospect Comparison" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Athletes Header */}
        <View style={styles.comparisonHeaderRow}>
          {/* Athlete 1 */}
          <View style={styles.athleteCol}>
            <Image source={{ uri: ath1.avatar }} style={styles.avatar1} />
            <Text style={styles.athName}>{ath1.name}</Text>
            <Text style={styles.athSub}>{ath1.sport}</Text>
            <View style={styles.badge1}>
              <Text style={styles.score1}>{ath1.overallScore}</Text>
            </View>
          </View>

          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Athlete 2 */}
          <View style={styles.athleteCol}>
            <Image source={{ uri: ath2.avatar }} style={styles.avatar2} />
            <Text style={styles.athName}>{ath2.name}</Text>
            <Text style={styles.athSub}>{ath2.sport}</Text>
            <View style={styles.badge2}>
              <Text style={styles.score2}>{ath2.overallScore}</Text>
            </View>
          </View>
        </View>

        {/* Dual Overlay Radar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Overlay Biomechanical Skills</Text>
          <RadarChart
            data={ath1Data}
            comparisonData={ath2Data}
            size={250}
            primaryColor={colors.primary}
            comparisonColor={colors.accent}
            labelOne={ath1.name.split(' ')[0]}
            labelTwo={ath2.name.split(' ')[0]}
          />
        </View>

        {/* Side-By-Side Metrics Table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Direct Metric Breakdown</Text>

          <View style={[styles.tableRow, styles.altRow]}>
            <Text style={styles.tableVal1}>{ath1.speed}</Text>
            <Text style={styles.tableLabel}>SPEED RATING</Text>
            <Text style={styles.tableVal2}>{ath2.speed}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableVal1}>{ath1.power}</Text>
            <Text style={styles.tableLabel}>POWER OUTPUT</Text>
            <Text style={styles.tableVal2}>{ath2.power}</Text>
          </View>

          <View style={[styles.tableRow, styles.altRow]}>
            <Text style={styles.tableVal1}>{ath1.agility}</Text>
            <Text style={styles.tableLabel}>AGILITY SHUTTLE</Text>
            <Text style={styles.tableVal2}>{ath2.agility}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableVal1}>{ath1.technique}</Text>
            <Text style={styles.tableLabel}>POSTURE FORM</Text>
            <Text style={styles.tableVal2}>{ath2.technique}</Text>
          </View>
        </View>

        {/* Reset Selection Button */}
        <TouchableOpacity onPress={clearCompareAthletes} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear Comparison</Text>
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
    paddingBottom: 60,
  },
  comparisonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0B1F3A',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  athleteCol: {
    alignItems: 'center',
  },
  avatar1: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  avatar2: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#60A5FA',
  },
  athName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  athSub: {
    color: '#93C5FD',
    fontSize: 11,
  },
  badge1: {
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  badge2: {
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  score1: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  score2: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  vsBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    color: '#0B1F3A',
    fontSize: 12,
    fontWeight: '800',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card,
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
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  tableTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  altRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
  },
  tableLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableVal1: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    width: 40,
    textAlign: 'center',
  },
  tableVal2: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '800',
    width: 40,
    textAlign: 'center',
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  clearBtnText: {
    color: colors.rose,
    fontSize: 14,
    fontWeight: '600',
  },
});
