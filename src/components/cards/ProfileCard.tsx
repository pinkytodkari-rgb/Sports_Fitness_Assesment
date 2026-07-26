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
            <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
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
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg, // 20-24px
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    borderColor: colors.accent,
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
    color: colors.primary, // #0B1F3A
    fontSize: 19,
    fontWeight: '700',
  },
  roleText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  email: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    padding: spacing.xs,
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    color: colors.primary, // #0B1F3A
    fontSize: 16,
    fontWeight: '700',
  },
  statLbl: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
});
