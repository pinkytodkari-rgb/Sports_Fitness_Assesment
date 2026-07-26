import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { CoachCard } from '../../components/cards/CoachCard';
import { StatCard } from '../../components/common/StatCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { AthleteCard } from '../../components/cards/AthleteCard';
import { useApp } from '../../context/AppContext';

export const CoachDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { allAthletes, shortlistedIds, toggleShortlist, selectedCompareAthletes, toggleCompareAthlete } = useApp();

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Scout Intelligence Portal" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Verified Scout Profile Banner */}
        <CoachCard />

        {/* Scout Pipeline Metrics */}
        <View style={styles.statsGrid}>
          <StatCard title="Athletes Scouted" value="142" icon="eye-outline" color={colors.primary} />
          <StatCard title="Shortlisted Talent" value={shortlistedIds.length.toString()} icon="heart-outline" color={colors.rose} />
        </View>

        {/* Discovery Action Banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AthleteDiscovery')}
          style={styles.discoveryBanner}
          activeOpacity={0.85}
        >
          <Ionicons name="search" size={24} color={colors.accent} />
          <View style={styles.bannerTextGroup}>
            <Text style={styles.bannerTitle}>Scout & Filter Athlete Talent Pool</Text>
            <Text style={styles.bannerSub}>Search 500+ verified athletic prospects across 12 sports</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Top Athletic Prospects */}
        <SectionHeader
          title="Top Rated Prospects"
          subtitle="Highest AI Biomechanical Rating"
          actionText="View All"
          onActionPress={() => navigation.navigate('AthleteDiscovery')}
        />

        {allAthletes.slice(0, 3).map((athlete) => (
          <AthleteCard
            key={athlete.id}
            athlete={athlete}
            onPress={() => navigation.navigate('AthleteDetails', { athlete })}
            onShortlistPress={() => toggleShortlist(athlete.id)}
            onComparePress={() => toggleCompareAthlete(athlete)}
            isShortlisted={shortlistedIds.includes(athlete.id)}
            isCompared={selectedCompareAthletes.some((a) => a.id === athlete.id)}
          />
        ))}
      </ScrollView>
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
    paddingBottom: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  discoveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: spacing.lg,
    borderRadius: borderRadius.card, // 18px
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  bannerTextGroup: {
    flex: 1,
  },
  bannerTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 15,
    fontWeight: '700',
  },
  bannerSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
