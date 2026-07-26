import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { GradientButton } from '../../components/common/GradientButton';
import { SocialAuthButtons } from '../../components/auth/SocialAuthButtons';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, rememberMe, setRememberMe } = useAuth();
  const [email, setEmail] = useState('marcus.vance@athlete.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('athlete');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const role = await login(email, password, rememberMe, selectedRole);
      if (role === 'coach') {
        navigation.replace('CoachDashboard');
      } else if (role === 'admin') {
        navigation.replace('AdminDashboard');
      } else {
        navigation.replace('MainTabs');
      }
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to access your AthleteAI dashboard</Text>
      </View>

      {/* Role Selector Chips */}
      <View style={styles.rolePickerRow}>
        <TouchableOpacity
          onPress={() => setSelectedRole('athlete')}
          style={[styles.roleChip, selectedRole === 'athlete' && styles.activeChip]}
        >
          <Ionicons
            name="person-outline"
            size={16}
            color={selectedRole === 'athlete' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.roleChipText, selectedRole === 'athlete' && styles.activeChipText]}>
            Athlete
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedRole('coach')}
          style={[styles.roleChip, selectedRole === 'coach' && styles.activeChip]}
        >
          <Ionicons
            name="eye-outline"
            size={16}
            color={selectedRole === 'coach' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.roleChipText, selectedRole === 'coach' && styles.activeChipText]}>
            Scout / Coach
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedRole('admin')}
          style={[styles.roleChip, selectedRole === 'admin' && styles.activeChip]}
        >
          <Ionicons
            name="shield-outline"
            size={16}
            color={selectedRole === 'admin' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.roleChipText, selectedRole === 'admin' && styles.activeChipText]}>
            Admin
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
          <Ionicons name="mail-outline" size={20} color={emailFocused ? colors.accent : colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="name@athlete.ai"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={[styles.inputWrapper, passFocused && styles.inputFocused]}>
          <Ionicons name="lock-closed-outline" size={20} color={passFocused ? colors.accent : colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            onFocus={() => setPassFocused(true)}
            onBlur={() => setPassFocused(false)}
          />
        </View>
      </View>

      {/* Remember Me & Forgot Password Row */}
      <View style={styles.rowBetween}>
        <TouchableOpacity
          onPress={() => setRememberMe(!rememberMe)}
          style={styles.rememberRow}
          activeOpacity={0.8}
        >
          <Ionicons
            name={rememberMe ? 'checkbox' : 'square-outline'}
            size={20}
            color={rememberMe ? colors.accent : colors.textMuted}
          />
          <Text style={styles.rememberText}>Remember Me</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} activeOpacity={0.7}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Primary CTA */}
      <GradientButton
        title={`Sign In as ${selectedRole.toUpperCase()}`}
        onPress={handleLogin}
        loading={loading}
        style={{ marginTop: spacing.lg }}
      />

      {/* Social Logins */}
      <SocialAuthButtons
        onGooglePress={handleLogin}
        onApplePress={handleLogin}
      />

      {/* Footer Link */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={styles.footerLink}
        activeOpacity={0.7}
      >
        <Text style={styles.footerText}>
          Don't have an account? <Text style={styles.footerHighlight}>Sign Up</Text>
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
    paddingBottom: spacing.xxxl,
  },
  backBtn: {
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary, // #0B1F3A
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: borderRadius.button, // 14px
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeChip: {
    backgroundColor: colors.primary, // #0B1F3A
    borderColor: colors.primary,
  },
  roleChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    borderColor: colors.accent, // #2563EB Focus border blue
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  forgotText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  footerLink: {
    marginTop: spacing.md,
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
