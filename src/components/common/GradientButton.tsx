import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradient?: string[];
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
}) => {
  if (variant === 'outline' || variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.outlineContainer, disabled && styles.disabled, style]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color={colors.primary} style={styles.icon} />}
            <Text style={[styles.outlineText, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.dangerContainer, disabled && styles.disabled, style]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color="#FFFFFF" style={styles.icon} />}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Primary Button: Dark Navy #0B1F3A, Height 52px, Radius 14px, White Text
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.primaryContainer, disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color="#FFFFFF" style={styles.icon} />}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryContainer: {
    height: 52,
    backgroundColor: colors.primary, // #0B1F3A
    borderRadius: borderRadius.button, // 14px
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  outlineContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.button, // 14px
    borderWidth: 1.5,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  dangerContainer: {
    height: 52,
    backgroundColor: colors.rose,
    borderRadius: borderRadius.button, // 14px
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});
