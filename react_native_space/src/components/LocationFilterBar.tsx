import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, FlatList, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../contexts/ThemeContext';
import apiClient from '../services/apiClient';
import type { LocationFilter, LocationItem } from '../types';

interface Props {
  filter: LocationFilter;
  onFilterChange: (filter: LocationFilter) => void;
}

type Step = 'province' | 'district' | 'neighborhood';

export default function LocationFilterBar({ filter, onFilterChange }: Props) {
  const { colors } = useThemeContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<Step>('province');
  const [items, setItems] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tempFilter, setTempFilter] = useState<LocationFilter>({});

  const fetchItems = useCallback(async (s: Step, parentId?: string) => {
    setLoading(true);
    setItems([]);
    try {
      let url = '/api/provinces';
      if (s === 'district' && parentId) url = `/api/provinces/${parentId}/districts`;
      if (s === 'neighborhood' && parentId) url = `/api/districts/${parentId}/neighborhoods`;
      const res = await apiClient.get(url);
      setItems(res?.data?.items ?? res?.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const openFilter = () => {
    setStep('province');
    setTempFilter({});
    setSearch('');
    setModalVisible(true);
    fetchItems('province');
  };

  const selectProvince = (item: LocationItem | null) => {
    if (!item) {
      // "Tüm Türkiye"
      onFilterChange({});
      setModalVisible(false);
      return;
    }
    setTempFilter({ provinceId: item.id, provinceName: item.name });
    setStep('district');
    setSearch('');
    fetchItems('district', item.id);
  };

  const selectDistrict = (item: LocationItem | null) => {
    if (!item) {
      onFilterChange({ provinceId: tempFilter.provinceId, provinceName: tempFilter.provinceName });
      setModalVisible(false);
      return;
    }
    setTempFilter(prev => ({ ...prev, districtId: item.id, districtName: item.name }));
    setStep('neighborhood');
    setSearch('');
    fetchItems('neighborhood', item.id);
  };

  const selectNeighborhood = (item: LocationItem | null) => {
    if (!item) {
      onFilterChange({ provinceId: tempFilter.provinceId, provinceName: tempFilter.provinceName, districtId: tempFilter.districtId, districtName: tempFilter.districtName });
    } else {
      onFilterChange({ ...tempFilter, neighborhoodId: item.id, neighborhoodName: item.name });
    }
    setModalVisible(false);
  };

  const handleSelect = (item: LocationItem | null) => {
    if (step === 'province') selectProvince(item);
    else if (step === 'district') selectDistrict(item);
    else selectNeighborhood(item);
  };

  const filteredItems = (items ?? []).filter(i => {
    if (!search?.trim()) return true;
    return i?.name?.toLowerCase?.()?.includes?.(search.toLowerCase()) ?? false;
  });

  const stepTitle = step === 'province' ? 'İl Seçin' : step === 'district' ? 'İlçe Seçin' : 'Mahalle Seçin';
  const allOption = step === 'province' ? 'Tüm Türkiye' : step === 'district' ? `Tüm ${tempFilter?.provinceName ?? 'İl'}` : `Tüm ${tempFilter?.districtName ?? 'İlçe'}`;

  const hasFilter = !!(filter?.provinceId || filter?.districtId || filter?.neighborhoodId);
  const filterLabel = filter?.neighborhoodName
    ? `${filter.neighborhoodName}, ${filter.districtName ?? ''}`
    : filter?.districtName
    ? `${filter.districtName}, ${filter.provinceName ?? ''}`
    : filter?.provinceName ?? 'Tüm Türkiye';

  return (
    <>
      <View style={[styles.bar, { borderBottomColor: colors.border }]}>
        <Pressable style={[styles.filterChip, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={openFilter}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={[styles.filterText, { color: colors.text }]} numberOfLines={1}>{filterLabel}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </Pressable>
        {hasFilter && (
          <Pressable onPress={() => onFilterChange({})} hitSlop={8} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{stepTitle}</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Ara..."
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={filteredItems}
                keyExtractor={item => item?.id ?? Math.random().toString()}
                ListHeaderComponent={
                  <Pressable style={[styles.listItem, { borderBottomColor: colors.border }]} onPress={() => handleSelect(null)}>
                    <Text style={[styles.listItemText, { color: colors.primary, fontWeight: '700' }]}>{allOption}</Text>
                  </Pressable>
                }
                renderItem={({ item }) => (
                  <Pressable style={[styles.listItem, { borderBottomColor: colors.border }]} onPress={() => handleSelect(item)}>
                    <Text style={[styles.listItemText, { color: colors.text }]}>{item?.name ?? ''}</Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sonuç bulunamadı</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  filterChip: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
  filterText: { flex: 1, fontSize: 14, fontWeight: '500' },
  clearBtn: { marginLeft: 8 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 8, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  listItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  listItemText: { fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 32, fontSize: 15 },
});
