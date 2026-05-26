import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, FlatList, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../contexts/ThemeContext';
import apiClient from '../services/apiClient';
import type { SelectedLocation, LocationItem } from '../types';

interface Props {
  selected: SelectedLocation | null;
  onSelect: (location: SelectedLocation | null) => void;
}

type Step = 'province' | 'district' | 'neighborhood';

export default function LocationPicker({ selected, onSelect }: Props) {
  const { colors } = useThemeContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState<Step>('province');
  const [items, setItems] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tempProvince, setTempProvince] = useState<LocationItem | null>(null);
  const [tempDistrict, setTempDistrict] = useState<LocationItem | null>(null);

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

  const openPicker = () => {
    setStep('province');
    setTempProvince(null);
    setTempDistrict(null);
    setSearch('');
    setModalVisible(true);
    fetchItems('province');
  };

  const selectProvince = (item: LocationItem) => {
    setTempProvince(item);
    setStep('district');
    setSearch('');
    fetchItems('district', item.id);
  };

  const selectDistrict = (item: LocationItem) => {
    setTempDistrict(item);
    setStep('neighborhood');
    setSearch('');
    fetchItems('neighborhood', item.id);
  };

  const selectNeighborhood = (item: LocationItem) => {
    if (!tempProvince || !tempDistrict) return;
    onSelect({
      provinceId: tempProvince.id,
      provinceName: tempProvince.name,
      districtId: tempDistrict.id,
      districtName: tempDistrict.name,
      neighborhoodId: item.id,
      neighborhoodName: item.name,
    });
    setModalVisible(false);
  };

  const handleSelect = (item: LocationItem) => {
    if (step === 'province') selectProvince(item);
    else if (step === 'district') selectDistrict(item);
    else selectNeighborhood(item);
  };

  const filteredItems = (items ?? []).filter(i => {
    if (!search?.trim()) return true;
    return i?.name?.toLowerCase?.()?.includes?.(search.toLowerCase()) ?? false;
  });

  const stepTitle = step === 'province' ? 'İl Seçin' : step === 'district' ? 'İlçe Seçin' : 'Mahalle Seçin';

  return (
    <>
      <Pressable style={[styles.trigger, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={openPicker}>
        {selected ? (
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.chipText, { color: colors.primary }]}>{selected.provinceName}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
            <View style={[styles.chip, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.chipText, { color: colors.primary }]}>{selected.districtName}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
            <View style={[styles.chip, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.chipText, { color: colors.primary }]}>{selected.neighborhoodName}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderRow}>
            <Ionicons name="location" size={18} color={colors.textSecondary} />
            <Text style={[styles.placeholder, { color: colors.textSecondary }]}>Konum seçin (İl {'>'} İlçe {'>'} Mahalle)</Text>
          </View>
        )}
      </Pressable>

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
                renderItem={({ item }) => (
                  <Pressable style={[styles.listItem, { borderBottomColor: colors.border }]} onPress={() => handleSelect(item)}>
                    <Text style={[styles.listItemText, { color: colors.text }]}>{item?.name ?? ''}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
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
  trigger: { borderRadius: 12, borderWidth: 1, padding: 14, minHeight: 48 },
  chipRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  chipText: { fontSize: 13, fontWeight: '600' },
  placeholderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placeholder: { fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 8, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  listItemText: { fontSize: 16, flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 32, fontSize: 15 },
});
