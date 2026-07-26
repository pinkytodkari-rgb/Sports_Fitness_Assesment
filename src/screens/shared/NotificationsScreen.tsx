import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { NotificationCard } from '../../components/cards/NotificationCard';
import { useApp } from '../../context/AppContext';

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { notifications, markNotificationRead, clearNotifications } = useApp();

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Notifications" showBack />

      <View style={styles.headerBar}>
        <Text style={styles.countText}>{notifications.length} Total Alerts</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearNotifications} activeOpacity={0.7}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => markNotificationRead(item.id)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  countText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  clearText: {
    color: colors.rose,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
  },
});
