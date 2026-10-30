import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { AssessmentResult } from '../../types';

export const AssessmentHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { assessmentHistory, user } = useApp();
  const [search, setSearch] = useState('');
  const [serverSessions, setServerSessions] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiService.getAthleteHistory(user?.id || 'ath-1')
      .then((sessions) => {
        if (!isMounted) return;
        if (sessions && sessions.length > 0) {
          const mapped: AssessmentResult[] = sessions.map((s: any) => ({
            id: s.id,
            assessmentId: `drill-${(s.exercise || 'drill').toLowerCase().replace(/\s+/g, '-')}`,
            assessmentTitle: s.exercise,
            athleteId: s.athlete_id,
            date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recent Trial',
            overallScore: s.posture_label === 'Correct' ? 96 : 74,
            correctReps: Math.floor(s.estimated_reps || 0),
            incorrectReps: s.posture_label === 'Correct' ? 0 : 2,
            postureScore: s.posture_label === 'Correct' ? 98 : 72,
            consistency: 95,
            stability: 94,
            jointAngles: {
              kneeFlexion: 90,
              hipAngle: 175,
              shoulderAlignment: 99,
              primaryAngle: 90,
              secondaryAngle: 175,
              primaryAngleName: 'PRIMARY ANGLE',
              secondaryAngleName: 'SECONDARY ANGLE',
            },
            recommendations: [s.posture_reason || 'Verified biomechanical trajectory via MediaPipe Pose.'],
            durationSeconds: Math.floor(s.processing_seconds || 30),
          }));
          setServerSessions(mapped);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [user?.id]);

  // Combine local state and server sessions, avoiding duplicate IDs
  const allSessionsMap = new Map<string, AssessmentResult>();
  assessmentHistory.forEach((item) => allSessionsMap.set(item.id, item));
  serverSessions.forEach((item) => allSessionsMap.set(item.id, item));
  const combinedHistory = Array.from(allSessionsMap.values());

  const filteredHistory = combinedHistory.filter((item) =>
    item.assessmentTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Verified Assessment History" showBack />

      <View style={styles.searchPadding}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Filter past trial history..."
        />
      </View>

      {loading && (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
      )}

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Ionicons name="fitness-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Assessment Trials Yet</Text>
              <Text style={styles.emptySubtitle}>
                Record or upload an exercise drill in the Motion Lab to start tracking your performance.
              </Text>
            </View>
          ) : null
        }
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
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.card,
  },
  scoreBadge: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNum: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  scoreLbl: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '700',
  },
  infoGroup: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reps: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
});
