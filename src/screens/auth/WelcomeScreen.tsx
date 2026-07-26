import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { guestLogin } = useAuth();

  const handleGuest = () => {
    guestLogin();
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Brand Banner */}
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>Athlete<Text style={{ color: colors.accent }}>AI</Text></Text>
        </View>

        {/* Hero Athlete Showcase Image Card */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800&auto=format&fit=crop&q=80' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.taglineChip}>
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              <Text style={styles.taglineText}>ENTERPRISE ATHLETE PLATFORM</Text>
            </View>
            <Text style={styles.overlayTitle}>Peak Athletic Intelligence</Text>
            <Text style={styles.overlaySub}>Biomechanical Pose Tracking & Scout Pipeline</Text>
          </View>
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Unlock Your Athletic Performance</Text>
          <Text style={styles.subtitle}>
            Join thousands of collegiate prospects and scouts measuring speed, vertical velocity, and postural accuracy.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGroup}>
          <GradientButton
            title="Log In to Account"
            icon="log-in-outline"
            onPress={() => navigation.navigate('Login')}
          />

          <GradientButton
            title="Create New Account"
            variant="outline"
            icon="person-add-outline"
            onPress={() => navigation.navigate('Register')}
          />

          <TouchableOpacity onPress={handleGuest} style={styles.guestBtn} activeOpacity={0.7}>
            <Text style={styles.guestText}>Continue as Guest →</Text>
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
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.lg,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary, // #0B1F3A
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  heroCard: {
    borderRadius: borderRadius.card, // 18px
    overflow: 'hidden',
    height: 240,
    position: 'relative',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(11, 31, 58, 0.75)',
  },
  taglineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    marginBottom: 6,
  },
  taglineText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  overlaySub: {
    color: '#DBEAFE',
    fontSize: 12,
    marginTop: 2,
  },
  textSection: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  actionGroup: {
    gap: spacing.md,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  guestText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
