import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { AthleteCard } from '../../components/cards/AthleteCard';
import { CustomModal } from '../../components/common/CustomModal';
import { useApp } from '../../context/AppContext';

export const AthleteDiscoveryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { allAthletes, shortlistedIds, toggleShortlist, selectedCompareAthletes, toggleCompareAthlete } = useApp();

  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'speed' | 'power'>('rating');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const sportsList = ['All', 'Basketball', 'Track & Field', 'Soccer', 'Football', 'Volleyball'];

  const filteredAthletes = allAthletes
    .filter((ath) => {
      const matchesSearch =
        ath.name.toLowerCase().includes(search.toLowerCase()) ||
        ath.sport.toLowerCase().includes(search.toLowerCase()) ||
        ath.position.toLowerCase().includes(search.toLowerCase());
      const matchesSport = selectedSport === 'All' || ath.sport === selectedSport;
      return matchesSearch && matchesSport;
    })
    .sort((a, b) => {
      if (sortBy === 'speed') return b.speed - a.speed;
      if (sortBy === 'power') return b.power - a.power;
      return b.overallScore - a.overallScore;
    });

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Athlete Talent Discovery" showBack />

      <View style={styles.searchSection}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, sport, position..."
          onFilterPress={() => setFilterModalVisible(true)}
        />

        {/* Sport Category Filter Chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={sportsList}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipList}
          renderItem={({ item }) => {
            const isSelected = item === selectedSport;
            return (
              <TouchableOpacity
                onPress={() => setSelectedSport(item)}
                style={[styles.sportChip, isSelected && styles.selectedSportChip]}
                activeOpacity={0.7}
              >
                <Text style={[styles.sportChipText, isSelected && styles.selectedSportChipText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Compare Bar floating alert if athletes selected */}
        {selectedCompareAthletes.length > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('CompareAthletes')}
            style={styles.compareFloatingBanner}
            activeOpacity={0.85}
          >
            <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
            <Text style={styles.compareBannerText}>
              Compare {selectedCompareAthletes.length} Selected Athletes
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Athlete Grid */}
      <FlatList
        data={filteredAthletes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AthleteCard
            athlete={item}
            onPress={() => navigation.navigate('AthleteDetails', { athlete: item })}
            onShortlistPress={() => toggleShortlist(item.id)}
            onComparePress={() => toggleCompareAthlete(item)}
            isShortlisted={shortlistedIds.includes(item.id)}
            isCompared={selectedCompareAthletes.some((a) => a.id === item.id)}
          />
        )}
      />

      {/* Filter Modal */}
      <CustomModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        title="Sort & Filter Prospects"
      >
        <Text style={styles.modalSub}>Sort Criteria</Text>
        <TouchableOpacity
          onPress={() => { setSortBy('rating'); setFilterModalVisible(false); }}
          style={[styles.modalOpt, sortBy === 'rating' && styles.modalOptActive]}
        >
          <Text style={[styles.modalOptText, sortBy === 'rating' && styles.modalOptTextActive]}>
            Highest AI Overall Rating
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setSortBy('speed'); setFilterModalVisible(false); }}
          style={[styles.modalOpt, sortBy === 'speed' && styles.modalOptActive]}
        >
          <Text style={[styles.modalOptText, sortBy === 'speed' && styles.modalOptTextActive]}>
            Peak Sprint Speed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setSortBy('power'); setFilterModalVisible(false); }}
          style={[styles.modalOpt, sortBy === 'power' && styles.modalOptActive]}
        >
          <Text style={[styles.modalOptText, sortBy === 'power' && styles.modalOptTextActive]}>
            Explosive Power Output
          </Text>
        </TouchableOpacity>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchSection: {
    padding: spacing.lg,
    paddingBottom: spacing.xs,
  },
  chipList: {
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sportChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSportChip: {
    backgroundColor: colors.primary, // #0B1F3A
    borderColor: colors.primary,
  },
  sportChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedSportChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  compareFloatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary, // #0B1F3A
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.button,
    marginTop: spacing.md,
    ...shadows.card,
  },
  compareBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 100,
  },
  modalSub: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  modalOpt: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.input,
    backgroundColor: '#F8FAFC',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOptActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.accent,
  },
  modalOptText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOptTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
});
