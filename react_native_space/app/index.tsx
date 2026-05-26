import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useThemeContext } from '../src/contexts/ThemeContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useThemeContext();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/tabs/home" />;
  }

  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
