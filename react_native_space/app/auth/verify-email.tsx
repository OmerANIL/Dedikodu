import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import GradientButton from '../../src/components/GradientButton';
import AppInput from '../../src/components/AppInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../src/services/apiClient';

export default function VerifyEmailScreen() {
  const { code: codeFromParams = '' } = useLocalSearchParams<{ code?: string; email?: string }>();
  const { refreshUser } = useAuth();
  const { colors } = useThemeContext();
  const router = useRouter();
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!inputCode?.trim()) { setError('Lütfen doğrulama kodunu girin.'); return; }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/api/auth/verify-email', { code: inputCode.trim() });
      setMessage('E-posta başarıyla doğrulandı!');
      await refreshUser();
      setTimeout(() => router.replace('/tabs/home'), 1500);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Doğrulama başarısız.';
      setError(typeof msg === 'string' ? msg : 'Doğrulama başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await apiClient.post('/api/auth/send-verification');
      const newCode = res?.data?.verificationCode;
      setMessage(newCode ? `Yeni doğrulama kodunuz: ${newCode}` : 'Doğrulama kodu gönderildi.');
    } catch {
      setError('Kod gönderilemedi.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>E-posta Doğrulama</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          E-posta adresinize bir doğrulama kodu gönderildi.
        </Text>

        {codeFromParams ? (
          <View style={[styles.codeBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>Doğrulama Kodunuz:</Text>
            <Text style={[styles.codeText, { color: colors.primary }]}>{codeFromParams}</Text>
          </View>
        ) : null}

        {message ? <Text style={styles.successText}>{message}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <AppInput
          label="Doğrulama Kodu"
          value={inputCode}
          onChangeText={setInputCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <GradientButton title="Doğrula" onPress={handleVerify} loading={loading} />

        <GradientButton
          title="Kodu Tekrar Gönder"
          onPress={handleResend}
          loading={resending}
          variant="outline"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 15, marginTop: 8, marginBottom: 24 },
  codeBox: { padding: 16, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  codeLabel: { fontSize: 14 },
  codeText: { fontSize: 32, fontWeight: 'bold', marginTop: 4, letterSpacing: 4 },
  successText: { color: '#10B981', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
});
