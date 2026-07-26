import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('athlete');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const handleRegister = async () => {
    if (!acceptedTerms) return;
    setLoading(true);
    try {
      const role = await register(fullName, email, password, selectedRole);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join AthleteAI to track and showcase your athletic potential</Text>
      </View>

      {/* Role Selection */}
      <Text style={styles.label}>Select Roster Persona</Text>
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
            Coach
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
        <Text style={styles.label}>Full Name</Text>
        <View style={[styles.inputWrapper, nameFocused && styles.inputFocused]}>
          <Ionicons name="person-outline" size={20} color={nameFocused ? colors.accent : colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Marcus Vance"
            placeholderTextColor={colors.textMuted}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
          <Ionicons name="mail-outline" size={20} color={emailFocused ? colors.accent : colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="marcus@athlete.ai"
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
            placeholder="Create password"
            placeholderTextColor={colors.textMuted}
            onFocus={() => setPassFocused(true)}
            onBlur={() => setPassFocused(false)}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={[styles.inputWrapper, confirmFocused && styles.inputFocused]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={confirmFocused ? colors.accent : colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Re-enter password"
            placeholderTextColor={colors.textMuted}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
          />
        </View>
      </View>

      {/* Accept Terms Checkbox */}
      <TouchableOpacity
        onPress={() => setAcceptedTerms(!acceptedTerms)}
        style={styles.termsRow}
        activeOpacity={0.8}
      >
        <Ionicons
          name={acceptedTerms ? 'checkbox' : 'square-outline'}
          size={20}
          color={acceptedTerms ? colors.accent : colors.textMuted}
        />
        <Text style={styles.termsText}>
          I accept the <Text style={styles.termsLink}>Terms of Service</Text> & <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>

      <GradientButton
        title="Create Account"
        onPress={handleRegister}
        loading={loading}
        disabled={!acceptedTerms}
        style={{ marginTop: spacing.md }}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
        <Text style={styles.footerText}>
          Already have an account? <Text style={styles.footerHighlight}>Login</Text>
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
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.button,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeChip: {
    backgroundColor: colors.primary,
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
    marginBottom: spacing.md,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: spacing.md,
  },
  termsText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  termsLink: {
    color: colors.accent,
    fontWeight: '600',
  },
  footerLink: {
    marginTop: spacing.xl,
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
