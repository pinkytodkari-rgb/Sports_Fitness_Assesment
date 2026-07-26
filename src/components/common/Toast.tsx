import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  visible: boolean;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  visible,
  onHide,
}) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const iconName =
    type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle';
  const iconColor =
    type === 'success' ? colors.emerald : type === 'error' ? colors.rose : colors.accent;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Ionicons name={iconName} size={20} color={iconColor} style={styles.icon} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.floating,
    zIndex: 999,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
