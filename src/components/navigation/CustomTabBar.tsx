import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, shadows } from '../../theme';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIconName = (routeName: string, focused: boolean) => {
            switch (routeName) {
              case 'DashboardTab':
                return focused ? 'grid' : 'grid-outline';
              case 'AssessmentTab':
                return focused ? 'fitness' : 'fitness-outline';
              case 'AnalyticsTab':
                return focused ? 'stats-chart' : 'stats-chart-outline';
              case 'CoachTab':
                return focused ? 'people' : 'people-outline';
              case 'ProfileTab':
                return focused ? 'person' : 'person-outline';
              default:
                return 'square-outline';
            }
          };

          const iconName = getIconName(route.name, isFocused);
          const iconColor = isFocused ? '#FFFFFF' : '#94A3B8';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.85}
            >
              <View style={[styles.iconWrapper, isFocused && styles.activeIconWrapper]}>
                <Ionicons name={iconName as any} size={20} color={iconColor} />
              </View>

              <Text style={[styles.label, { color: isFocused ? colors.primary : '#94A3B8' }]}>
                {typeof label === 'string' ? label : route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 500,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.floating,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconWrapper: {
    backgroundColor: colors.primary, // #0B1F3A
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
