import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Athlete } from '../../types';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface AthleteCardProps {
  athlete: Athlete;
  onPress: () => void;
  onShortlistPress?: () => void;
  onComparePress?: () => void;
  isShortlisted?: boolean;
  isCompared?: boolean;
}

export const AthleteCard: React.FC<AthleteCardProps> = ({
  athlete,
  onPress,
  onShortlistPress,
  onComparePress,
  isShortlisted = false,
  isCompared = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: athlete.avatar }} style={styles.avatar} />

        <View style={styles.infoGroup}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{athlete.name}</Text>
            {athlete.verified && (
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
            )}
          </View>
          <Text style={styles.sportPos}>
            {athlete.sport} • {athlete.position}
          </Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} /> {athlete.location}
          </Text>
        </View>

        {/* AI Overall Score Badge */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreNumber}>{athlete.overallScore}</Text>
          <Text style={styles.scoreLabel}>AI RATING</Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>SPEED</Text>
          <Text style={styles.metricVal}>{athlete.speed}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>POWER</Text>
          <Text style={styles.metricVal}>{athlete.power}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>AGILITY</Text>
          <Text style={styles.metricVal}>{athlete.agility}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>TECHNIQUE</Text>
          <Text style={styles.metricVal}>{athlete.technique}</Text>
        </View>
      </View>

      {/* Action Toolbar for Coaches */}
      <View style={styles.footer}>
        {onShortlistPress && (
          <TouchableOpacity
            onPress={onShortlistPress}
            style={[
              styles.actionBtn,
              isShortlisted && { backgroundColor: '#FEE2E2', borderColor: colors.rose },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isShortlisted ? 'heart' : 'heart-outline'}
              size={16}
              color={isShortlisted ? colors.rose : colors.textSecondary}
            />
            <Text
              style={[
                styles.actionBtnText,
                isShortlisted && { color: colors.rose },
              ]}
            >
              {isShortlisted ? 'Shortlisted' : 'Shortlist'}
            </Text>
          </TouchableOpacity>
        )}

        {onComparePress && (
          <TouchableOpacity
            onPress={onComparePress}
            style={[
              styles.actionBtn,
              isCompared && { backgroundColor: '#FFF7ED', borderColor: colors.primary },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color={isCompared ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.actionBtnText,
                isCompared && { color: colors.primary },
              ]}
            >
              {isCompared ? 'Comparing' : 'Compare'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onPress} style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>View Analytics</Text>
          <Ionicons name="chevron-forward-outline" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  infoGroup: {
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
    fontSize: 17,
    fontWeight: '800',
  },
  sportPos: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  location: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  scoreBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    ...shadows.glow,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: '#FFFFFF',
  },
  actionBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  viewBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});
