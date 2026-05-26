import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, Alert, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import apiClient from '../../src/services/apiClient';
import GradientButton from '../../src/components/GradientButton';
import LocationPicker from '../../src/components/LocationPicker';
import type { SelectedLocation } from '../../src/types';

export default function WriteScreen() {
  const { user, refreshUser } = useAuth();
  const { colors } = useThemeContext();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const subLevel = user?.subscriptionLevel ?? 'basic';
  const isEligible = subLevel === 'gold' || subLevel === 'platinum';
  const isVerified = user?.emailVerified === true;

  const handleSendVerification = async () => {
    try {
      const res = await apiClient.post('/api/auth/send-verification');
      const code = res?.data?.verificationCode;
      Alert.alert('Doğrulama Kodu', code ? `Kodunuz: ${code}` : 'Doğrulama kodu gönderildi.');
    } catch {
      Alert.alert('Hata', 'Kod gönderilemedi.');
    }
  };

  const handleSubmit = async () => {
    if (!location?.neighborhoodId || !content?.trim()) return;
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/api/gossips', {
        neighborhoodId: location.neighborhoodId,
        content: content.trim(),
      });
      setSuccess(true);
      setContent('');
      setLocation(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gönderilemedi.';
      setError(typeof msg === 'string' ? msg : 'Gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  if (!isEligible) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.gate}>
          <Ionicons name="lock-closed" size={64} color={colors.textSecondary} />
          <Text style={[styles.gateTitle, { color: colors.text }]}>Yetki Gerekli</Text>
          <Text style={[styles.gateText, { color: colors.textSecondary }]}>
            Dedikodu yazmak için Gold veya Platinum aboneliğe geçin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isVerified) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.gate}>
          <Ionicons name="mail-unread" size={64} color={colors.primary} />
          <Text style={[styles.gateTitle, { color: colors.text }]}>E-posta Doğrulama Gerekli</Text>
          <Text style={[styles.gateText, { color: colors.textSecondary }]}>
            Dedikodu yazmak için e-postanızı doğrulayın.
          </Text>
          <GradientButton title="Doğrulama Kodu Gönder" onPress={handleSendVerification} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const charCount = content?.length ?? 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>Yeni Dedikodu</Text>

        {success && (
          <View style={[styles.successBox, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.successText}>Dedikoduunuz moderasyon için gönderildi!</Text>
          </View>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={[styles.label, { color: colors.textSecondary }]}>Konum Seçin</Text>
        <LocationPicker selected={location} onSelect={setLocation} />

        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}>Dedikodu</Text>
        <View style={[styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textArea, { color: colors.text }]}
            placeholder="Dedikoduyu yazın..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={300}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: charCount >= 280 ? '#EF4444' : colors.textSecondary }]}>
            {charCount}/300
          </Text>
        </View>

        <GradientButton
          title="Gönder"
          onPress={handleSubmit}
          loading={loading}
          disabled={!location?.neighborhoodId || !content?.trim()}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  textAreaContainer: { borderRadius: 12, borderWidth: 1, padding: 12, minHeight: 150 },
  textArea: { fontSize: 16, minHeight: 120 },
  charCount: { textAlign: 'right', fontSize: 13, marginTop: 4 },
  gate: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  gateTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  gateText: { fontSize: 15, textAlign: 'center', marginTop: 8 },
  successBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 12, gap: 8 },
  successText: { color: '#10B981', fontSize: 14, fontWeight: '600', flex: 1 },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
});
