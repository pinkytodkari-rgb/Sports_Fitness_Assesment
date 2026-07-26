import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { useApp } from '../../context/AppContext';

export const AssessmentHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { assessmentHistory } = useApp();
  const [search, setSearch] = useState('');

  const filteredHistory = assessmentHistory.filter((item) =>
    item.assessmentTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Assessment History" showBack />

      <View style={styles.searchPadding}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Filter past trial history..."
        />
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('AssessmentResult', { result: item })}
            activeOpacity={0.8}
            style={styles.historyCard}
          >
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreNum}>{item.overallScore}</Text>
              <Text style={styles.scoreLbl}>SCORE</Text>
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.title}>{item.assessmentTitle}</Text>
              <Text style={styles.date}>{item.date} • {item.durationSeconds}s duration</Text>
              <Text style={styles.reps}>
                {item.correctReps} valid reps • {item.postureScore}% posture score
              </Text>
            </View>

            <Ionicons name="chevron-forward-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
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
  searchPadding: {
    padding: spacing.lg,
    paddingBottom: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.card, // 18px
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  scoreBadge: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: '#0B1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNum: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  scoreLbl: {
    color: '#DBEAFE',
    fontSize: 8,
    fontWeight: '700',
  },
  infoGroup: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.primary, // #0B1F3A
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  reps: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
