import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { AssessmentCard } from '../../components/cards/AssessmentCard';
import assessmentsData from '../../data/assessments.json';
import { DrillAssessment } from '../../types';

export const AssessmentCenterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Upper Body',
    'Lower Body',
    'Core & Calisthenics',
    'Explosive Conditioning',
  ];

  const filteredDrills = assessmentsData.filter((drill) => {
    const matchesSearch =
      drill.title.toLowerCase().includes(search.toLowerCase()) ||
      drill.category.toLowerCase().includes(search.toLowerCase()) ||
      drill.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || drill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="AI Motion Lab Assessments" />

      <View style={styles.searchSection}>
        {/* Dual Mode Quick Action Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={styles.heroBadgeText}>MEDIAPIPE POSE 3D ENGINE</Text>
          </View>
          <Text style={styles.heroTitle}>Kinematic Movement Assessment</Text>
          <Text style={styles.heroDesc}>
            Evaluate Push-ups, Squats, Sit-ups, Jumping Jacks, Lunges & Curls with computer vision. Choose any drill below to begin live camera tracking or upload a recorded video file.
          </Text>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search Push-ups, Squats, Sit-ups, Curls..."
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
    backgroundColor: colors.background,
  },
  searchSection: {
    padding: spacing.lg,
    paddingBottom: spacing.xs,
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 100,
  },
});
