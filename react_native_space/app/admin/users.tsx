import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import apiClient from '../../src/services/apiClient';
import { getSubscriptionBadge } from '../../src/utils/subscription';

interface AdminUser {
  id: string;
  nickname: string;
  email: string;
  subscriptionLevel: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function UserManagementScreen() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/admin/users', { params: { search: search?.trim() || undefined, page: 1, limit: 100 } });
      setUsers(res?.data?.items ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openUserModal = (u: AdminUser) => {
    setSelectedUser(u);
    setSelectedLevel(u?.subscriptionLevel ?? 'basic');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedUser?.id || !selectedLevel) return;
    setSaving(true);
    try {
      await apiClient.patch(`/api/admin/users/${selectedUser.id}`, { subscriptionLevel: selectedLevel });
      Alert.alert('Başarılı', 'Abonelik güncellendi.');
      setModalVisible(false);
      fetchUsers();
    } catch {
      Alert.alert('Hata', 'Güncelleme başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: AdminUser }) => {
    const badge = getSubscriptionBadge(item?.subscriptionLevel);
    return (
      <Pressable
        style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => openUserModal(item)}
      >
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>@{item?.nickname ?? ''}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item?.email ?? ''}</Text>
        </View>
        <View style={styles.userBadges}>
          <View style={[styles.subBadge, { backgroundColor: badge.bgColor }]}>
            <Text style={[styles.subBadgeText, { color: badge.textColor }]}>{badge.label}</Text>
          </View>
          {item?.emailVerified && <Ionicons name="checkmark-circle" size={16} color="#10B981" />}
        </View>
      </Pressable>
    );
  };

  const levels = ['basic', 'gold', 'platinum'] as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kullanıcı Yönetimi</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Kullanıcı ara..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users ?? []}
          renderItem={renderItem}
          keyExtractor={item => item?.id ?? Math.random().toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Kullanıcı bulunamadı</Text>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              @{selectedUser?.nickname ?? ''}
            </Text>
            <Text style={[styles.modalEmail, { color: colors.textSecondary }]}>{selectedUser?.email ?? ''}</Text>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Abonelik Seviyesi</Text>
            <View style={styles.levelRow}>
              {levels.map(lvl => {
                const b = getSubscriptionBadge(lvl);
                const isSelected = selectedLevel === lvl;
                return (
                  <Pressable
                    key={lvl}
                    style={[styles.levelBtn, { borderColor: isSelected ? b.textColor : colors.border, backgroundColor: isSelected ? b.bgColor : 'transparent' }]}
                    onPress={() => setSelectedLevel(lvl)}
                  >
                    <Text style={{ color: isSelected ? b.textColor : colors.textSecondary, fontWeight: '600' }}>{b.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.border }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>İptal</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  userCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600' },
  userEmail: { fontSize: 13, marginTop: 2 },
  userBadges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  subBadgeText: { fontSize: 12, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 },
  modalContent: { borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalEmail: { fontSize: 14, marginTop: 4, marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
