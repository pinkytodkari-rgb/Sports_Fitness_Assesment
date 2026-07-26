import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';

export const AdminSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [autoVerify, setAutoVerify] = useState(true);
  const [debugHud, setDebugHud] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Admin System Configuration" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.textGroup}>
              <Text style={styles.settingTitle}>Auto-Verify High AI Ratings</Text>
              <Text style={styles.settingSub}>Automatically issue verified badges for scores {'>'}95.0</Text>
            </View>
            <Switch
              value={autoVerify}
              onValueChange={setAutoVerify}
              trackColor={{ false: '#E2E8F0', true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.textGroup}>
              <Text style={styles.settingTitle}>Debug Vision Pose Vectors</Text>
              <Text style={styles.settingSub}>Show joint coordinate numerical telemetry on Live HUD</Text>
            </View>
            <Switch
              value={debugHud}
              onValueChange={setDebugHud}
              trackColor={{ false: '#E2E8F0', true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.textGroup}>
              <Text style={styles.settingTitle}>Maintenance Mode</Text>
              <Text style={styles.settingSub}>Restrict platform access to system administrators</Text>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ false: '#E2E8F0', true: colors.rose }}
            />
          </View>
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
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  textGroup: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 15,
    fontWeight: '700',
  },
  settingSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
