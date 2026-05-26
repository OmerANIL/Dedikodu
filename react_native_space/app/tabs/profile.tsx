import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import apiClient from '../../src/services/apiClient';
import { getSubscriptionBadge } from '../../src/utils/subscription';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { colors, isDark, toggleTheme } = useThemeContext();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  const handleSendVerification = async () => {
    try {
      const res = await apiClient.post('/api/auth/send-verification');
      const code = res?.data?.verificationCode;
      Alert.alert('Doğrulama Kodu', code ? `Kodunuz: ${code}` : 'Doğrulama kodu gönderildi.');
    } catch {
      Alert.alert('Hata', 'Kod gönderilemedi.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Çıkış', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const badge = getSubscriptionBadge(user?.subscriptionLevel);
  const initials = (user?.nickname ?? 'U')?.[0]?.toUpperCase?.() ?? 'U';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.nickname, { color: colors.text }]}>@{user?.nickname ?? ''}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email ?? ''}</Text>
          <View style={[styles.badgeChip, { backgroundColor: badge.bgColor }]}>
            <Text style={[styles.badgeText, { color: badge.textColor }]}>{badge.label}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>E-posta Durumu</Text>
            {user?.emailVerified ? (
              <View style={styles.verifiedRow}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.verifiedText}>Doğrulanmış</Text>
              </View>
            ) : (
              <Pressable onPress={handleSendVerification} style={styles.verifyBtn}>
                <Text style={styles.verifyBtnText}>Doğrulama Gönder</Text>
              </Pressable>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Gönderilen Dedikodular</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{user?.gossipCount ?? 0}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Onaylanan Dedikodular</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{user?.approvedGossipCount ?? 0}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Koyu Tema</Text>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: colors.primary, false: '#ccc' }} />
          </View>
        </View>

        <Pressable
          style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/subscription')}
        >
          <Ionicons name="diamond" size={20} color={colors.primary} />
          <Text style={[styles.menuBtnText, { color: colors.text }]}>Abonelik Değiştir</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>

        {user?.isSuperuser && (
          <Pressable
            style={[styles.menuBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/admin')}
          >
            <Ionicons name="settings" size={20} color={colors.primary} />
            <Text style={[styles.menuBtnText, { color: colors.text }]}>Yönetici Paneli</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        )}

        <Pressable style={[styles.logoutBtn, { borderColor: '#EF4444' }]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  avatarSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  nickname: { fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  email: { fontSize: 14, marginTop: 2 },
  badgeChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 36 },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  verifyBtn: { backgroundColor: '#F9731620', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  verifyBtnText: { color: '#F97316', fontSize: 13, fontWeight: '600' },
  menuBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 12 },
  menuBtnText: { flex: 1, fontSize: 16, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1.5, padding: 14, marginTop: 8, gap: 8 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
