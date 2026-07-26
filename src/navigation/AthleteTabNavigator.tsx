import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AthleteDashboardScreen } from '../screens/athlete/AthleteDashboardScreen';
import { AssessmentCenterScreen } from '../screens/athlete/AssessmentCenterScreen';
import { PerformanceAnalyticsScreen } from '../screens/athlete/PerformanceAnalyticsScreen';
import { CoachDashboardScreen } from '../screens/coach/CoachDashboardScreen';
import { ProfileScreen } from '../screens/athlete/ProfileScreen';
import { CustomTabBar } from '../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator();

export const AthleteTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="DashboardTab" component={AthleteDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="AssessmentTab" component={AssessmentCenterScreen} options={{ title: 'Assessment' }} />
      <Tab.Screen name="AnalyticsTab" component={PerformanceAnalyticsScreen} options={{ title: 'Analytics' }} />
      <Tab.Screen name="CoachTab" component={CoachDashboardScreen} options={{ title: 'Coach' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
