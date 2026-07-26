import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { Toast } from '../../components/common/Toast';
import initialAthletes from '../../data/athletes.json';

export const ManageUsersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [users, setUsers] = useState(
    initialAthletes.map((a) => ({ ...a, role: 'Athlete', status: 'Active' }))
  );
  const [search, setSearch] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.sport.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
      )
    );
    setToastMessage('User status updated successfully.');
    setToastVisible(true);
  };

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Manage Platform Users" showBack />

      <View style={styles.searchPad}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search users by name..." />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />

            <View style={styles.userInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.role} • {item.sport}</Text>
            </View>

            <TouchableOpacity
              onPress={() => toggleUserStatus(item.id)}
              style={[
                styles.statusBtn,
                item.status === 'Active' ? styles.activeBtn : styles.suspendedBtn,
              ]}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  item.status === 'Active' ? { color: '#15803D' } : { color: '#B91C1C' },
                ]}
              >
                {item.status}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Toast visible={toastVisible} message={toastMessage} onHide={() => setToastVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchPad: {
    padding: spacing.lg,
    paddingBottom: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.card, // 18px
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...shadows.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    color: colors.primary, // #0B1F3A
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  activeBtn: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  suspendedBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
