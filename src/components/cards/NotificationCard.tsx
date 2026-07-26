import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from '../../types';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface NotificationCardProps {
  notification: NotificationItem;
  onPress: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onPress }) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'assessment':
        return { name: 'analytics-outline', color: colors.accent };
      case 'scout':
        return { name: 'eye-outline', color: colors.secondary };
      case 'achievement':
        return { name: 'trophy-outline', color: colors.amber };
      case 'system':
        return { name: 'shield-checkmark-outline', color: colors.emerald };
    }
  };

  const iconInfo = getIcon(notification.type);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, !notification.read && styles.unreadCard]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
        <Ionicons name={iconInfo.name as any} size={22} color={iconInfo.color} />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.time}>{notification.time}</Text>
        </View>
        <Text style={styles.message}>{notification.message}</Text>
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  unreadCard: {
    borderColor: colors.accent,
    backgroundColor: '#F8FAFC',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.primary, // #0B1F3A
    fontSize: 15,
    fontWeight: '700',
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: spacing.sm,
  },
});
