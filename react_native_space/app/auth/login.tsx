import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import GradientButton from '../../src/components/GradientButton';
import AppInput from '../../src/components/AppInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors, isDark } = useThemeContext();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email?.trim() || !password?.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      // AuthProvider state update triggers layout redirect
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Giriş başarısız. Lütfen tekrar deneyin.';
      setError(typeof msg === 'string' ? msg : 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoArea}>
            <Ionicons name="chatbubbles" size={64} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Dedikodu</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Mahallendeki dedikoduları keşfet</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <AppInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.textSecondary} />
              </Pressable>
            }
          />

          <GradientButton title="Giriş Yap" onPress={handleLogin} loading={loading} />

          <Pressable onPress={() => router.push('/auth/register')} style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Hesabın yok mu? <Text style={{ color: colors.primary, fontWeight: '600' }}>Kayıt Ol</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 32 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 36, fontWeight: 'bold', marginTop: 12 },
  subtitle: { fontSize: 15, marginTop: 4 },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  linkBtn: { alignItems: 'center', marginTop: 24 },
  linkText: { fontSize: 15 },
});
