import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LandingScreen } from '../screens/auth/LandingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';

import { AthleteTabNavigator } from './AthleteTabNavigator';
import { LiveAssessmentScreen } from '../screens/athlete/LiveAssessmentScreen';
import { AssessmentResultScreen } from '../screens/athlete/AssessmentResultScreen';
import { AssessmentHistoryScreen } from '../screens/athlete/AssessmentHistoryScreen';
import { PerformanceAnalyticsScreen } from '../screens/athlete/PerformanceAnalyticsScreen';
import { AIFeedbackScreen } from '../screens/athlete/AIFeedbackScreen';
import { ReportsScreen } from '../screens/athlete/ReportsScreen';
import { AchievementsScreen } from '../screens/athlete/AchievementsScreen';
import { ProfileScreen } from '../screens/athlete/ProfileScreen';

import { CoachDashboardScreen } from '../screens/coach/CoachDashboardScreen';
import { AthleteDiscoveryScreen } from '../screens/coach/AthleteDiscoveryScreen';
import { AthleteDetailsScreen } from '../screens/coach/AthleteDetailsScreen';
import { CompareAthletesScreen } from '../screens/coach/CompareAthletesScreen';
import { ShortlistScreen } from '../screens/coach/ShortlistScreen';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ManageUsersScreen } from '../screens/admin/ManageUsersScreen';
import { AdminReportsScreen } from '../screens/admin/AdminReportsScreen';
import { AdminSettingsScreen } from '../screens/admin/AdminSettingsScreen';

import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { NotificationsScreen } from '../screens/shared/NotificationsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Auth Stack */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />

        {/* Core Tab Application */}
        <Stack.Screen name="MainTabs" component={AthleteTabNavigator} />

        {/* Athlete Flow Stack */}
        <Stack.Screen name="LiveAssessment" component={LiveAssessmentScreen} />
        <Stack.Screen name="AssessmentResult" component={AssessmentResultScreen} />
        <Stack.Screen name="AssessmentHistory" component={AssessmentHistoryScreen} />
        <Stack.Screen name="PerformanceAnalytics" component={PerformanceAnalyticsScreen} />
        <Stack.Screen name="AIFeedback" component={AIFeedbackScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* Coach Flow Stack */}
        <Stack.Screen name="CoachDashboard" component={CoachDashboardScreen} />
        <Stack.Screen name="AthleteDiscovery" component={AthleteDiscoveryScreen} />
        <Stack.Screen name="AthleteDetails" component={AthleteDetailsScreen} />
        <Stack.Screen name="CompareAthletes" component={CompareAthletesScreen} />
        <Stack.Screen name="Shortlist" component={ShortlistScreen} />

        {/* Admin Flow Stack */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
        <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
        <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />

        {/* Shared Stack */}
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
