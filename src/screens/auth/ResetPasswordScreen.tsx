import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';

export const ResetPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [passFocused, setPassFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const handleSave = async () => {
    if (!newPassword || newPassword !== confirmPassword) return;
    setLoading(true);
    try {
      await resetPassword(newPassword);
      navigation.replace('Login');
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
          <Ionicons name="lock-closed-outline" size={28} color={colors.accent} />
        </View>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Your identity is verified. Create a secure password for your AthleteAI account.
        </Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>New Password</Text>
        <View style={[styles.inputWrapper, passFocused && styles.inputFocused]}>
          <Ionicons name="lock-closed-outline" size={20} color={passFocused ? colors.accent : colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Enter new password"
            placeholderTextColor={colors.textMuted}
            onFocus={() => setPassFocused(true)}
            onBlur={() => setPassFocused(false)}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={[styles.inputWrapper, confirmFocused && styles.inputFocused]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={confirmFocused ? colors.accent : colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Re-enter new password"
            placeholderTextColor={colors.textMuted}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
          />
        </View>
      </View>

      <GradientButton
        title="Save & Update Password"
        onPress={handleSave}
        loading={loading}
        disabled={!newPassword || newPassword !== confirmPassword}
        style={{ marginTop: spacing.lg }}
      />
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
});
