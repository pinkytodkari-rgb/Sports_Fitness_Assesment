import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import coachData from '../../data/coach.json';

export const CoachCard: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <View style={styles.row}>
        <Image source={{ uri: coachData.avatar }} style={styles.avatar} />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{coachData.name}</Text>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={12} color={colors.secondary} />
              <Text style={styles.badgeText}>VERIFIED SCOUT</Text>
            </View>
          </View>
          <Text style={styles.role}>{coachData.roleTitle}</Text>
          <Text style={styles.team}>{coachData.team}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{coachData.totalScouted}</Text>
          <Text style={styles.statLbl}>Athletes Evaluated</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{coachData.activeShortlistCount}</Text>
          <Text style={styles.statLbl}>In Shortlist Pipeline</Text>
        </View>
      </View>
    </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    color: colors.primary, // #0B1F3A
    fontSize: 17,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  badgeText: {
    color: colors.secondary,
    fontSize: 9,
    fontWeight: '700',
  },
  role: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  team: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stat: {
    alignItems: 'center',
  },
  statVal: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  statLbl: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
});
