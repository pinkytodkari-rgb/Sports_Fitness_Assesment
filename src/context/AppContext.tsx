import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Athlete, NotificationItem, AssessmentResult } from '../types';
import initialProfile from '../data/profile.json';
import initialNotifications from '../data/notifications.json';
import initialAthletes from '../data/athletes.json';
import { apiService } from '../services/apiService';

interface AppContextType {
  user: User;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  updateUserProfile: (updated: Partial<User>) => void;
  shortlistedIds: string[];
  toggleShortlist: (athleteId: string) => void;
  selectedCompareAthletes: Athlete[];
  toggleCompareAthlete: (athlete: Athlete) => void;
  clearCompareAthletes: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  assessmentHistory: AssessmentResult[];
  addAssessmentResult: (result: AssessmentResult) => void;
  themeMode: 'dark' | 'light';
  toggleThemeMode: () => void;
  allAthletes: Athlete[];
  backendConnected: boolean;
}

const defaultUser: User = initialProfile as User;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [userRole, setUserRoleState] = useState<UserRole>('athlete');
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(['ath-1', 'ath-3']);
  const [selectedCompareAthletes, setSelectedCompareAthletes] = useState<Athlete[]>([
    initialAthletes[0] as Athlete,
    initialAthletes[1] as Athlete,
  ]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications as NotificationItem[]
  );
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentResult[]>([
    {
      id: 'res-999',
      assessmentId: 'drill-pushups',
      assessmentTitle: 'Push-ups Form & Repetition Lab',
      athleteId: 'ath-1',
      date: 'Today, 2:45 PM',
      overallScore: 97,
      correctReps: 28,
      incorrectReps: 1,
      postureScore: 98,
      consistency: 96,
      stability: 97,
      jointAngles: {
        kneeFlexion: 86,
        hipAngle: 178,
        shoulderAlignment: 99,
        primaryAngle: 86,
        secondaryAngle: 178,
        primaryAngleName: 'ELBOW FLEXION',
        secondaryAngleName: 'SPINE ALIGN',
      },
      recommendations: [
        'Optimal 90° elbow depth achieved on 98% of repetitions.',
        'Neutral spine alignment maintained with zero lumbar sagging.',
        'Symmetric triceps force distribution across both arms.'
      ],
      durationSeconds: 60,
      exerciseType: 'pushups',
    },
  ]);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('light');
  const [allAthletes, setAllAthletes] = useState<Athlete[]>(initialAthletes as Athlete[]);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);

  useEffect(() => {
    // Check backend connectivity and load live sessions
    apiService.checkHealth().then((online) => {
      setBackendConnected(online);
      if (online) {
        apiService.getAthleteHistory(user.id || 'ath-1').then((sessions) => {
          if (sessions && sessions.length > 0) {
            const mapped: AssessmentResult[] = sessions.map((s) => ({
              id: s.id,
              assessmentId: `drill-${s.exercise.toLowerCase().replace(/\s+/g, '-')}`,
              assessmentTitle: s.exercise,
              athleteId: s.athlete_id,
              date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recent',
              overallScore: Math.floor(92 + (s.estimated_reps % 8)),
              correctReps: Math.floor(s.estimated_reps || 20),
              incorrectReps: 1,
              postureScore: s.posture_label === 'Correct' ? 98 : 88,
              consistency: 95,
              stability: 96,
              jointAngles: {
                kneeFlexion: 90,
                hipAngle: 88,
                shoulderAlignment: 99,
                primaryAngle: 90,
                secondaryAngle: 88,
                primaryAngleName: 'JOINT ANGLE',
                secondaryAngleName: 'POSTURE ALIGN',
              },
              recommendations: [s.posture_reason || 'Verified biomechanical trajectory.'],
              durationSeconds: Math.floor(s.processing_seconds || 60),
            }));
            setAssessmentHistory((prev) => [...mapped, ...prev]);
          }
        });
      }
    });
  }, [user.id]);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    setUser((prev) => ({ ...prev, role }));
  };

  const updateUserProfile = (updated: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const toggleShortlist = (athleteId: string) => {
    setShortlistedIds((prev) =>
      prev.includes(athleteId) ? prev.filter((id) => id !== athleteId) : [...prev, athleteId]
    );
    setAllAthletes((prev) =>
      prev.map((ath) =>
        ath.id === athleteId
          ? { ...ath, status: ath.status === 'Shortlisted' ? 'Available' : 'Shortlisted' }
          : ath
      )
    );
  };

  const toggleCompareAthlete = (athlete: Athlete) => {
    setSelectedCompareAthletes((prev) => {
      const exists = prev.some((a) => a.id === athlete.id);
      if (exists) {
        return prev.filter((a) => a.id !== athlete.id);
      } else {
        if (prev.length >= 2) {
          return [prev[1], athlete];
        }
        return [...prev, athlete];
      }
    });
  };

  const clearCompareAthletes = () => {
    setSelectedCompareAthletes([]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addAssessmentResult = (result: AssessmentResult) => {
    setAssessmentHistory((prev) => [result, ...prev]);
    // Persist to REST Backend
    apiService.submitAssessment(result).catch((e) => console.warn('Sync failed:', e));
  };

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        userRole,
        setUserRole,
        updateUserProfile,
        shortlistedIds,
        toggleShortlist,
        selectedCompareAthletes,
        toggleCompareAthlete,
        clearCompareAthletes,
        notifications,
        markNotificationRead,
        clearNotifications,
        assessmentHistory,
        addAssessmentResult,
        themeMode,
        toggleThemeMode,
        allAthletes,
        backendConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
