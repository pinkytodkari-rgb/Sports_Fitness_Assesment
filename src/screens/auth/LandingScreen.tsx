import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { GradientButton } from '../../components/common/GradientButton';

export const LandingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Brand Logo */}
        <View style={styles.logoRow}>
          <View style={styles.iconChip}>
            <Ionicons name="sparkles" size={24} color={colors.accent} />
          </View>
          <Text style={styles.logoText}>Athlete<Text style={{ color: colors.accent }}>AI</Text></Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.taglineChip}>
            <Text style={styles.taglineText}>⚡ TALENT DISCOVERY & PERFORMANCE PLATFORM</Text>
          </View>

          <Text style={styles.heroTitle}>
            AI Biomechanical Assessment & Scout Intelligence
          </Text>

          <Text style={styles.heroSubtitle}>
            Precision motion tracking, automated jump & sprint kinematics, and instant scout reports for elite athletic performance.
          </Text>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
            <Text style={styles.featureTitle}>Vision Pose HUD</Text>
            <Text style={styles.featureDesc}>Real-time joint angle accuracy & stability tracking.</Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="stats-chart-outline" size={24} color={colors.accent} />
            <Text style={styles.featureTitle}>Radar Analytics</Text>
            <Text style={styles.featureDesc}>Compare speed, power, and agility against elite benchmarks.</Text>
          </View>
        </View>

        {/* CTAs */}
        <View style={styles.ctaGroup}>
          <GradientButton
            title="Get Started"
            icon="arrow-forward-outline"
            onPress={() => navigation.navigate('RoleSelection')}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
            activeOpacity={0.7}
          >
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginHighlight}>Sign In</Text></Text>
          </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: spacing.lg,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.button,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary, // #0B1F3A
    letterSpacing: -0.5,
  },
  heroSection: {
    marginTop: spacing.xxl,
  },
  taglineChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: spacing.md,
  },
  taglineText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.md,
    lineHeight: 24,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.xxl,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: borderRadius.card, // 18px
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  featureTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  featureDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  ctaGroup: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  loginHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
});
