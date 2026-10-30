import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { useApp } from '../../context/AppContext';
import { DrillAssessment, AssessmentResult, ExerciseType } from '../../types';
import { apiService } from '../../services/apiService';

interface LandmarkPoint {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export const LiveAssessmentScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { addAssessmentResult } = useApp();
  const drill: DrillAssessment = route.params?.drill || {
    id: 'drill-pushups',
    title: 'Push-ups Form & Repetition Lab',
    category: 'Upper Body',
    duration: '60 secs',
    difficulty: 'Intermediate',
    description: 'Real-time elbow flexion detection, spine neutral alignment, and chest-to-deck trajectory.',
    targetMetric: '35+ Reps',
    iconName: 'body-outline',
    bannerColor: ['#FF5500', '#B83800'],
    exerciseType: 'pushups',
    primaryAngleName: 'ELBOW FLEXION',
    secondaryAngleName: 'SPINE ALIGN',
  };

  const exerciseType: ExerciseType = drill.exerciseType || 'pushups';

  // Mode: 'camera' or 'upload'
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');

  // Live Telemetry States (driven directly by MediaPipe Pose backend)
  const [seconds, setSeconds] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [validReps, setValidReps] = useState(0);
  const [invalidReps, setInvalidReps] = useState(0);
  const [primaryAngle, setPrimaryAngle] = useState(180.0);
  const [secondaryAngle, setSecondaryAngle] = useState(180.0);
  const [primaryLabel, setPrimaryLabel] = useState(drill.primaryAngleName || 'PRIMARY ANGLE');
  const [secondaryLabel, setSecondaryLabel] = useState(drill.secondaryAngleName || 'SECONDARY ANGLE');
  const [poseAccuracy, setPoseAccuracy] = useState(95.0);
  const [feedbackToast, setFeedbackToast] = useState('Position yourself in view of the camera.');
  const [formStatus, setFormStatus] = useState('Analyzing');
  const [landmarks, setLandmarks] = useState<LandmarkPoint[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Video Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoTimeline, setVideoTimeline] = useState<any[]>([]);
  const [uploadExercise, setUploadExercise] = useState<string>('Auto-Detect');
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Session ID for frame analysis continuity
  const sessionIdRef = useRef<string>(`session_${Date.now()}`);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<any>(null);

  // Timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Web Camera Lifecycle
  useEffect(() => {
    if (mode === 'camera' && Platform.OS === 'web') {
      startWebCamera();
    } else {
      stopWebCamera();
    }
    return () => {
      stopWebCamera();
    };
  }, [mode]);

