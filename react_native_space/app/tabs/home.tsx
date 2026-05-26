import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import apiClient from '../../src/services/apiClient';
import GossipCard from '../../src/components/GossipCard';
import LocationFilterBar from '../../src/components/LocationFilterBar';
import type { Gossip, LocationFilter } from '../../src/types';

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const { colors, isDark, toggleTheme } = useThemeContext();
  const [gossips, setGossips] = useState<Gossip[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<LocationFilter>({});
  const loadingMore = useRef(false);

  const fetchGossips = useCallback(async (p: number, isRefresh = false) => {
    if (loading && !isRefresh) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: 20 };
      if (filter?.neighborhoodId) params.neighborhoodId = filter.neighborhoodId;
      else if (filter?.districtId) params.districtId = filter.districtId;
      else if (filter?.provinceId) params.provinceId = filter.provinceId;

      const res = await apiClient.get('/api/gossips', { params });
      const data = res?.data;
      const items = data?.items ?? [];
      if (p === 1) {
        setGossips(items);
      } else {
        setGossips(prev => [...(prev ?? []), ...items]);
      }
      setTotalPages(data?.totalPages ?? 1);
      setPage(p);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadingMore.current = false;
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      fetchGossips(1, true);
    }, [fetchGossips])
  );

  useEffect(() => {
    fetchGossips(1, true);
  }, [filter]);

  const handleRefresh = () => fetchGossips(1, true);

  const handleLoadMore = () => {
    if (loadingMore.current || page >= totalPages) return;
    loadingMore.current = true;
    fetchGossips(page + 1);
  };

  const handleReaction = async (gossipId: string, reactionType: 'approve' | 'disapprove', currentReaction: string | null) => {
    if (!isAuthenticated) return;
    try {
      if (currentReaction === reactionType) {
        const res = await apiClient.delete(new URL(`/api/gossips/${gossipId}/react`, apiClient.defaults.baseURL).toString().replace(apiClient.defaults.baseURL ?? '', ''));
        updateGossipReaction(gossipId, res?.data);
      } else {
        const res = await apiClient.post(`/api/gossips/${gossipId}/react`, { reactionType });
        updateGossipReaction(gossipId, res?.data);
        if (res?.data?.removed) {
          setGossips(prev => (prev ?? []).filter(g => g?.id !== gossipId));
        }
      }
    } catch {
      // ignore
    }
  };

  const updateGossipReaction = (gossipId: string, data: { approveCount?: number; disapproveCount?: number; userReaction?: string | null } | undefined) => {
    if (!data) return;
    setGossips(prev =>
      (prev ?? []).map(g =>
        g?.id === gossipId
          ? { ...g, approveCount: data?.approveCount ?? g?.approveCount ?? 0, disapproveCount: data?.disapproveCount ?? g?.disapproveCount ?? 0, userReaction: (data?.userReaction ?? null) as string | null }
          : g
      )
    );
  };

  const renderItem = useCallback(({ item }: { item: Gossip }) => (
    <GossipCard gossip={item} onReaction={handleReaction} isAuthenticated={isAuthenticated} />
  ), [isAuthenticated, handleReaction]);

  const keyExtractor = useCallback((item: Gossip) => item?.id ?? Math.random().toString(), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dedikodu</Text>
        <Pressable onPress={toggleTheme} hitSlop={8}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={colors.text} />
        </Pressable>
      </View>

      <LocationFilterBar filter={filter} onFilterChange={setFilter} />

      <FlatList
        data={gossips ?? []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Henüz dedikodu yok</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && (gossips?.length ?? 0) > 0 ? <ActivityIndicator style={{ padding: 16 }} color={colors.primary} /> : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, marginTop: 12 },
});
