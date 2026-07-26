import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { GradientButton } from '../../components/common/GradientButton';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const RoleSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { setUserRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('athlete');

  const handleContinue = () => {
    setUserRole(selectedRole);
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back-outline" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Select Persona</Text>
        <Text style={styles.subtitle}>Choose how you wish to experience AthleteAI platform</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* Athlete Persona */}
        <TouchableOpacity
          onPress={() => setSelectedRole('athlete')}
          activeOpacity={0.85}
          style={[styles.roleCard, selectedRole === 'athlete' && styles.selectedRoleCard]}
        >
          <View style={styles.cardInner}>
            <View style={styles.iconCircle}>
              <Ionicons name="fitness-outline" size={26} color={colors.accent} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Athlete</Text>
              <Text style={styles.roleDesc}>Perform AI drills, get posture HUD feedback, view stats & unlock scout reports.</Text>
            </View>
            <Ionicons
              name={selectedRole === 'athlete' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selectedRole === 'athlete' ? colors.accent : colors.textMuted}
            />
          </View>
        </TouchableOpacity>

        {/* Scout / Coach Persona */}
        <TouchableOpacity
          onPress={() => setSelectedRole('coach')}
          activeOpacity={0.85}
          style={[styles.roleCard, selectedRole === 'coach' && styles.selectedRoleCard]}
        >
          <View style={styles.cardInner}>
            <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="eye-outline" size={26} color={colors.secondary} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Scout / Coach</Text>
              <Text style={styles.roleDesc}>Discover top athletes, filter talent, compare radar metrics & maintain shortlists.</Text>
            </View>
            <Ionicons
              name={selectedRole === 'coach' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selectedRole === 'coach' ? colors.secondary : colors.textMuted}
            />
          </View>
        </TouchableOpacity>

        {/* Admin Persona */}
        <TouchableOpacity
          onPress={() => setSelectedRole('admin')}
          activeOpacity={0.85}
          style={[styles.roleCard, selectedRole === 'admin' && styles.selectedRoleCard]}
        >
          <View style={styles.cardInner}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="shield-checkmark-outline" size={26} color={colors.amber} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Administrator</Text>
              <Text style={styles.roleDesc}>Manage platform users, system analytics, assessment data & global parameters.</Text>
            </View>
            <Ionicons
              name={selectedRole === 'admin' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selectedRole === 'admin' ? colors.amber : colors.textMuted}
            />
          </View>
        </TouchableOpacity>
      </View>

      <GradientButton
        title={`Continue as ${selectedRole.toUpperCase()}`}
        onPress={handleContinue}
        icon="arrow-forward-outline"
        style={{ marginTop: spacing.xl }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  backBtn: {
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary, // #0B1F3A
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  roleCard: {
    borderRadius: borderRadius.card, // 18px
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  selectedRoleCard: {
    borderColor: colors.accent,
    backgroundColor: '#F8FAFC',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  roleTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  roleDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
});
