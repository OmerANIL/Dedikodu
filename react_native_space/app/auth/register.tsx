import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import GradientButton from '../../src/components/GradientButton';
import AppInput from '../../src/components/AppInput';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const { signup } = useAuth();
  const { colors } = useThemeContext();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string | null => {
    if (!nickname?.trim() || !fullName?.trim() || !email?.trim() || !phone?.trim() || !password || !passwordConfirm) {
      return 'Lütfen tüm alanları doldurun.';
    }
    if ((nickname?.trim()?.length ?? 0) < 3) return 'Kullanıcı adı en az 3 karakter olmalıdır.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() ?? '')) return 'Geçerli bir e-posta adresi girin.';
    if ((password?.length ?? 0) < 6) return 'Şifre en az 6 karakter olmalıdır.';
    if (password !== passwordConfirm) return 'Şifreler eşleşmiyor.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const result = await signup({
        nickname: nickname.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
      // Navigate to verify-email with the code
      router.push({ pathname: '/auth/verify-email', params: { code: result?.verificationCode ?? '', email: email.trim() } });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Kayıt başarısız.';
      setError(typeof msg === 'string' ? msg : 'Kayıt başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: colors.text }]}>Kayıt Ol</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Dedikodu dünyasına katıl!</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <AppInput label="Kullanıcı Adı" value={nickname} onChangeText={setNickname} autoCapitalize="none" />
          <AppInput label="Ad Soyad" value={fullName} onChangeText={setFullName} />
          <AppInput label="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <AppInput label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <AppInput label="Şifre" value={password} onChangeText={setPassword} secureTextEntry />
          <AppInput label="Şifre Tekrar" value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry />

          <GradientButton title="Kayıt Ol" onPress={handleRegister} loading={loading} />

          <Pressable onPress={() => router.back()} style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Zaten hesabın var mı? <Text style={{ color: colors.primary, fontWeight: '600' }}>Giriş Yap</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 },
  title: { fontSize: 30, fontWeight: 'bold' },
  subtitle: { fontSize: 15, marginTop: 4, marginBottom: 24 },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  linkBtn: { alignItems: 'center', marginTop: 24 },
  linkText: { fontSize: 15 },
});
