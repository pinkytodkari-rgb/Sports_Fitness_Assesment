/**
 * Backend API Client for SANDOW Sports Intelligence Platform
 * Connects the React Native Web & Mobile app directly to the FastAPI REST backend (http://localhost:8000).
 */
import { AssessmentResult, DrillAssessment } from '../types';
import localAssessments from '../data/assessments.json';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  private isOnline = false;

  constructor() {
    this.checkHealth();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      this.isOnline = res.ok;
      return res.ok;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  async getExercises(): Promise<DrillAssessment[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/exercises`);
      if (res.ok) {
        const data = await res.json();
        return data as DrillAssessment[];
      }
    } catch (e) {
      console.warn('Backend offline, using bundled drill models:', e);
    }
    return localAssessments as DrillAssessment[];
  }

  async submitAssessment(result: AssessmentResult): Promise<{ session_id: string } | null> {
    try {
      const payload = {
        athlete_id: result.athleteId || 'ath-1',
        exercise: result.assessmentTitle,
        estimated_reps: result.correctReps,
        overall_score: result.overallScore,
        posture_label: result.postureScore >= 90 ? 'Correct' : 'Needs Review',
        posture_reason: result.recommendations[0] || 'Form verified via vision heuristics',
        processing_seconds: result.durationSeconds,
        model_used: 'Sandow-Biomechanical-Heuristic-v2.4',
        joint_angles: result.jointAngles,
        recommendations: result.recommendations,
        observations: [
          { metric: 'Posture Score', value: `${result.postureScore}%` },
          { metric: 'Kinetic Stability', value: `${result.stability}%` },
          { metric: 'Consistency', value: `${result.consistency}%` },
        ],
        timeline: [],
      };

      const res = await fetch(`${API_BASE_URL}/assessments/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not post assessment to backend:', e);
    }
    return null;
  }

  async getAthleteHistory(athleteId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/history/${athleteId}`);
      if (res.ok) {
        const data = await res.json();
        return data.sessions || [];
      }
    } catch (e) {
      console.warn('Could not fetch athlete history from backend:', e);
    }
    return [];
  }

  async getCoachRoster(coachId = 'coach-1'): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/coach/${coachId}/roster`);
      if (res.ok) {
        const data = await res.json();
        return data.athletes || [];
      }
    } catch (e) {
      console.warn('Could not fetch coach roster from backend:', e);
    }
    return [];
  }

  async addCoachNote(coachId: string, athleteId: string, noteText: string, sessionId?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/coach/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_id: coachId,
          athlete_id: athleteId,
          note_text: noteText,
          session_id: sessionId,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/models`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch model registry:', e);
    }
    return [];
  }

  /**
   * Send a single camera frame to MediaPipe Pose engine on backend.
   * Returns detected landmarks, angles, rep counts, and form feedback.
   */
  async analyzeFrame(
    imageBase64: string,
    exercise: string,
    sessionId = 'session_live',
    reset = false
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/analyze-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          exercise,
          session_id: sessionId,
          reset,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('analyzeFrame failed:', e);
    }
    return null;
  }

  /**
   * Upload video file (Blob/File on web, or Form data on mobile) to backend for full kinematic analysis.
   */
  async analyzeVideo(
    file: File | Blob | any,
    exercise: string,
    athleteId = 'ath-1'
  ): Promise<any> {
    try {
      const formData = new FormData();
      if (file instanceof Blob || (typeof File !== 'undefined' && file instanceof File)) {
        formData.append('file', file, (file as any).name || 'recorded_drill.mp4');
      } else {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'recorded_drill.mp4',
          type: file.type || 'video/mp4',
        } as any);
      }
      formData.append('exercise', exercise);
      formData.append('athlete_id', athleteId);

      const res = await fetch(`${API_BASE_URL}/assessments/analyze-video`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        return await res.json();
      } else {
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }
    } catch (e) {
      console.error('analyzeVideo error:', e);
      throw e;
    }
  }

  /**
   * Fetch tailored sports nutrition recommendations based on exercise & fitness goals.
   */
  async getNutritionRecommendations(exercise = 'Push-ups', goal = 'Hypertrophy'): Promise<any> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/nutrition/recommendations?exercise=${encodeURIComponent(exercise)}&goal=${encodeURIComponent(goal)}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch nutrition recommendations:', e);
    }
    return null;
  }

  /**
   * OpenGym-style AI Workout Planner: generate routines & schedule based on athletic intake.
   */
  async getCoachIntakePlan(intake: {
    goal: string;
    experience: string;
    days_per_week: number;
    equipment?: string[];
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/coach/intake-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intake),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not generate coach plan:', e);
    }
    return null;
  }

  /**
   * OpenGym-style Debrief: evaluate session reps, form accuracy, and get coaching insights.
   */
  async getCoachDebrief(debrief: {
    exercise: string;
    total_reps: number;
    accuracy_score: number;
    duration_seconds: number;
    faults_detected?: string[];
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/coach/debrief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debrief),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not generate debrief:', e);
    }
    return null;
  }
}

export const apiService = new ApiService();
