import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DrillAssessment } from '../../types';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface AssessmentCardProps {
  drill: DrillAssessment;
  onPress: () => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ drill, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.container}>
      <LinearGradient
        colors={['#FF5500', '#FF7A00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <View style={styles.badgeRow}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{drill.category}</Text>
          </View>

          <View style={styles.diffChip}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.diffText}>{drill.difficulty}</Text>
          </View>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name={drill.iconName as any} size={28} color="#FFFFFF" />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>{drill.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {drill.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{drill.duration}</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="trophy-outline" size={14} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.primary }]}>{drill.targetMetric}</Text>
          </View>

          <View style={styles.startBtn}>
            <Text style={styles.startBtnText}>Start Test</Text>
            <Ionicons name="play-circle" size={16} color={colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  bannerGradient: {
    height: 90,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  diffChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  diffText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  iconCircle: {
    alignSelf: 'flex-start',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  startBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});
