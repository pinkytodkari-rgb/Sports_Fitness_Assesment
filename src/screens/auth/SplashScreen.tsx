import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          if (userRole === 'coach') {
            navigation.replace('CoachDashboard');
          } else if (userRole === 'admin') {
            navigation.replace('AdminDashboard');
          } else {
            navigation.replace('MainTabs');
          }
        } else {
          navigation.replace('Welcome');
        }
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, userRole]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrapper, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="sparkles" size={42} color="#FFFFFF" />
        </View>
        <Text style={styles.brandTitle}>Athlete<Text style={{ color: colors.accent }}>AI</Text></Text>
        <Text style={styles.tagline}>BIOMECHANICAL PERFORMANCE & SCOUTING</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary, // #0B1F3A
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 8,
  },
});
