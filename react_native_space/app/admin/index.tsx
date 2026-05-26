import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import apiClient from '../../src/services/apiClient';

interface Stats {
  totalUsers: number;
  totalGossips: number;
  pendingGossips: number;
  approvedGossips: number;
  rejectedGossips: number;
  removedGossips: number;
}

export default function AdminDashboard() {
  const { colors } = useThemeContext();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const res = await apiClient.get('/api/admin/stats');
          setStats(res?.data ?? null);
        } catch {
          // ignore
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  const statCards: { label: string; value: number; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { label: 'Toplam Kullanıcı', value: stats?.totalUsers ?? 0, icon: 'people', color: '#3B82F6' },
    { label: 'Toplam Dedikodu', value: stats?.totalGossips ?? 0, icon: 'chatbubbles', color: '#F97316' },
    { label: 'Bekleyen', value: stats?.pendingGossips ?? 0, icon: 'time', color: '#F59E0B' },
    { label: 'Onaylanan', value: stats?.approvedGossips ?? 0, icon: 'checkmark-circle', color: '#10B981' },
    { label: 'Reddedilen', value: stats?.rejectedGossips ?? 0, icon: 'close-circle', color: '#EF4444' },
    { label: 'Kaldırılan', value: stats?.removedGossips ?? 0, icon: 'trash', color: '#6B7280' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Yönetici Paneli</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.grid}>
            {statCards.map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name={s.icon} size={28} color={s.color} />
                <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/admin/users')}
          >
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={[styles.menuBtnText, { color: colors.text }]}>Kullanıcıları Yönet</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  scroll: { padding: 16, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center', marginBottom: 0 },
  statValue: { fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  menuBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 20, gap: 12 },
  menuBtnText: { flex: 1, fontSize: 16, fontWeight: '500' },
});
