import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { RadarChart } from '../../components/common/RadarChart';
import { GradientButton } from '../../components/common/GradientButton';
import { Toast } from '../../components/common/Toast';
import { Athlete } from '../../types';
import { useApp } from '../../context/AppContext';

export const AthleteDetailsScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { shortlistedIds, toggleShortlist, toggleCompareAthlete, selectedCompareAthletes } = useApp();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const athlete: Athlete = route.params?.athlete || {
    id: 'ath-1',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    sport: 'Basketball',
    position: 'Point Guard',
    age: 19,
    height: "6'2\"",
    weight: '185 lbs',
    overallScore: 96,
    speed: 98,
    power: 92,
    agility: 99,
    endurance: 91,
    technique: 95,
    videoUrl: '',
    location: 'Los Angeles, CA',
    status: 'Shortlisted',
    verified: true,
    notes: 'Explosive first step, top 1% lateral speed in Western region.',
  };

  const isShortlisted = shortlistedIds.includes(athlete.id);
  const isCompared = selectedCompareAthletes.some((a) => a.id === athlete.id);

  const radarData = [
    { label: 'SPEED', value: athlete.speed },
    { label: 'POWER', value: athlete.power },
    { label: 'AGILITY', value: athlete.agility },
    { label: 'ENDURANCE', value: athlete.endurance },
    { label: 'TECHNIQUE', value: athlete.technique },
  ];

  const handleContactScout = () => {
    setToastMessage(`Recruitment message sent to ${athlete.name}'s manager!`);
    setToastVisible(true);
  };

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Prospect Scout Report" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRow}>
            <Image source={{ uri: athlete.avatar }} style={styles.avatar} />

            <View style={styles.heroText}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{athlete.name}</Text>
                {athlete.verified && <Ionicons name="checkmark-circle" size={18} color={colors.accent} />}
              </View>
              <Text style={styles.sportPos}>{athlete.sport} • {athlete.position}</Text>
              <Text style={styles.location}>
                <Ionicons name="location-outline" size={12} color={colors.textSecondary} /> {athlete.location}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <Text style={styles.ratingNum}>{athlete.overallScore}</Text>
              <Text style={styles.ratingLbl}>AI SCORE</Text>
            </View>
          </View>

          {/* Quick Actions Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => toggleShortlist(athlete.id)}
              style={[styles.actionChip, isShortlisted && styles.activeShortlistChip]}
            >
              <Ionicons
                name={isShortlisted ? 'heart' : 'heart-outline'}
                size={16}
                color={isShortlisted ? colors.rose : colors.textSecondary}
              />
              <Text style={[styles.actionChipText, isShortlisted && { color: colors.rose }]}>
                {isShortlisted ? 'Shortlisted' : 'Add Shortlist'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                toggleCompareAthlete(athlete);
                navigation.navigate('CompareAthletes');
              }}
              style={[styles.actionChip, isCompared && styles.activeCompareChip]}
            >
              <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
              <Text style={styles.actionChipText}>Compare Prospect</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Biomechanical Radar Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Biomechanical Metric Radar</Text>
          <RadarChart data={radarData} size={250} primaryColor={colors.primary} />
        </View>

        {/* Scout Notes */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Lead Scout Notes</Text>
          <Text style={styles.notesText}>{athlete.notes || 'Verified top 1% lateral speed & vertical takeoff velocity.'}</Text>
        </View>

        <GradientButton
          title={`Send Recruitment Trial Invite`}
          icon="send-outline"
          onPress={handleContactScout}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>

      <Toast visible={toastVisible} message={toastMessage} onHide={() => setToastVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  heroCard: {
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    backgroundColor: '#0B1F3A',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  heroText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  sportPos: {
    color: '#93C5FD',
    fontSize: 13,
    marginTop: 2,
  },
  location: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  ratingNum: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  ratingLbl: {
    color: '#DBEAFE',
    fontSize: 8,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.button,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeShortlistChip: {
    backgroundColor: '#FEE2E2',
  },
  activeCompareChip: {
    backgroundColor: '#DBEAFE',
  },
  actionChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  notesText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
