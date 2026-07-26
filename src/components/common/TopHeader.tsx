import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface TopHeaderProps {
  navigation?: any;
  showBack?: boolean;
  title?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ navigation, showBack = false, title }) => {
  const { user, userRole, setUserRole, notifications } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const cycleRole = () => {
    const roles: UserRole[] = ['athlete', 'coach', 'admin'];
    const nextIdx = (roles.indexOf(userRole) + 1) % roles.length;
    setUserRole(roles[nextIdx]);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'athlete':
        return 'ATHLETE';
      case 'coach':
        return 'SCOUT/COACH';
      case 'admin':
        return 'ADMIN';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'athlete':
        return colors.accent;
      case 'coach':
        return colors.secondary;
      case 'admin':
        return colors.amber;
    }
  };

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.brandWrapper}>
          <Text style={styles.brandTitle}>Athlete<Text style={{ color: colors.accent }}>AI</Text></Text>
        </View>
      )}

      {title ? <Text style={styles.headerTitle}>{title}</Text> : null}

      <View style={styles.rightGroup}>
        {/* Quick Role Toggle Chip */}
        <TouchableOpacity
          onPress={cycleRole}
          style={[styles.roleBadge, { borderColor: `${getRoleColor(userRole)}30` }]}
          activeOpacity={0.8}
        >
          <View style={[styles.roleDot, { backgroundColor: getRoleColor(userRole) }]} />
          <Text style={[styles.roleText, { color: getRoleColor(userRole) }]}>
            {getRoleLabel(userRole)}
          </Text>
        </TouchableOpacity>

        {/* Notifications Icon */}
        <TouchableOpacity
          onPress={() => navigation?.navigate('Notifications')}
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          onPress={() => navigation?.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary, // #0B1F3A
    letterSpacing: -0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    gap: 5,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconBtn: {
    position: 'relative',
    padding: spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.rose,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
});
