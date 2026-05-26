import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import apiClient from '../../src/services/apiClient';
import type { PendingGossip } from '../../src/types';

export default function ModerationScreen() {
  const { user } = useAuth();
  const { colors } = useThemeContext();
  const [gossips, setGossips] = useState<PendingGossip[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isPlatinum = user?.subscriptionLevel === 'platinum';

  const fetchPending = useCallback(async () => {
    if (!isPlatinum) return;
    setRefreshing(true);
    try {
      const res = await apiClient.get('/api/gossips/pending', { params: { page: 1, limit: 50 } });
      setGossips(res?.data?.items ?? []);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [isPlatinum]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPending();
    }, [fetchPending])
  );

  const handleModerate = (id: string, action: 'approve' | 'reject') => {
    const msg = action === 'approve' ? 'Bu dedikoduyu onaylamak istediğinize emin misiniz?' : 'Bu dedikoduyu reddetmek istediğinize emin misiniz?';
    Alert.alert('Onay', msg, [
      { text: 'İptal', style: 'cancel' },
      {
        text: action === 'approve' ? 'Onayla' : 'Reddet',
        style: action === 'reject' ? 'destructive' : 'default',
        onPress: async () => {
          try {
            await apiClient.patch(`/api/gossips/${id}/moderate`, { action });
            setGossips(prev => (prev ?? []).filter(g => g?.id !== id));
          } catch {
            Alert.alert('Hata', 'İşlem başarısız.');
          }
        },
      },
    ]);
  };

  if (!isPlatinum) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.gate}>
          <Ionicons name="shield" size={64} color={colors.textSecondary} />
          <Text style={[styles.gateTitle, { color: colors.text }]}>Erişim Kısıtlı</Text>
          <Text style={[styles.gateText, { color: colors.textSecondary }]}>
            Bu alan sadece Platinum üyeler içindir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: PendingGossip }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.cardContent, { color: colors.text }]}>{item?.content ?? ''}</Text>
      <Text style={[styles.cardLocation, { color: colors.textSecondary }]}>
        {item?.neighborhoodName ?? ''}, {item?.districtName ?? ''}, {item?.provinceName ?? ''}
      </Text>
      <View style={styles.cardMeta}>
        <Text style={[styles.cardAuthor, { color: colors.primary }]}>@{item?.authorNickname ?? ''}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: '#10B98120' }]}
          onPress={() => handleModerate(item?.id ?? '', 'approve')}
        >
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={[styles.actionText, { color: '#10B981' }]}>Onayla</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: '#EF444420' }]}
          onPress={() => handleModerate(item?.id ?? '', 'reject')}
        >
          <Ionicons name="close-circle" size={20} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Reddet</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Moderasyon</Text>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{gossips?.length ?? 0}</Text>
        </View>
      </View>
      <FlatList
        data={gossips ?? []}
        renderItem={renderItem}
        keyExtractor={item => item?.id ?? Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPending} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 48 }}>🎉</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Bekleyen dedikodu yok</Text>
            </View>
          ) : <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  headerTitle: { fontSize: 26, fontWeight: 'bold' },
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardContent: { fontSize: 16, lineHeight: 22, marginBottom: 8 },
  cardLocation: { fontSize: 13, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardAuthor: { fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, gap: 6 },
  actionText: { fontSize: 14, fontWeight: '600' },
  gate: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  gateTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  gateText: { fontSize: 15, textAlign: 'center', marginTop: 8 },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, marginTop: 12 },
});
