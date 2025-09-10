import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CommentItem } from '../types';
import { formatTime } from '../utils/time';

type Props = {
  data: CommentItem[];
  onJump: (timeMs: number, commentId?: string) => void;
};

export default function CommentList({ data, onJump }: Props) {
  const sorted = [...data].sort((a, b) => a.timeMs - b.timeMs);

  const renderItem = ({ item }: { item: CommentItem }) => {
    const ago = timeAgo(item.createdAt);
    const hasDrawings = item.drawingIds && item.drawingIds.length > 0;
    const hasText = item.text && item.text.trim().length > 0;
    
    return (
      <View style={styles.row}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{item.user.name}</Text>
            <Text style={styles.ago}>{ago}</Text>
          </View>

          <View style={styles.bodyRow}>
            <TouchableOpacity 
              onPress={() => onJump(item.timeMs, item.id)} 
              style={styles.timestampBadge}
              activeOpacity={0.7}
            >
              <Text style={styles.timestampText}>{formatTime(item.timeMs)}</Text>
            </TouchableOpacity>

            <View style={styles.messageContent}>
              {hasText ? (
                <Text style={styles.text}>{item.text}</Text>
              ) : (
                <Text style={styles.textMuted}>— (Drawing only)</Text>
              )}
              
              {hasDrawings && (
                <View style={styles.drawingIndicator}>
                  <Text style={styles.drawingIcon}>🎨</Text>
                  <Text style={styles.drawingText}>Has drawing</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>No comments yet</Text>
      <Text style={styles.emptySubtitle}>Tap anywhere on the video to add your first comment or drawing</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>Comments ({data.length})</Text>
      {data.length > 0 && (
        <Text style={styles.headerSubtext}>Tap on timestamp to jump to that moment</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          data.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      />
    </View>
  );
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: 'white', 
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#111',
    marginBottom: 2,
  },
  headerSubtext: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: { 
    flexDirection: 'row', 
    paddingVertical: 12,
  },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  content: { 
    flex: 1 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 6,
  },
  name: { 
    fontWeight: '700', 
    color: '#111',
    fontSize: 15,
  },
  ago: { 
    color: '#666', 
    fontSize: 12,
  },
  bodyRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
  },
  timestampBadge: { 
    backgroundColor: '#2f72ff', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 12,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  timestampText: { 
    color: 'white', 
    fontWeight: '700',
    fontSize: 12,
  },
  messageContent: {
    flex: 1,
  },
  text: { 
    color: '#222',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  textMuted: { 
    color: '#999', 
    fontStyle: 'italic',
    fontSize: 14,
    marginBottom: 4,
  },
  drawingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  drawingIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  drawingText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  separator: { 
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 56,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});