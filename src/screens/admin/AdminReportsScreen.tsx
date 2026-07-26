import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { StatCard } from '../../components/common/StatCard';
import { LineChart } from '../../components/common/LineChart';

export const AdminReportsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const processingLatencyData = [
    { label: '00:00', value: 140 },
    { label: '04:00', value: 135 },
    { label: '08:00', value: 160 },
    { label: '12:00', value: 145 },
    { label: '16:00', value: 130 },
    { label: '20:00', value: 128 },
  ];

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Global Platform Reports" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard title="API Ingestion" value="99.98%" icon="server-outline" color={colors.emerald} />
          <StatCard title="Vision Latency" value="128 ms" icon="speedometer-outline" color={colors.accent} />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Vision Pose HUD Frame Latency (ms)</Text>
          <LineChart data={processingLatencyData} width={340} height={180} color={colors.accent} unit=" ms" />
        </View>

        <View style={styles.logCard}>
          <Text style={styles.logTitle}>System Operational Logs</Text>
          <Text style={styles.logText}>[07:22:15] Vision HUD Pipeline v4.2 compiled cleanly.</Text>
          <Text style={styles.logText}>[07:24:00] 142 assessment reports synced to regional storage.</Text>
          <Text style={styles.logText}>[07:26:10] Scout verification audit complete (Zero flags).</Text>
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
  logCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  logTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  logText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});
