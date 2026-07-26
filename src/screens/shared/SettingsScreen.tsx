import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { CustomModal } from '../../components/common/CustomModal';
import { useApp } from '../../context/AppContext';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { themeMode, toggleThemeMode } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Settings & Preferences" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.textGroup}>
              <Text style={styles.settingLabel}>Light Theme Interface</Text>
              <Text style={styles.settingSub}>Enterprise white & navy blue aesthetic</Text>
            </View>
            <Switch
              value={true}
              onValueChange={toggleThemeMode}
              trackColor={{ false: '#E2E8F0', true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.textGroup}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingSub}>Assessment results & scout shortlist alerts</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E2E8F0', true: colors.primary }}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Security & Privacy</Text>

          <TouchableOpacity
            onPress={() => setPrivacyModalVisible(true)}
            style={styles.linkRow}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={styles.linkText}>Privacy Policy & Data Security</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAboutModalVisible(true)}
            style={styles.linkRow}
            activeOpacity={0.8}
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.linkText}>About AthleteAI v1.0.0</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Privacy Modal */}
      <CustomModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title="Privacy Policy"
      >
        <Text style={styles.modalText}>
          AthleteAI protects athlete biometric data with enterprise encryption. All vision frame landmark extraction is processed locally on-device. No raw video feed is stored without explicit consent.
        </Text>
      </CustomModal>

      {/* About Modal */}
      <CustomModal
        visible={aboutModalVisible}
        onClose={() => setAboutModalVisible(false)}
        title="About AthleteAI"
      >
        <Text style={styles.modalText}>
          AthleteAI v1.0.0 is an AI-powered Athlete Assessment & Talent Discovery Platform built using Expo SDK, React Native, and vision analytics models. Designed for athletes, scouts, and collegiate directors.
        </Text>
      </CustomModal>
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
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
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
  },
  settingLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  settingSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: spacing.md,
  },
  linkText: {
    flex: 1,
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  modalText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
