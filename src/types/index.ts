export type UserRole = 'athlete' | 'coach' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  sport?: string;
  position?: string;
  team?: string;
  bio?: string;
  age?: number;
  height?: string;
  weight?: string;
  verticalLeap?: string;
  sprintTime?: string;
}

export interface Athlete {
  id: string;
  name: string;
  avatar: string;
  sport: string;
  position: string;
  age: number;
  height: string;
  weight: string;
  overallScore: number;
  speed: number;
  power: number;
  agility: number;
  endurance: number;
  technique: number;
  videoUrl: string;
  location: string;
  status: 'Available' | 'Shortlisted' | 'Signed' | 'Scouted';
  verified: boolean;
  notes?: string;
}

export interface DrillAssessment {
  id: string;
  title: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Pro' | 'Elite';
  description: string;
  targetMetric: string;
  iconName: string;
  bannerColor: string[];
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  athleteId: string;
  date: string;
  overallScore: number;
  correctReps: number;
  incorrectReps: number;
  postureScore: number;
  consistency: number;
  stability: number;
  jointAngles: {
    kneeFlexion: number;
    hipAngle: number;
    shoulderAlignment: number;
  };
  recommendations: string[];
  durationSeconds: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'assessment' | 'scout' | 'achievement' | 'system';
  read: boolean;
}

export interface ReportItem {
  id: string;
  athleteId: string;
  athleteName: string;
  sport: string;
  overallScore: number;
  generatedDate: string;
  summary: string;
  status: 'Ready' | 'Processing';
}

export interface LeaderboardEntry {
  rank: number;
  athleteId: string;
  name: string;
  avatar: string;
  sport: string;
  score: number;
  change: 'up' | 'down' | 'same';
}
