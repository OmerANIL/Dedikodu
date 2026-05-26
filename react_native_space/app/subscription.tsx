import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useThemeContext } from '../src/contexts/ThemeContext';
import apiClient from '../src/services/apiClient';

const PLANS = [
  {
    key: 'basic' as const,
    label: 'Temel',
    color: '#6B7280',
    features: ['Dedikoduları okuma', 'Tepki verme'],
    icon: 'person' as const,
  },
  {
    key: 'gold' as const,
    label: 'Gold',
    color: '#F59E0B',
    features: ['Dedikoduları okuma', 'Tepki verme', 'Dedikodu yazma'],
    icon: 'star' as const,
  },
  {
    key: 'platinum' as const,
    label: 'Platin',
    color: '#8B5CF6',
    features: ['Dedikoduları okuma', 'Tepki verme', 'Dedikodu yazma', 'Moderasyon yetkisi'],
    icon: 'diamond' as const,
  },
];

export default function SubscriptionScreen() {
  const { user, refreshUser } = useAuth();
  const { colors } = useThemeContext();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const currentLevel = user?.subscriptionLevel ?? 'basic';

  const handleChange = async (level: string) => {
    if (level === currentLevel) return;
    setLoading(level);
    try {
      // Self subscription change - use admin endpoint if superuser, otherwise show info
      if (user?.isSuperuser) {
        await apiClient.patch(`/api/admin/users/${user?.id}`, { subscriptionLevel: level });
      } else {
        // No self-subscription endpoint - show notice
        Alert.alert('Bilgi', 'Abonelik değişikliği şu an için yönetici tarafından yapılmaktadır. Lütfen yönetici ile iletişime geçin.');
        setLoading(null);
        return;
      }
      await refreshUser();
      Alert.alert('Başarılı', 'Aboneliğiniz güncellendi!');
      router.back();
    } catch {
      Alert.alert('Hata', 'Abonelik güncellenemedi.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Abonelik</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.note, { color: colors.textSecondary }]}>Tüm abonelikler şu an ücretsizdir.</Text>

        {PLANS.map(plan => {
          const isCurrent = plan.key === currentLevel;
          return (
            <View key={plan.key} style={[styles.planCard, { backgroundColor: colors.card, borderColor: isCurrent ? plan.color : colors.border, borderWidth: isCurrent ? 2 : 1 }]}>
              <View style={styles.planHeader}>
                <Ionicons name={plan.icon} size={28} color={plan.color} />
                <Text style={[styles.planLabel, { color: plan.color }]}>{plan.label}</Text>
                {isCurrent && (
                  <View style={[styles.currentBadge, { backgroundColor: plan.color }]}>
                    <Text style={styles.currentBadgeText}>Mevcut</Text>
                  </View>
                )}
              </View>
              {(plan.features ?? []).map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark" size={18} color="#10B981" />
                  <Text style={[styles.featureText, { color: colors.text }]}>{f}</Text>
                </View>
              ))}
              {!isCurrent && (
                <Pressable
                  style={[styles.changeBtn, { backgroundColor: plan.color }]}
                  onPress={() => handleChange(plan.key)}
                  disabled={loading !== null}
                >
                  <Text style={styles.changeBtnText}>
                    {loading === plan.key ? 'Güncelleniyor...' : 'Geç'}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: 16, paddingBottom: 32 },
  note: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  planCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  planLabel: { fontSize: 22, fontWeight: 'bold', flex: 1 },
  currentBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  currentBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  featureText: { fontSize: 15 },
  changeBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  changeBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
