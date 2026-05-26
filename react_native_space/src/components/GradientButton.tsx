import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeContext } from '../contexts/ThemeContext';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
  style?: StyleProp<ViewStyle>;
}

const GRADIENT = ['#F97316', '#EF4444'] as const;

export default function GradientButton({ title, onPress, loading = false, disabled = false, variant = 'filled', style }: Props) {
  const { colors } = useThemeContext();
  const isDisabled = disabled || loading;

  if (variant === 'outline') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.outlineBtn,
          { borderColor: colors.primary, opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1 },
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.outlineText, { color: colors.primary }]}>{title}</Text>}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [{ opacity: isDisabled ? 0.5 : pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}
    >
      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.gradientText}>{title}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  gradientText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1.5 },
  outlineText: { fontSize: 16, fontWeight: '600' },
});
