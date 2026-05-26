import React, { type ReactNode } from 'react';
import { View, TextInput, Text, StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  right?: ReactNode;
}

export default function AppInput({
  label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, maxLength, right,
}: Props) {
  const { colors } = useThemeContext();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
        />
        {right ? <View style={styles.rightIcon}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 16, paddingVertical: 14 },
  rightIcon: { marginLeft: 8 },
});
