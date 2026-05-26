import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../contexts/ThemeContext';
import type { Gossip } from '../types';
import { formatRelativeDate } from '../utils/date';

interface Props {
  gossip: Gossip;
  onReaction: (gossipId: string, reactionType: 'approve' | 'disapprove', currentReaction: string | null) => void;
  isAuthenticated: boolean;
}

export default React.memo(function GossipCard({ gossip, onReaction, isAuthenticated }: Props) {
  const { colors } = useThemeContext();
  const g = gossip;
  const userReaction = g?.userReaction ?? null;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.content, { color: colors.text }]}>{g?.content ?? ''}</Text>
      <Text style={[styles.location, { color: colors.textSecondary }]}>
        {g?.neighborhoodName ?? ''}, {g?.districtName ?? ''}, {g?.provinceName ?? ''}
      </Text>
      <View style={styles.meta}>
        <Text style={[styles.author, { color: colors.primary }]}>@{g?.authorNickname ?? ''}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{formatRelativeDate(g?.createdAt)}</Text>
      </View>
      <View style={styles.reactions}>
        <Pressable
          style={[
            styles.reactionBtn,
            { backgroundColor: userReaction === 'approve' ? '#10B98125' : 'transparent' },
          ]}
          onPress={() => isAuthenticated && onReaction(g?.id ?? '', 'approve', userReaction)}
        >
          <Ionicons name="checkmark-circle" size={20} color={userReaction === 'approve' ? '#10B981' : colors.textSecondary} />
          <Text style={[styles.reactionCount, { color: userReaction === 'approve' ? '#10B981' : colors.textSecondary }]}>
            {g?.approveCount ?? 0}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.reactionBtn,
            { backgroundColor: userReaction === 'disapprove' ? '#EF444425' : 'transparent' },
          ]}
          onPress={() => isAuthenticated && onReaction(g?.id ?? '', 'disapprove', userReaction)}
        >
          <Ionicons name="close-circle" size={20} color={userReaction === 'disapprove' ? '#EF4444' : colors.textSecondary} />
          <Text style={[styles.reactionCount, { color: userReaction === 'disapprove' ? '#EF4444' : colors.textSecondary }]}>
            {g?.disapproveCount ?? 0}
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  content: { fontSize: 16, lineHeight: 22, marginBottom: 8 },
  location: { fontSize: 13, marginBottom: 6 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  author: { fontSize: 13, fontWeight: '600' },
  date: { fontSize: 12 },
  reactions: { flexDirection: 'row', gap: 12 },
  reactionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 6 },
  reactionCount: { fontSize: 14, fontWeight: '600' },
});
