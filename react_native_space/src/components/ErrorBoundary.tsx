import React, { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir hata oluştu</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.errorText}>{this.state.error?.message ?? 'Bilinmeyen hata'}</Text>
          </ScrollView>
          <Pressable style={styles.btn} onPress={() => this.setState({ hasError: false, error: null })}>
            <Text style={styles.btnText}>Tekrar Dene</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D', padding: 24 },
  title: { color: '#EF4444', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  scroll: { maxHeight: 200, marginBottom: 16 },
  errorText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center' },
  btn: { backgroundColor: '#F97316', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
