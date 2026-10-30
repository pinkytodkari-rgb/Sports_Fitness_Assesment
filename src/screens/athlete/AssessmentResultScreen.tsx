import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { StatCard } from '../../components/common/StatCard';
import { ProgressRing } from '../../components/common/ProgressRing';
import { RadarChart } from '../../components/common/RadarChart';
import { GradientButton } from '../../components/common/GradientButton';
import { AssessmentResult } from '../../types';
import { apiService } from '../../services/apiService';

export const AssessmentResultScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const result: AssessmentResult = route.params?.result || {
    id: 'res-default',
    assessmentId: 'drill-pushups',
    assessmentTitle: 'Push-ups Form & Repetition Lab',
    athleteId: 'ath-1',
    date: 'Just Now',
    overallScore: 96,
    correctReps: 24,
    incorrectReps: 1,
    postureScore: 97,
    consistency: 95,
    stability: 96,
    jointAngles: {
      primaryAngle: 86,
      secondaryAngle: 178,
      primaryAngleName: 'ELBOW FLEXION',
      secondaryAngleName: 'SPINE ALIGN',
      kneeFlexion: 86,
      hipAngle: 178,
      shoulderAlignment: 99,
    },
    recommendations: [
      'Optimal 90° elbow depth achieved on 96% of repetitions.',
      'Neutral spine alignment maintained with zero lumbar sagging.',
      'Symmetric triceps force distribution across both arms.',
    ],
    durationSeconds: 60,
  };

  const primaryAngleName = result.jointAngles.primaryAngleName || 'KNEE FLEXION';
  const primaryAngleVal = result.jointAngles.primaryAngle || result.jointAngles.kneeFlexion || 90;
  const secondaryAngleName = result.jointAngles.secondaryAngleName || 'HIP ANGLE';
  const secondaryAngleVal = result.jointAngles.secondaryAngle || result.jointAngles.hipAngle || 88;

  const radarSkillPoints = [
    { label: 'POWER', value: result.overallScore },
    { label: 'POSTURE', value: result.postureScore },
    { label: 'STABILITY', value: result.stability },
    { label: 'CONSISTENCY', value: result.consistency },
    { label: 'TECHNIQUE', value: Math.min(100, Math.floor((result.postureScore + result.stability) / 2)) },
  ];

  const [nutrition, setNutrition] = useState<any>(null);
  const [loadingNutrition, setLoadingNutrition] = useState(true);

  useEffect(() => {
    async function loadFuelPlan() {
      try {
        setLoadingNutrition(true);
        const data = await apiService.getNutritionRecommendations(result.assessmentTitle, 'Hypertrophy');
        setNutrition(data);
      } catch (err) {
        console.warn('Could not load fuel plan:', err);
      } finally {
        setLoadingNutrition(false);
      }
    }
    loadFuelPlan();
  }, [result.assessmentTitle]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Banner */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trial Analysis Report</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Reports')} style={styles.shareBtn}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Score Hero Card */}
      <View style={styles.scoreHero}>
        <View style={styles.topAccent} />
        <Text style={styles.drillName}>{result.assessmentTitle}</Text>
        <Text style={styles.dateText}>Performed: {result.date} • Verified via Sandow Vision</Text>

        <View style={styles.ringCenter}>
          <ProgressRing
            progress={result.overallScore}
            size={130}
            strokeWidth={12}
            color={colors.primary}
            label="SCORE"
          />
        </View>

        <View style={styles.repSummaryRow}>
          <View style={styles.repItem}>
            <Text style={[styles.repVal, { color: colors.emerald }]}>{result.correctReps}</Text>
            <Text style={styles.repLbl}>VALID REPS</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.repItem}>
            <Text style={[styles.repVal, { color: colors.rose }]}>{result.incorrectReps}</Text>
            <Text style={styles.repLbl}>INCORRECT</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.repItem}>
            <Text style={[styles.repVal, { color: colors.primary }]}>{result.durationSeconds}s</Text>
            <Text style={styles.repLbl}>DURATION</Text>
          </View>
        </View>
      </View>

      {/* Joint Angle Telemetry Card */}
      <View style={styles.statsGrid}>
        <StatCard
          title={primaryAngleName}
          value={`${primaryAngleVal}°`}
          icon="body-outline"
          subtitle="Target standard verified"
          color={colors.primary}
        />
        <StatCard
          title={secondaryAngleName}
          value={`${secondaryAngleVal}°`}
          icon="shield-checkmark-outline"
          subtitle="Kinematic posture lock"
          color={colors.emerald}
        />
      </View>

      {/* Secondary Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard title="Posture Rating" value={`${result.postureScore}%`} icon="pulse-outline" color={colors.emerald} />
        <StatCard title="Kinetic Stability" value={`${result.stability}%`} icon="speedometer-outline" color={colors.secondary} />
      </View>

      {/* Radar Breakdown */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Biomechanical Skill Radar</Text>
        <RadarChart data={radarSkillPoints} size={250} primaryColor={colors.primary} />
      </View>

      {/* AI Scout Recommendations */}
      <View style={styles.sectionCard}>
        <View style={styles.recHeader}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>AI Scout Recommendations</Text>
        </View>

        {result.recommendations.map((rec, index) => (
          <View key={index} style={styles.recBullet}>
            <Ionicons name="checkmark-circle" size={18} color={colors.emerald} />
            <Text style={styles.recText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* OpenGym-Style AI Coach Debrief */}
      <View style={styles.sectionCard}>
        <View style={styles.recHeader}>
          <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>AI Coach Debrief</Text>
          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>
              {Math.max(1, Math.min(10, Math.round(result.overallScore / 10)))} / 10
            </Text>
          </View>
        </View>

        <Text style={styles.debriefSub}>
          Biomechanical session rating based on openGym kinematic standards.
        </Text>

        <View style={styles.debriefBox}>
          <View style={styles.debriefRow}>
            <Ionicons name="flash-outline" size={16} color={colors.primary} />
            <Text style={styles.debriefLabel}>HIGHLIGHT:</Text>
            <Text style={styles.debriefVal}>
              Logged {result.correctReps} valid reps with consistent range of motion.
            </Text>
          </View>

          <View style={styles.debriefRow}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.rose} />
            <Text style={styles.debriefLabel}>WATCH POINT:</Text>
            <Text style={styles.debriefVal}>
              Keep core engaged during peak eccentric phase to avoid form drift.
            </Text>
          </View>

          <View style={styles.debriefRow}>
            <Ionicons name="trending-up-outline" size={16} color={colors.emerald} />
            <Text style={styles.debriefLabel}>NEXT TIME:</Text>
            <Text style={styles.debriefVal}>
              Introduce 2-second negative tempo to build stabilizer strength.
            </Text>
          </View>
        </View>
      </View>

      {/* AI Sports Nutrition & Post-Workout Meal Plan */}
      <View style={styles.sectionCard}>
        <View style={styles.recHeader}>
          <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>AI Fuel & Recovery Nutrition</Text>
        </View>

        {loadingNutrition ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
        ) : nutrition ? (
          <View>
            <Text style={styles.nutritionWorkout}>{nutrition.workout_type}</Text>
            <Text style={styles.nutritionFocus}>{nutrition.focus}</Text>

            {/* Macro Pill Targets */}
            <View style={styles.macroRow}>
              <View style={styles.macroPill}>
                <Text style={styles.macroVal}>{nutrition.macros?.calories || 540} kcal</Text>
                <Text style={styles.macroLbl}>CALORIES</Text>
              </View>
              <View style={styles.macroPill}>
                <Text style={[styles.macroVal, { color: colors.primary }]}>{nutrition.macros?.protein_g || 44}g</Text>
                <Text style={styles.macroLbl}>PROTEIN</Text>
              </View>
              <View style={styles.macroPill}>
                <Text style={[styles.macroVal, { color: colors.secondary }]}>{nutrition.macros?.carbs_g || 62}g</Text>
                <Text style={styles.macroLbl}>CARBS</Text>
              </View>
              <View style={styles.macroPill}>
                <Text style={[styles.macroVal, { color: colors.emerald }]}>{nutrition.macros?.fats_g || 12}g</Text>
                <Text style={styles.macroLbl}>FATS</Text>
              </View>
            </View>

            {/* Recommended Meals */}
            <Text style={styles.mealSectionHeading}>Targeted Recovery Meals:</Text>
            {nutrition.recommended_meals?.map((meal: any, idx: number) => (
              <View key={meal.id || idx} style={styles.mealCard}>
                <View style={styles.mealTop}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <View style={styles.mealTimingBadge}>
                    <Text style={styles.mealTimingText}>{meal.timing}</Text>
                  </View>
                </View>

                <Text style={styles.mealDesc}>{meal.description}</Text>

                <View style={styles.mealMacros}>
                  <Text style={styles.mealMacroChip}>⚡ {meal.calories} kcal</Text>
                  <Text style={styles.mealMacroChip}>🍗 Protein: {meal.protein}</Text>
                  <Text style={styles.mealMacroChip}>🍚 Carbs: {meal.carbs}</Text>
                  <Text style={styles.mealMacroChip}>🥑 Fats: {meal.fats}</Text>
                </View>

                <View style={styles.ingredientsBox}>
                  <Text style={styles.ingredientsTitle}>Key Ingredients:</Text>
                  {meal.key_ingredients?.map((ing: string, i: number) => (
                    <Text key={i} style={styles.ingredientItem}>• {ing}</Text>
                  ))}
                </View>

                {meal.micronutrient_spotlight && (
                  <View style={styles.microBox}>
                    <Ionicons name="leaf-outline" size={14} color={colors.emerald} />
                    <Text style={styles.microText}>{meal.micronutrient_spotlight}</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Hydration & Supplement Protocol */}
            {nutrition.hydration_protocol && (
              <View style={styles.protocolBox}>
                <View style={styles.protocolHeader}>
                  <Ionicons name="water-outline" size={16} color="#0284C7" />
                  <Text style={styles.protocolTitle}>Hydration Protocol</Text>
                </View>
                <Text style={styles.protocolDesc}>{nutrition.hydration_protocol}</Text>
              </View>
            )}

            {nutrition.supplement_stack && (
              <View style={styles.protocolBox}>
                <View style={styles.protocolHeader}>
                  <Ionicons name="medkit-outline" size={16} color={colors.primary} />
                  <Text style={styles.protocolTitle}>Recommended Supplement Stack</Text>
                </View>
                <View style={styles.stackRow}>
                  {nutrition.supplement_stack.map((supp: string, idx: number) => (
                    <View key={idx} style={styles.suppBadge}>
                      <Text style={styles.suppText}>{supp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : null}
      </View>

      {/* Action Footer */}
      <View style={styles.footerGroup}>
        <GradientButton
          title="Done & View Analytics"
          icon="analytics-outline"
          onPress={() => navigation.navigate('MainTabs')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  shareBtn: {
    padding: spacing.xs,
  },
  scoreHero: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.card,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
  drillName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  ringCenter: {
    marginVertical: spacing.lg,
  },
  repSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  repItem: {
    alignItems: 'center',
  },
  repVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  repLbl: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.surfaceBorder,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  recBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: spacing.sm,
  },
  recText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  scorePill: {
    marginLeft: 'auto',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  debriefSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  debriefBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: 12,
  },
  debriefRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  debriefLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  debriefVal: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  nutritionWorkout: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  nutritionFocus: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.lg,
  },
  macroPill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  macroVal: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  macroLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    marginTop: 2,
  },
  mealSectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  mealTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    flex: 1,
  },
  mealTimingBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  mealTimingText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.emerald,
  },
  mealDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  mealMacros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  mealMacroChip: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ingredientsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: 8,
    marginBottom: 8,
  },
  ingredientsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ingredientItem: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  microBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
  },
  microText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  protocolBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  protocolTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  protocolDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  stackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  suppBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  suppText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  footerGroup: {
    marginTop: spacing.sm,
  },
});
