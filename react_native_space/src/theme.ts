import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#F97316',
  accent: '#EF4444',
  approve: '#10B981',
  disapprove: '#EF4444',
  dark: {
    background: '#0D0D0D',
    card: '#1A1A1A',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#333333',
    surface: '#242424',
  },
  light: {
    background: '#F5F2EB',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    border: '#E5E5E5',
    surface: '#FFFDF7',
  },
} as const;

export type ThemeColors = {
  primary: string;
  accent: string;
  approve: string;
  disapprove: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  surface: string;
};

export function getThemeColors(isDark: boolean): ThemeColors {
  const palette = isDark ? COLORS.dark : COLORS.light;
  return {
    primary: COLORS.primary,
    accent: COLORS.accent,
    approve: COLORS.approve,
    disapprove: COLORS.disapprove,
    ...palette,
  };
}

export const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.dark.background,
    surface: COLORS.dark.surface,
    surfaceVariant: COLORS.dark.card,
  },
};

export const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    background: COLORS.light.background,
    surface: COLORS.light.surface,
    surfaceVariant: COLORS.light.card,
  },
};
