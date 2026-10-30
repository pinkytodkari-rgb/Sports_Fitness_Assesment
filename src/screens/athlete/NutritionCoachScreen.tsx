import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { apiService } from '../../services/apiService';

const EXERCISE_OPTIONS = [
  { label: 'Push-ups (Upper Body)', value: 'pushups', icon: 'barbell-outline' },
  { label: 'Squats (Lower Body)', value: 'squats', icon: 'fitness-outline' },
  { label: 'Sit-ups (Core Abs)', value: 'situps', icon: 'body-outline' },
  { label: 'Jumping Jacks (Cardio)', value: 'jumping_jacks', icon: 'flame-outline' },
  { label: 'Lunges (Unilateral)', value: 'lunges', icon: 'walk-outline' },
  { label: 'Biceps Curls (Arms)', value: 'biceps_curls', icon: 'flash-outline' },
];

const GOAL_OPTIONS = [
  'Hypertrophy / Muscle Gain',
  'Fat Loss & Conditioning',
  'Athletic Power & Speed',
  'Endurance Stamina',
];

export const NutritionCoachScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedExercise, setSelectedExercise] = useState('pushups');
  const [selectedGoal, setSelectedGoal] = useState('Hypertrophy / Muscle Gain');
  const [nutrition, setNutrition] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlan(selectedExercise, selectedGoal);
  }, [selectedExercise, selectedGoal]);

  const fetchPlan = async (ex: string, g: string) => {
    setLoading(true);
    try {
      const data = await apiService.getNutritionRecommendations(ex, g);
      setNutrition(data);
    } catch (err) {
      console.warn('Failed to fetch nutrition:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="AI Sports Nutrition & Fuel" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero AI Fuel Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={styles.heroBadgeText}>AI MACRONUTRIENT & RECOVERY LAB</Text>
          </View>
          <Text style={styles.heroTitle}>Biomechanical Fuel Strategy</Text>
          <Text style={styles.heroDesc}>
            Tailored nutrition blueprints mapped directly to your training volume, joint demands, and muscle group recovery.
          </Text>
        </View>

        {/* Workout Activity Selector */}
        <Text style={styles.sectionHeading}>Select Your Training Activity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {EXERCISE_OPTIONS.map((opt) => {
            const isSelected = selectedExercise === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.exChip, isSelected && styles.exChipActive]}
                onPress={() => setSelectedExercise(opt.value)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text style={[styles.exChipText, isSelected && styles.exChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Athletic Goal Selector */}
        <Text style={[styles.sectionHeading, { marginTop: spacing.md }]}>Primary Goal</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {GOAL_OPTIONS.map((g) => {
            const isSelected = selectedGoal === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.goalChip, isSelected && styles.goalChipActive]}
                onPress={() => setSelectedGoal(g)}
                activeOpacity={0.8}
              >
                <Text style={[styles.goalChipText, isSelected && styles.goalChipTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Main Content Area */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Synthesizing Nutritional Bio-Blueprint...</Text>
          </View>
        ) : nutrition ? (
          <View style={styles.planContainer}>
            {/* Target Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.workoutTypeHeading}>{nutrition.workout_type}</Text>
              <Text style={styles.focusSubtitle}>{nutrition.focus}</Text>

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
            </View>

            {/* Targeted Recovery Meals */}
            <Text style={styles.sectionHeading}>Targeted Recovery Meals (3-4 Blueprints)</Text>
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
                  <Text style={styles.ingredientsTitle}>Chef's Key Ingredients:</Text>
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
              <View style={styles.protocolCard}>
                <View style={styles.protocolHeader}>
                  <Ionicons name="water-outline" size={18} color="#0284C7" />
                  <Text style={styles.protocolTitle}>Hydration & Electrolyte Strategy</Text>
                </View>
                <Text style={styles.protocolDesc}>{nutrition.hydration_protocol}</Text>
              </View>
            )}

            {nutrition.supplement_stack && (
              <View style={styles.protocolCard}>
                <View style={styles.protocolHeader}>
                  <Ionicons name="medkit-outline" size={18} color={colors.primary} />
                  <Text style={styles.protocolTitle}>Targeted Micronutrient & Supplement Stack</Text>
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

            {/* LLM Engine Notice */}
            <View style={styles.llmNoticeBox}>
              <Ionicons name="hardware-chip-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.llmNoticeText}>
                Engine Status: Model outputs mapped to ACSM athletic guidelines. Live LLM Hook (Gemini/OpenAI) configured.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 80,
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: spacing.lg,
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 4,
  },
  exChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  exChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  exChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  exChipTextActive: {
    color: '#FFFFFF',
  },
  goalChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  goalChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  goalChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  goalChipTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  planContainer: {
    marginTop: spacing.lg,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  workoutTypeHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  focusSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 8,
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
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
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
    fontSize: 15,
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
    lineHeight: 18,
    marginBottom: 10,
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
    padding: 10,
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
  protocolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  protocolTitle: {
    fontSize: 13,
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
  llmNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  llmNoticeText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 15,
  },
});
