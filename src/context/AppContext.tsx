import React, { createContext, useContext, useState } from 'react';
import { User, UserRole, Athlete, NotificationItem, AssessmentResult } from '../types';
import initialProfile from '../data/profile.json';
import initialNotifications from '../data/notifications.json';
import initialAthletes from '../data/athletes.json';

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
      assessmentId: 'drill-1',
      assessmentTitle: 'Vertical Jump Mechanics',
      athleteId: 'ath-1',
      date: 'Today, 2:45 PM',
      overallScore: 96,
      correctReps: 12,
      incorrectReps: 1,
      postureScore: 97,
      consistency: 94,
      stability: 96,
      jointAngles: {
        kneeFlexion: 112,
        hipAngle: 88,
        shoulderAlignment: 99,
      },
      recommendations: [
        'Excellent vertical drive extension during takeoff.',
        'Slight knee valgus noted on rep 7 landing - focus on glute medius activation.',
        'Explosive velocity is in top 1% percentile.'
      ],
      durationSeconds: 60,
    },
  ]);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [allAthletes, setAllAthletes] = useState<Athlete[]>(initialAthletes as Athlete[]);

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
