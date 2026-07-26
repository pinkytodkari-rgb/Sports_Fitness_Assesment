import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { TopHeader } from '../../components/common/TopHeader';
import { ProfileCard } from '../../components/cards/ProfileCard';
import { GradientButton } from '../../components/common/GradientButton';
import { CustomModal } from '../../components/common/CustomModal';
import { Toast } from '../../components/common/Toast';
import { useApp } from '../../context/AppContext';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUserProfile } = useApp();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [sportInput, setSportInput] = useState(user.sport || 'Basketball');
  const [posInput, setPosInput] = useState(user.position || 'Point Guard');
  const [bioInput, setBioInput] = useState(user.bio || '');

  const [toastVisible, setToastVisible] = useState(false);

  const handleSaveProfile = () => {
    updateUserProfile({
      name: nameInput,
      sport: sportInput,
      position: posInput,
      bio: bioInput,
    });
    setEditModalVisible(false);
    setToastVisible(true);
  };

  return (
    <View style={styles.container}>
      <TopHeader navigation={navigation} title="Athlete Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Profile Card */}
        <ProfileCard user={user} onEditPress={() => setEditModalVisible(true)} />

        {/* Quick Menu Actions */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AssessmentHistory')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.menuText}>Assessment History</Text>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Reports')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.accent} />
            <Text style={styles.menuText}>My Scout Reports & PDFs</Text>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Achievements')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <Ionicons name="trophy-outline" size={20} color={colors.amber} />
            <Text style={styles.menuText}>Badges & Trophies</Text>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.menuRow}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.menuText}>Account Settings & Security</Text>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Reusable Modal */}
      <CustomModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Edit Athlete Profile"
      >
        <View style={styles.modalForm}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.modalInput}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Full Name"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.inputLabel}>Sport & Position</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              style={[styles.modalInput, { flex: 1 }]}
              value={sportInput}
              onChangeText={setSportInput}
              placeholder="Sport"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.modalInput, { flex: 1 }]}
              value={posInput}
              onChangeText={setPosInput}
              placeholder="Position"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
            value={bioInput}
            onChangeText={setBioInput}
            multiline
            placeholder="Tell scouts about your athletic career..."
            placeholderTextColor={colors.textMuted}
          />

          <GradientButton title="Save Profile Changes" onPress={handleSaveProfile} style={{ marginTop: spacing.md }} />
        </View>
      </CustomModal>

      <Toast visible={toastVisible} message="Profile updated successfully!" onHide={() => setToastVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.card, // 18px
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    ...shadows.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: spacing.md,
  },
  menuText: {
    flex: 1,
    color: colors.primary, // #0B1F3A
    fontSize: 15,
    fontWeight: '600',
  },
  modalForm: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.input, // 12px
    height: 52,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
});
