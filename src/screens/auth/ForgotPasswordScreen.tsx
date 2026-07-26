import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetRequest = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      setTimeout(() => {
        navigation.navigate('OtpVerification', { email });
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back-outline" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={28} color={colors.accent} />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address to receive a 6-digit OTP verification code.
        </Text>
      </View>

      {submitted ? (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={24} color={colors.emerald} />
          <Text style={styles.successText}>Verification code sent! Redirecting to OTP screen...</Text>
        </View>
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
              <Ionicons name="mail-outline" size={20} color={isFocused ? colors.accent : colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="name@athlete.ai"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
          </View>

          <GradientButton
            title="Send Reset Code"
            icon="paper-plane-outline"
            onPress={handleResetRequest}
            loading={loading}
            disabled={!email}
            style={{ marginTop: spacing.md }}
          />
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
        <Text style={styles.footerText}>
          Remembered password? <Text style={styles.footerHighlight}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  backBtn: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary, // #0B1F3A
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.input, // 12px
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#DCFCE7',
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
  },
  successText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  footerLink: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  footerHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
});
