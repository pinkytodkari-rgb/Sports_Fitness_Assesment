import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { AssessmentCard } from '../../components/cards/AssessmentCard';
import assessmentsData from '../../data/assessments.json';
import { DrillAssessment } from '../../types';

export const AssessmentCenterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Explosive Power', 'Lateral Quickness', 'Biomechanical Form', 'Pure Speed'];

  const filteredDrills = assessmentsData.filter((drill) => {
    const matchesSearch =
      drill.title.toLowerCase().includes(search.toLowerCase()) ||
      drill.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || drill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Assessment Center" />

      <View style={styles.searchSection}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search drill assessments..."
        />

        {/* Category Pill Filter */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = item === selectedCategory;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[styles.categoryChip, isSelected && styles.selectedChip]}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredDrills as DrillAssessment[]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AssessmentCard
            drill={item}
            onPress={() => navigation.navigate('LiveAssessment', { drill: item })}
          />
        )}
      />
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
  categoryList: {
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedChip: {
    backgroundColor: colors.primary, // #0B1F3A
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 100,
  },
});
