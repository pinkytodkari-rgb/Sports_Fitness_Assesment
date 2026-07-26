import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';

export const OtpVerificationScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { verifyOtp } = useAuth();
  const targetEmail = route.params?.email || 'user@athlete.ai';
  const [otp, setOtp] = useState<string[]>(['4', '8', '2', '9', '1', '7']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    setLoading(true);
    try {
      await verifyOtp(targetEmail, fullOtp);
      navigation.navigate('ResetPassword', { email: targetEmail });
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
          <Ionicons name="shield-checkmark-outline" size={28} color={colors.accent} />
        </View>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to <Text style={styles.emailHighlight}>{targetEmail}</Text>
        </Text>
      </View>

      {/* 6 OTP Boxes */}
      <View style={styles.otpRow}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => {
              inputs.current[idx] = ref;
            }}
            style={[styles.otpBox, otp[idx] ? styles.otpBoxFilled : null]}
            value={otp[idx]}
            onChangeText={(t) => handleChange(t, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <GradientButton
        title="Verify Security Code"
        onPress={handleVerify}
        loading={loading}
        style={{ marginTop: spacing.xl }}
      />

      {/* Resend Code Section */}
      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Didn't receive code?</Text>
        <TouchableOpacity
          onPress={() => setResendTimer(30)}
          disabled={resendTimer > 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.resendLink, resendTimer > 0 && styles.disabledResend]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>
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
  emailHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.lg,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.input, // 12px
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  otpBoxFilled: {
    borderColor: colors.accent,
    backgroundColor: '#EFF6FF',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xl,
  },
  resendText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  resendLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  disabledResend: {
    color: colors.textMuted,
    fontWeight: '500',
  },
});
