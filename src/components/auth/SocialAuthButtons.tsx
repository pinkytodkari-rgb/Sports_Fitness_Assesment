import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';

interface SocialAuthButtonsProps {
  onGooglePress?: () => void;
  onApplePress?: () => void;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGooglePress,
  onApplePress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.buttonsRow}>
        {/* Google Sign In */}
        <TouchableOpacity
          onPress={onGooglePress}
          style={styles.socialBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-google" size={18} color="#EA4335" />
          <Text style={styles.socialBtnText}>Google</Text>
        </TouchableOpacity>

        {/* Apple Sign In */}
        <TouchableOpacity
          onPress={onApplePress}
          style={styles.socialBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-apple" size={20} color={colors.primary} />
          <Text style={styles.socialBtnText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    letterSpacing: 0.5,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialBtn: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.button, // 14px
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  socialBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