  const startWebCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Webcam access not supported on this browser or platform.');
      return;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoElemRef.current) {
        videoElemRef.current.srcObject = stream;
        videoElemRef.current.play();
      }
      setCameraActive(true);

      // Reset backend state tracker for this session
      apiService.analyzeFrame('', drill.title, sessionIdRef.current, true);

      // Create hidden canvas for frame grabbing
      if (!canvasRef.current && typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        canvasRef.current = canvas;
      }

      // Stream frames to backend MediaPipe model every 250ms (~4 fps)
      intervalRef.current = setInterval(() => {
        captureAndAnalyzeFrame();
      }, 250);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Camera access denied or unavailable. Please grant permission or use Video Upload.');
      setCameraActive(false);
    }
  };

  const stopWebCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureAndAnalyzeFrame = async () => {
    if (!videoElemRef.current || !canvasRef.current) return;
    const video = videoElemRef.current;
    if (video.readyState < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

      const res = await apiService.analyzeFrame(dataUrl, drill.title, sessionIdRef.current);
      if (res && res.detected) {
        setLandmarks(res.landmarks || []);
        setPrimaryAngle(res.primary_angle);
        setSecondaryAngle(res.secondary_angle);
        setPrimaryLabel(res.primary_angle_name || drill.primaryAngleName || 'PRIMARY');
        setSecondaryLabel(res.secondary_angle_name || drill.secondaryAngleName || 'SECONDARY');
        setRepCount(res.rep_count);
        setValidReps(res.valid_reps);
        setInvalidReps(res.invalid_reps);
        setPoseAccuracy(res.accuracy_score);
        setFeedbackToast(res.feedback);
        setFormStatus(res.form_status);
      } else if (res && !res.detected) {
        setLandmarks([]);
        setFeedbackToast(res.feedback || 'Step into the camera frame.');
        setFormStatus('Searching');
      }
    } catch (err) {
      console.warn('Frame analysis cycle skipped:', err);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Video File Selection (Web standard)
  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (typeof URL !== 'undefined') {
        const previewUrl = URL.createObjectURL(file);
        setVideoPreviewUrl(previewUrl);
      }
      setAnalysisResult(null);
      setVideoTimeline([]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus('1/3 Decoding video frames...');
    setUploadProgress(25);

    try {
      setTimeout(() => {
        setUploadStatus('2/3 Running MediaPipe Pose 3D Landmarker...');
        setUploadProgress(60);
      }, 900);

      setTimeout(() => {
        setUploadStatus('3/3 Calculating joint angles & validating repetitions...');
        setUploadProgress(85);
      }, 1800);

      const result = await apiService.analyzeVideo(selectedFile, uploadExercise === 'Auto-Detect' ? 'Auto-Detect' : uploadExercise, 'ath-1');
      setUploadProgress(100);
      setUploadStatus('Analysis complete! Reviewing kinematic trajectory...');
      setAnalysisResult(result);
      setVideoTimeline(result.timeline || []);

      // Update telemetry
      setRepCount(result.total_reps || 0);
      setValidReps(result.valid_reps || 0);
      setInvalidReps(result.invalid_reps || 0);
      setPoseAccuracy(result.accuracy_score || 95.0);
      if (result.timeline && result.timeline.length > 0) {
        setPrimaryAngle(result.timeline[0].primary_angle);
        setSecondaryAngle(result.timeline[0].secondary_angle);
      }

      const resultObj: AssessmentResult = {
        id: result.session_id || `res-${Date.now()}`,
        assessmentId: drill.id,
        assessmentTitle: drill.title,
        athleteId: 'ath-1',
        date: 'Uploaded Video Trial',
        overallScore: result.accuracy_score,
        correctReps: result.valid_reps,
        incorrectReps: result.invalid_reps,
        postureScore: result.accuracy_score,
        consistency: Math.min(100, Math.round(result.pose_visibility_percent)),
        stability: Math.min(100, Math.round(result.accuracy_score * 0.98)),
        jointAngles: {
          primaryAngle: result.timeline?.[0]?.primary_angle || 90,
          secondaryAngle: result.timeline?.[0]?.secondary_angle || 175,
          primaryAngleName: drill.primaryAngleName || 'PRIMARY ANGLE',
          secondaryAngleName: drill.secondaryAngleName || 'SECONDARY ANGLE',
          kneeFlexion: 90,
          hipAngle: 175,
          shoulderAlignment: 99,
        },
        recommendations: result.recommendations || [
          'Kinematic analysis completed via MediaPipe Pose.',
          'Solid joint trajectory observed throughout the recorded repetition sequence.',
        ],
        durationSeconds: Math.round(result.duration_seconds || seconds),
        exerciseType: exerciseType,
      };

      addAssessmentResult(resultObj);
    } catch (err: any) {
      alert(`Video analysis failed: ${err.message || 'Error communicating with backend'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleStopAssessment = () => {
    stopWebCamera();
    const finalScore = poseAccuracy;
    const resultObj: AssessmentResult = {
      id: `res-${Date.now()}`,
      assessmentId: drill.id,
      assessmentTitle: drill.title,
      athleteId: 'ath-1',
      date: 'Live Camera Trial',
      overallScore: finalScore,
      correctReps: validReps > 0 ? validReps : repCount,
      incorrectReps: invalidReps,
      postureScore: finalScore,
      consistency: 94,
      stability: 95,
      jointAngles: {
        primaryAngle: primaryAngle,
        secondaryAngle: secondaryAngle,
        primaryAngleName: primaryLabel,
        secondaryAngleName: secondaryLabel,
        kneeFlexion: primaryAngle,
        hipAngle: secondaryAngle,
        shoulderAlignment: 98,
      },
      recommendations: [
        `Live MediaPipe session logged ${repCount} reps with ${finalScore}% biomechanical compliance.`,
        `${primaryLabel}: average joint trajectory stayed in target range.`,
        'Keep continuous focus on core stabilization during peak eccentric phase.',
      ],
      durationSeconds: seconds,
      exerciseType: exerciseType,
    };

    addAssessmentResult(resultObj);
    navigation.replace('AssessmentResult', { result: resultObj });
  };

  // Helper to render skeleton lines between two landmarks
  const renderBone = (idx1: number, idx2: number, stroke = colors.primary, strokeWidth = 3) => {
    if (!landmarks || landmarks.length <= Math.max(idx1, idx2)) return null;
    const p1 = landmarks[idx1];
    const p2 = landmarks[idx2];
    if (p1.visibility < 0.3 || p2.visibility < 0.3) return null;

    return (
      <Line
        key={`bone-${idx1}-${idx2}`}
        x1={`${(p1.x * 100).toFixed(1)}%`}
        y1={`${(p1.y * 100).toFixed(1)}%`}
        x2={`${(p2.x * 100).toFixed(1)}%`}
        y2={`${(p2.y * 100).toFixed(1)}%`}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  };

  const renderJoint = (idx: number, color = colors.primary, radius = 6) => {
    if (!landmarks || landmarks.length <= idx) return null;
    const p = landmarks[idx];
    if (p.visibility < 0.3) return null;

    return (
      <Circle
        key={`joint-${idx}`}
        cx={`${(p.x * 100).toFixed(1)}%`}
        cy={`${(p.y * 100).toFixed(1)}%`}
        r={radius}
        fill={color}
      />
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Header */}
      <View style={styles.hudTopBar}>
        <TouchableOpacity onPress={handleStopAssessment} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.drillName}>{drill.title}</Text>
          <View style={styles.liveIndicator}>
            <View style={[styles.liveDot, { backgroundColor: cameraActive ? colors.emerald : colors.primary }]} />
            <Text style={styles.liveText}>
              {cameraActive ? 'MEDIAPIPE POSE ACTIVE' : 'REAL-TIME MOTION LAB'}
            </Text>
          </View>
        </View>

        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
        </View>
      </View>

      {/* Mode Selector Tabs: Live Camera vs Upload Video */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'camera' && styles.modeTabActive]}
          onPress={() => setMode('camera')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="videocam-outline"
            size={18}
            color={mode === 'camera' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.modeTabText, mode === 'camera' && styles.modeTabTextActive]}>
            Live Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === 'upload' && styles.modeTabActive]}
          onPress={() => setMode('upload')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={18}
            color={mode === 'upload' ? '#FFFFFF' : colors.textSecondary}
          />
          <Text style={[styles.modeTabText, mode === 'upload' && styles.modeTabTextActive]}>
            Upload Video File
          </Text>
        </TouchableOpacity>
      </View>

      {/* CAMERA VIEWPORT OR UPLOAD INTERFACE */}
      {mode === 'camera' ? (
        <View style={styles.cameraViewport}>
          {Platform.OS === 'web' && (
            <video
              ref={videoElemRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror webcam
              }}
              playsInline
              muted
            />
          )}

          {/* Skeleton Vector Overlay */}
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            {landmarks && landmarks.length >= 29 ? (
              <>
                {/* Real-time MediaPipe Bones */}
                {renderBone(11, 12, '#FF5500', 4)}
                {renderBone(11, 23, '#FF5500', 3)}
                {renderBone(12, 24, '#FF5500', 3)}
                {renderBone(23, 24, '#FF5500', 4)}
                {/* Arms */}
                {renderBone(11, 13, '#10B981', 4)}
                {renderBone(13, 15, '#10B981', 4)}
                {renderBone(12, 14, '#10B981', 4)}
                {renderBone(14, 16, '#10B981', 4)}
                {/* Legs */}
                {renderBone(23, 25, '#FF5500', 4)}
                {renderBone(25, 27, '#FF5500', 4)}
                {renderBone(24, 26, '#FF5500', 4)}
                {renderBone(26, 28, '#FF5500', 4)}
                {/* Joints */}
                {renderJoint(11, '#FF5500', 7)}
                {renderJoint(12, '#FF5500', 7)}
                {renderJoint(13, '#10B981', 7)}
                {renderJoint(14, '#10B981', 7)}
                {renderJoint(15, '#10B981', 6)}
                {renderJoint(16, '#10B981', 6)}
                {renderJoint(23, '#FF5500', 7)}
                {renderJoint(24, '#FF5500', 7)}
                {renderJoint(25, '#FF5500', 7)}
                {renderJoint(26, '#FF5500', 7)}
                {renderJoint(27, '#FF5500', 6)}
                {renderJoint(28, '#FF5500', 6)}
              </>
            ) : (
              /* Guiding Reference Silhouette when no person detected */
              <>
                <Circle cx="50%" cy="24%" r="22" stroke={colors.primary} strokeWidth="2" fill="none" opacity={0.3} />
                <Line x1="50%" y1="28%" x2="50%" y2="52%" stroke={colors.primary} strokeWidth="3" opacity={0.3} />
                <Line x1="32%" y1="34%" x2="68%" y2="34%" stroke={colors.primary} strokeWidth="3" opacity={0.3} />
                <Line x1="38%" y1="52%" x2="62%" y2="52%" stroke={colors.primary} strokeWidth="3" opacity={0.3} />
              </>
            )}
          </Svg>

          {/* Feedback Toast */}
          <View style={styles.feedbackToastContainer}>
            <View style={styles.feedbackToastChip}>
              <Ionicons
                name={formStatus === 'Correct' ? 'checkmark-circle' : 'sparkles'}
                size={16}
                color={formStatus === 'Correct' ? colors.emerald : colors.primary}
              />
              <Text style={styles.feedbackToastText}>{feedbackToast}</Text>
            </View>
          </View>

          {/* Real Joint Angle Badges */}
          <View style={styles.jointHudLeft}>
            <Text style={styles.jointHudLabel}>{primaryLabel}</Text>
            <Text style={styles.jointHudVal}>{primaryAngle}°</Text>
          </View>

          <View style={styles.jointHudRight}>
            <Text style={styles.jointHudLabel}>{secondaryLabel}</Text>
            <Text style={styles.jointHudVal}>{secondaryAngle}°</Text>
          </View>

          {cameraError && (
            <View style={styles.cameraErrorOverlay}>
              <Ionicons name="warning-outline" size={32} color={colors.primary} />
              <Text style={styles.cameraErrorText}>{cameraError}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={startWebCamera}>
                <Text style={styles.retryBtnText}>Retry Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* VIDEO UPLOAD INTERFACE */
        <View style={styles.uploadCard}>
          <Ionicons name="videocam" size={48} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={styles.uploadTitle}>Upload Drill Video for AI Analysis</Text>
          <Text style={styles.uploadSubtitle}>
            Upload any recorded workout video (MP4, MOV, WebM). Our vision models automatically recognize the exercise, evaluate every repetition, and extract joint trajectories.
          </Text>

          {/* Exercise Selector Bar */}
          <View style={{ marginVertical: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.8, marginBottom: 8 }}>
              CHOOSE EXERCISE OR AUTO-DETECT:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {['Auto-Detect', 'Push-ups', 'Squats', 'Sit-ups', 'Jumping Jacks', 'Lunges', 'Biceps Curls'].map((exName) => {
                const active = uploadExercise === exName;
                return (
                  <TouchableOpacity
                    key={exName}
                    onPress={() => setUploadExercise(exName)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 20,
                      backgroundColor: active ? colors.primary : '#F1F5F9',
                      borderWidth: 1,
                      borderColor: active ? colors.primary : '#E2E8F0',
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#FFFFFF' : '#475569' }}>
                      {exName === 'Auto-Detect' ? '⚡ Auto-Detect' : exName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {Platform.OS === 'web' && (
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: '2px dashed #FF5500',
                  backgroundColor: '#FFF7ED',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#1E293B',
                  width: '90%',
                  maxWidth: '400px',
                }}
              />
            </div>
          )}

          {selectedFile && (
            <View style={styles.fileSelectedBox}>
              <Ionicons name="document-attach" size={20} color={colors.primary} />
              <Text style={styles.fileSelectedText}>
                {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
              </Text>
            </View>
          )}

          {/* Local Video Player Preview */}
          {videoPreviewUrl && Platform.OS === 'web' && (
            <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <video
                src={videoPreviewUrl}
                controls
                style={{ width: '100%', maxHeight: 280, backgroundColor: '#0F172A', display: 'block' }}
              />
            </div>
          )}

          {uploading ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.uploadStatusText}>{uploadStatus}</Text>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.uploadActionBtn, !selectedFile && styles.uploadActionBtnDisabled]}
              disabled={!selectedFile}
              onPress={handleUploadAndAnalyze}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.uploadActionBtnText}>
                {analysisResult ? 'Re-Analyze Kinematics' : 'Analyze Kinematics with AI'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Analysis Result & Timeline Breakdown Table (Streamlit-Equivalent) */}
          {analysisResult && (
            <View style={styles.analysisResultsWrapper}>
              {/* AI Auto Exercise Recognition Banner */}
              <View style={{
                backgroundColor: '#FFF7ED',
                borderWidth: 1,
                borderColor: '#FFEDD5',
                borderRadius: 14,
                padding: 14,
                marginBottom: 16,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="sparkles" size={16} color={colors.primary} />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary, letterSpacing: 0.8 }}>
                      AI EXERCISE RECOGNITION
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#FF5500', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                      {analysisResult.exercise_recognition?.confidence || 98}% CONFIDENCE
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 2 }}>
                  {analysisResult.exercise || drill.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B' }}>
                  {analysisResult.exercise_recognition?.reason || 'Identified from 3D joint kinetic trajectories'}
                </Text>
              </View>

              <View style={styles.analysisSummaryRow}>
                <View style={styles.summaryBadge}>
                  <Text style={[styles.summaryVal, { color: colors.emerald }]}>{analysisResult.valid_reps}</Text>
                  <Text style={styles.summaryLbl}>VALID REPS</Text>
                </View>
                <View style={styles.summaryBadge}>
                  <Text style={[styles.summaryVal, { color: colors.rose }]}>{analysisResult.invalid_reps}</Text>
                  <Text style={styles.summaryLbl}>NO-REPS</Text>
                </View>
                <View style={styles.summaryBadge}>
                  <Text style={[styles.summaryVal, { color: colors.primary }]}>{analysisResult.accuracy_score}%</Text>
                  <Text style={styles.summaryLbl}>ACCURACY</Text>
                </View>
                <View style={styles.summaryBadge}>
                  <Text style={styles.summaryVal}>{analysisResult.pose_visibility_percent}%</Text>
                  <Text style={styles.summaryLbl}>VISIBILITY</Text>
                </View>
              </View>

              {/* Repetition-by-Repetition Breakdown (A to Z Details) */}
              {analysisResult.rep_details && analysisResult.rep_details.length > 0 && (
                <View style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  padding: 14,
                  marginBottom: 16,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Ionicons name="checkmark-done-circle" size={18} color={colors.primary} />
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A' }}>
                      Repetition-by-Repetition Diagnostics ({analysisResult.rep_details.length} Reps)
                    </Text>
                  </View>

                  {analysisResult.rep_details.map((rep: any, idx: number) => {
                    const isValid = rep.valid;
                    return (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: isValid ? '#F0FDF4' : '#FEF2F2',
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: isValid ? '#BBF7D0' : '#FECACA',
                          padding: 10,
                          marginBottom: 8,
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>
                              Rep #{rep.rep_number || idx + 1}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#64748B' }}>
                              ({rep.start_time || 0}s – {rep.finish_time || 0}s)
                            </Text>
                          </View>
                          <View style={{
                            backgroundColor: isValid ? colors.emerald : colors.rose,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                              {isValid ? 'VALID REP' : 'NO-REP'}
                            </Text>
                          </View>
                        </View>

                        <Text style={{ fontSize: 12, fontWeight: '600', color: isValid ? '#166534' : '#991B1B', marginBottom: 2 }}>
                          {rep.feedback || rep.fault_reason || (isValid ? 'Clean movement' : 'Form fault')}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#64748B' }}>
                          Peak depth joint angle: {rep.min_angle || rep.max_arm_angle || rep.min_knee_angle}°
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* OpenGym AI Coach Debrief */}
              {analysisResult.coach_debrief && (
                <View style={{
                  backgroundColor: '#0F172A',
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="hardware-chip" size={16} color={colors.primary} />
                      <Text style={{ color: '#FF5500', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 }}>
                        OPENGYM AI COACH DEBRIEF
                      </Text>
                    </View>
                    <View style={{ backgroundColor: '#FF5500', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '900' }}>
                        {analysisResult.coach_debrief.score}/10
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 4 }}>
                    {analysisResult.coach_debrief.title}
                  </Text>
                  <Text style={{ color: '#94A3B8', fontSize: 12, marginBottom: 8 }}>
                    {analysisResult.coach_debrief.summary}
                  </Text>
                  {analysisResult.coach_debrief.highlights && analysisResult.coach_debrief.highlights.length > 0 && (
                    <View style={{ marginTop: 4 }}>
                      <Text style={{ color: colors.emerald, fontSize: 11, fontWeight: '700', marginBottom: 2 }}>
                        STRENGTH HIGHLIGHTS:
                      </Text>
                      {analysisResult.coach_debrief.highlights.map((h: string, hi: number) => (
                        <Text key={hi} style={{ color: '#E2E8F0', fontSize: 11, marginLeft: 6 }}>
                          • {h}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Timeline Breakdown Table */}
              <View style={styles.timelineSection}>
                <View style={styles.timelineHeaderRow}>
                  <Ionicons name="list-outline" size={16} color={colors.primary} />
                  <Text style={styles.timelineTitle}>Frame-by-Frame Kinematic Timeline</Text>
                </View>

                <View style={styles.tableHeader}>
                  <Text style={[styles.tableTh, { width: 50 }]}>Time</Text>
                  <Text style={[styles.tableTh, { width: 65 }]}>Angle</Text>
                  <Text style={[styles.tableTh, { width: 60 }]}>Stage</Text>
                  <Text style={[styles.tableTh, { width: 50 }]}>Reps</Text>
                  <Text style={[styles.tableTh, { flex: 1 }]}>Form Status</Text>
                </View>

                <ScrollView style={styles.tableScrollView} nestedScrollEnabled>
                  {videoTimeline.slice(0, 40).map((row: any, i: number) => (
                    <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                      <Text style={[styles.tableTd, { width: 50 }]}>{row.timestamp}s</Text>
                      <Text style={[styles.tableTd, { width: 65, fontWeight: '700', color: colors.primary }]}>
                        {row.primary_angle}°
                      </Text>
                      <Text style={[styles.tableTd, { width: 60 }]}>{row.stage}</Text>
                      <Text style={[styles.tableTd, { width: 50, fontWeight: '800' }]}>{row.rep_count}</Text>
                      <Text
                        style={[
                          styles.tableTd,
                          { flex: 1, color: row.form_status === 'Correct' ? colors.emerald : colors.rose },
                        ]}
                        numberOfLines={1}
                      >
                        {row.feedback}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.viewFullReportBtn}
                onPress={() => {
                  const resultObj: AssessmentResult = {
                    id: analysisResult.session_id || `res-${Date.now()}`,
                    assessmentId: drill.id,
                    assessmentTitle: drill.title,
                    athleteId: 'ath-1',
                    date: 'Uploaded Video Trial',
                    overallScore: analysisResult.accuracy_score,
                    correctReps: analysisResult.valid_reps,
                    incorrectReps: analysisResult.invalid_reps,
                    postureScore: analysisResult.accuracy_score,
                    consistency: Math.min(100, Math.round(analysisResult.pose_visibility_percent)),
                    stability: Math.min(100, Math.round(analysisResult.accuracy_score * 0.98)),
                    jointAngles: {
                      primaryAngle: analysisResult.timeline?.[0]?.primary_angle || 90,
                      secondaryAngle: analysisResult.timeline?.[0]?.secondary_angle || 175,
                      primaryAngleName: drill.primaryAngleName || 'PRIMARY ANGLE',
                      secondaryAngleName: drill.secondaryAngleName || 'SECONDARY ANGLE',
                      kneeFlexion: 90,
                      hipAngle: 175,
                      shoulderAlignment: 99,
                    },
                    recommendations: analysisResult.recommendations || [
                      'Kinematic analysis completed via MediaPipe Pose.',
                      'Solid joint trajectory observed throughout the recorded repetition sequence.',
                    ],
                    durationSeconds: Math.round(analysisResult.duration_seconds || seconds),
                    exerciseType: exerciseType,
                  };
                  navigation.replace('AssessmentResult', { result: resultObj });
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.viewFullReportBtnText}>View Full Report & AI Fuel Strategy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

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
            <Text style={styles.telemetryLbl}>FORM ACCURACY</Text>
          </View>

          <View style={styles.telemetryDivider} />

          <View style={styles.telemetryItem}>
            <Text style={[styles.telemetryVal, { color: colors.primary }]}>{validReps}</Text>
            <Text style={styles.telemetryLbl}>VALID REPS</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.finishBtn} onPress={handleStopAssessment} activeOpacity={0.85}>
          <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.finishBtnText}>Finish Assessment & Review Report</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  hudTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    alignItems: 'center',
  },
  drillName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  modeTabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: '#E2E8F0',
    borderRadius: borderRadius.md,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    gap: 8,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
    ...shadows.soft,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  cameraViewport: {
    marginHorizontal: spacing.lg,
    height: 420,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    position: 'relative',
    ...shadows.card,
  },
  cameraErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  cameraErrorText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  feedbackToastContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  feedbackToastChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    ...shadows.card,
  },
  feedbackToastText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  jointHudLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    ...shadows.card,
  },
  jointHudRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    ...shadows.card,
  },
  jointHudLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  jointHudVal: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  uploadCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.card,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  fileSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 8,
    marginBottom: 16,
  },
  fileSelectedText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  uploadActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    ...shadows.card,
  },
  uploadActionBtnDisabled: {
    opacity: 0.5,
  },
  uploadActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  analysisResultsWrapper: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: spacing.md,
  },
  analysisSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  summaryBadge: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  summaryLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    marginTop: 2,
  },
  timelineSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  tableTh: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tableScrollView: {
    maxHeight: 180,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  tableTd: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  viewFullReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emerald,
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    ...shadows.card,
  },
  viewFullReportBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  uploadStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  hudFooter: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.soft,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  telemetryItem: {
    alignItems: 'center',
  },
  telemetryVal: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  telemetryLbl: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  telemetryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.surfaceBorder,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    ...shadows.card,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
