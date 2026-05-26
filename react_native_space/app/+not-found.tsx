import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.text}>Sayfa bulunamadı</Text>
      <Pressable style={styles.btn} onPress={() => router.replace('/')}>
        <Text style={styles.btnText}>Ana Sayfaya Dön</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  title: { fontSize: 48, fontWeight: 'bold', color: '#F97316' },
  text: { fontSize: 18, color: '#fff', marginTop: 8 },
  btn: { marginTop: 24, backgroundColor: '#F97316', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
