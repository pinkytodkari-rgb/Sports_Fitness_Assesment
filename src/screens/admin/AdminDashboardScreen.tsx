import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { StatCard } from '../../components/common/StatCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { LineChart } from '../../components/common/LineChart';

export const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const platformGrowthData = [
    { label: "Jan", value: 120 },
    { label: "Feb", value: 240 },
    { label: "Mar", value: 410 },
    { label: "Apr", value: 680 },
    { label: "May", value: 950 },
    { label: "Jun", value: 1420 },
  ];

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Platform Admin Operations" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Admin KPI Cards Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Active Athletes" value="1,420" icon="people-outline" trend="+14% this month" color={colors.primary} />
          <StatCard title="Verified Scouts" value="84" icon="shield-checkmark-outline" trend="+6 new" color={colors.accent} />
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Drills Evaluated" value="8,940" icon="fitness-outline" color={colors.emerald} />
          <StatCard title="AI Computer Vision" value="99.4%" icon="sparkles-outline" subtitle="Avg confidence" color={colors.amber} />
        </View>

        {/* Growth Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Platform Active User Growth</Text>
          <LineChart data={platformGrowthData} width={340} height={180} color={colors.accent} unit=" users" />
        </View>

        {/* Quick Admin Actions */}
        <SectionHeader title="Platform Management Modules" />

        <TouchableOpacity
          onPress={() => navigation.navigate('ManageUsers')}
          style={styles.adminModuleCard}
          activeOpacity={0.8}
        >
          <Ionicons name="people-circle-outline" size={24} color={colors.primary} />
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>User Account & Persona Management</Text>
            <Text style={styles.moduleSub}>Suspend, verify scouts, edit roles & reset passwords</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminReports')}
          style={styles.adminModuleCard}
          activeOpacity={0.8}
        >
          <Ionicons name="analytics-outline" size={24} color={colors.emerald} />
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>Global Assessment System Analytics</Text>
            <Text style={styles.moduleSub}>Monitor vision pose pipeline latency & dataset exports</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
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
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  chartTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  adminModuleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: borderRadius.card, // 18px
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 15,
    fontWeight: '700',
  },
  moduleSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
