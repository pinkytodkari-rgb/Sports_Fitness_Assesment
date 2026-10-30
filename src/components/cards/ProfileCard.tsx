import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface ProfileCardProps {
  user: User;
  onEditPress?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEditPress }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          </View>
          <Text style={styles.roleText}>{user.sport || 'Athlete'} • {user.position || 'Player'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        {onEditPress && (
          <TouchableOpacity onPress={onEditPress} style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.statVal}>{user.age || 19}</Text>
          <Text style={styles.statLbl}>AGE</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statCol}>
          <Text style={styles.statVal}>{user.height || "6'2\""}</Text>
          <Text style={styles.statLbl}>HEIGHT</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statCol}>
          <Text style={styles.statVal}>{user.weight || '185 lbs'}</Text>
          <Text style={styles.statLbl}>WEIGHT</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '800',
  },
  roleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  email: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    padding: spacing.xs,
    backgroundColor: 'rgba(255, 85, 0, 0.12)',
    borderRadius: borderRadius.sm,
  },
  bio: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  statLbl: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
  },
});
