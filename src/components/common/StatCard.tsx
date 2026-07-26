import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = colors.primary,
}) => {
  const isDefaultPrimary = color === colors.primary || color === '#00F2FE';
  const displayColor = isDefaultPrimary ? colors.primary : color;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && (
          <View style={[styles.iconWrapper, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name={icon} size={18} color={displayColor} />
          </View>
        )}
      </View>

      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {trend && (
        <View style={styles.trendContainer}>
          <Ionicons name="trending-up-outline" size={14} color={colors.emerald} />
          <Text style={styles.trendText}>{trend}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 140,
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg, // 24px
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    marginVertical: spacing.xs,
    color: colors.primary, // #0B1F3A
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  trendText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '600',
  },
});
