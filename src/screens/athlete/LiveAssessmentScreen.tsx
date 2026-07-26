import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { DrillAssessment, AssessmentResult } from '../../types';

export const LiveAssessmentScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { addAssessmentResult } = useApp();
  const drill: DrillAssessment = route.params?.drill || {
    id: 'drill-1',
    title: 'Vertical Jump Mechanics',
    category: 'Explosive Power',
    duration: '60 secs',
    difficulty: 'Elite',
    description: 'Measures vertical displacement and posture.',
    targetMetric: '38.5 Inches',
    iconName: 'flash-outline',
    bannerColor: ['#0B1F3A', '#1E3A8A'],
  };

  const [seconds, setSeconds] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [poseAccuracy, setPoseAccuracy] = useState(96.5);
  const [confidence, setConfidence] = useState(98.8);
  const [kneeAngle, setKneeAngle] = useState(112);
  const [hipAngle, setHipAngle] = useState(88);
  const [feedbackToast, setFeedbackToast] = useState('ALIGNING SKELETON POSE...');

  useEffect(() => {
    // Timer Ticks
    const timerInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Mock Rep Counter & Dynamic Joint Angle shifts
    const repInterval = setInterval(() => {
      setRepCount((prev) => prev + 1);

      // Randomize dynamic pose metrics
      const newAcc = (94 + Math.random() * 5).toFixed(1);
      const newConf = (97 + Math.random() * 2.8).toFixed(1);
      const newKnee = Math.floor(105 + Math.random() * 15);
      const newHip = Math.floor(82 + Math.random() * 12);

      setPoseAccuracy(parseFloat(newAcc));
      setConfidence(parseFloat(newConf));
      setKneeAngle(newKnee);
      setHipAngle(newHip);

      const feedbackOptions = [
        'PERFECT FORM DETECTED! ⚡',
        'EXPLOSIVE VERTICAL TAKE-OFF',
        'GREAT KNEE FLEXION',
        'EXCELLENT LANDING STABILITY',
        'PEAK VELOCITY ACHIEVED',
      ];
      setFeedbackToast(feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]);
    }, 3500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(repInterval);
    };
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopAssessment = () => {
    const resultObj: AssessmentResult = {
      id: `res-${Date.now()}`,
      assessmentId: drill.id,
      assessmentTitle: drill.title,
      athleteId: 'ath-1',
      date: 'Just Now',
      overallScore: Math.floor(92 + Math.random() * 7),
      correctReps: repCount,
      incorrectReps: Math.floor(Math.random() * 2),
      postureScore: Math.floor(94 + Math.random() * 5),
      consistency: Math.floor(92 + Math.random() * 6),
      stability: Math.floor(95 + Math.random() * 4),
      jointAngles: {
        kneeFlexion: kneeAngle,
        hipAngle: hipAngle,
        shoulderAlignment: 99,
      },
      recommendations: [
        `Outstanding execution on ${drill.title}.`,
        'Optimal explosive velocity observed during vertical phase.',
        'Slight lateral weight shift on landing - engage core & glute medius.',
      ],
      durationSeconds: seconds,
    };

    addAssessmentResult(resultObj);
    navigation.replace('AssessmentResult', { result: resultObj });
  };

  return (
    <View style={styles.container}>
      {/* HUD Header Bar */}
      <View style={styles.hudTopBar}>
        <TouchableOpacity onPress={handleStopAssessment} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.drillName}>{drill.title}</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AI POSE HUD LIVE</Text>
          </View>
        </View>

        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={16} color="#60A5FA" />
          <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
        </View>
      </View>

      {/* Simulated Camera Viewport with Vision Overlay */}
      <View style={styles.cameraViewport}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80' }}
          style={styles.cameraFeed}
          imageStyle={{ opacity: 0.6 }}
        >
          {/* Skeleton Computer Vision Vector Overlay */}
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            {/* Spine & Head */}
            <Circle cx="50%" cy="22%" r="18" stroke="#22C55E" strokeWidth="3" fill="rgba(34, 197, 94, 0.2)" />
            <Line x1="50%" y1="26%" x2="50%" y2="50%" stroke="#22C55E" strokeWidth="4" />

            {/* Shoulder to Arms */}
            <Line x1="32%" y1="32%" x2="68%" y2="32%" stroke="#22C55E" strokeWidth="4" />
            <Line x1="32%" y1="32%" x2="24%" y2="44%" stroke="#22C55E" strokeWidth="3" />
            <Line x1="68%" y1="32%" x2="76%" y2="44%" stroke="#22C55E" strokeWidth="3" />

            {/* Hips to Legs */}
            <Line x1="40%" y1="50%" x2="60%" y2="50%" stroke="#22C55E" strokeWidth="4" />
            <Line x1="40%" y1="50%" x2="36%" y2="68%" stroke="#22C55E" strokeWidth="4" />
            <Line x1="60%" y1="50%" x2="64%" y2="68%" stroke="#22C55E" strokeWidth="4" />
            <Line x1="36%" y1="68%" x2="38%" y2="86%" stroke="#22C55E" strokeWidth="4" />
            <Line x1="64%" y1="68%" x2="62%" y2="86%" stroke="#22C55E" strokeWidth="4" />

            {/* Key Joint Nodes */}
            <Circle cx="32%" cy="32%" r="6" fill="#2563EB" />
            <Circle cx="68%" cy="32%" r="6" fill="#2563EB" />
            <Circle cx="36%" cy="68%" r="7" fill="#22C55E" />
            <Circle cx="64%" cy="68%" r="7" fill="#22C55E" />
          </Svg>

          {/* Dynamic AI Feedback Toast Overlay */}
          <View style={styles.feedbackToastContainer}>
            <View style={styles.feedbackToastChip}>
              <Ionicons name="sparkles" size={16} color="#38BDF8" />
              <Text style={styles.feedbackToastText}>{feedbackToast}</Text>
            </View>
          </View>

          {/* Floating Joint Angle HUD Badges */}
          <View style={styles.jointHudLeft}>
            <Text style={styles.jointHudLabel}>KNEE FLEXION</Text>
            <Text style={styles.jointHudVal}>{kneeAngle}°</Text>
          </View>

          <View style={styles.jointHudRight}>
            <Text style={styles.jointHudLabel}>HIP DRIVE</Text>
            <Text style={styles.jointHudVal}>{hipAngle}°</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Bottom Telemetry HUD */}
      <View style={styles.hudFooter}>
        <View style={styles.telemetryRow}>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryVal}>{repCount}</Text>
            <Text style={styles.telemetryLbl}>REPS COMPLETED</Text>
          </View>

          <View style={styles.telemetryDivider} />

          <View style={styles.telemetryItem}>
            <Text style={[styles.telemetryVal, { color: colors.emerald }]}>{poseAccuracy}%</Text>
            <Text style={styles.telemetryLbl}>POSE ACCURACY</Text>
          </View>

          <View style={styles.telemetryDivider} />

          <View style={styles.telemetryItem}>
            <Text style={[styles.telemetryVal, { color: colors.accent }]}>{confidence}%</Text>
            <Text style={styles.telemetryLbl}>CONFIDENCE</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleStopAssessment}
          style={styles.stopBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="square" size={18} color="#FFFFFF" />
          <Text style={styles.stopBtnText}>Finish & Analyze Trial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071426',
  },
  hudTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: '#0B1F3A',
  },
  backBtn: {
    padding: spacing.xs,
  },
  titleWrapper: {
    alignItems: 'center',
  },
  drillName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emerald,
  },
  liveText: {
    color: colors.emerald,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cameraViewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#071426',
  },
  cameraFeed: {
    flex: 1,
  },
  feedbackToastContainer: {
    position: 'absolute',
    top: spacing.md,
    alignSelf: 'center',
  },
  feedbackToastChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(11, 31, 58, 0.9)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  feedbackToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  jointHudLeft: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.xl,
    backgroundColor: 'rgba(11, 31, 58, 0.85)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  jointHudRight: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl,
    backgroundColor: 'rgba(11, 31, 58, 0.85)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  jointHudLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  jointHudVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  hudFooter: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.card,
    borderTopRightRadius: borderRadius.card,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  telemetryItem: {
    alignItems: 'center',
  },
  telemetryVal: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  telemetryLbl: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  telemetryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  stopBtn: {
    height: 52,
    backgroundColor: colors.rose,
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stopBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
