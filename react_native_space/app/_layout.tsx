import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider, useThemeContext } from '../src/contexts/ThemeContext';
import { lightPaperTheme, darkPaperTheme } from '../src/theme';
import ErrorBoundary from '../src/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

function InnerLayout() {
  const { isDark } = useThemeContext();
  const paperTheme = isDark ? darkPaperTheme : lightPaperTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="subscription" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="admin" />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
      setReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <InnerLayout />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
