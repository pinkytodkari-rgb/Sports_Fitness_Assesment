import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { AthleteCard } from '../../components/cards/AthleteCard';
import { useApp } from '../../context/AppContext';

export const ShortlistScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { allAthletes, shortlistedIds, toggleShortlist, selectedCompareAthletes, toggleCompareAthlete } = useApp();

  const shortlistedAthletes = allAthletes.filter((a) => shortlistedIds.includes(a.id));

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Recruitment Shortlist Pipeline" showBack />

      <View style={styles.headerPadding}>
        <Text style={styles.subText}>
          {shortlistedAthletes.length} Saved Athletic Prospects in Active Recruitment Pipeline
        </Text>
      </View>

      {shortlistedAthletes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Athletes Shortlisted Yet</Text>
          <Text style={styles.emptySub}>Discover top athletes and click "Shortlist" to save them to your recruitment roster.</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AthleteDiscovery')}
            style={styles.discoverBtn}
          >
            <Text style={styles.discoverBtnText}>Explore Athlete Discovery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shortlistedAthletes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AthleteCard
              athlete={item}
              onPress={() => navigation.navigate('AthleteDetails', { athlete: item })}
              onShortlistPress={() => toggleShortlist(item.id)}
              onComparePress={() => toggleCompareAthlete(item)}
              isShortlisted={true}
              isCompared={selectedCompareAthletes.some((a) => a.id === item.id)}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerPadding: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  subText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    color: colors.primary, // #0B1F3A
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  discoverBtn: {
    backgroundColor: colors.primary, // #0B1F3A
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.button,
    marginTop: spacing.xl,
  },
  discoverBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
