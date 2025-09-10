import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import VideoPlayer, { VideoPlayerRef } from '../components/VideoPlayer';
import CommentList from '../components/CommentList';
import { CommentItem, PathStroke } from '../types';
import { loadComments, loadDrawings, saveComments, saveDrawings, clearAll } from '../storage';
import { Asset } from 'expo-asset';

const localVideo = Asset.fromModule(require('../../assets/video/banana.mp4')).uri;

export default function PlayerScreen() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [drawings, setDrawings] = useState<PathStroke[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [loadedComments, loadedDrawings] = await Promise.all([
        loadComments(),
        loadDrawings()
      ]);
      
      setComments(loadedComments);
      setDrawings(loadedDrawings);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load comments and drawings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (comment: CommentItem, newStrokes?: PathStroke[]) => {
    try {
      // Update comments
      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      await saveComments(updatedComments);

      // Update drawings if provided
      if (newStrokes && newStrokes.length > 0) {
        const updatedDrawings = [...drawings, ...newStrokes];
        setDrawings(updatedDrawings);
        await saveDrawings(updatedDrawings);
      }

      console.log('Comment added successfully:', comment.id);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to save comment');
      
      // Rollback on error
      setComments(comments);
      if (newStrokes && newStrokes.length > 0) {
        setDrawings(drawings);
      }
    }
  };

  const handleUpdateDrawings = async (updatedDrawings: PathStroke[]) => {
    try {
      setDrawings(updatedDrawings);
      await saveDrawings(updatedDrawings);
    } catch (error) {
      console.error('Error updating drawings:', error);
      Alert.alert('Error', 'Failed to save drawings');
      
      // Rollback on error
      setDrawings(drawings);
    }
  };

  const handleSeekFromList = async (timeMs: number, commentId?: string) => {
    try {
      if (videoPlayerRef?.current) {
        await videoPlayerRef.current.seekTo(timeMs, commentId);
        console.log('Seeking to:', timeMs, 'for comment:', commentId);
      }
    } catch (error) {
      console.error('Error seeking from comment list:', error);
      Alert.alert('Error', 'Failed to seek to timestamp');
    }
  };

  const handleReset = async () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all comments and drawings. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAll();
              setComments([]);
              setDrawings([]);
              console.log('All data cleared successfully');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to reset data');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      {/* <ScrollView contentContainerStyle={{ flexGrow: 1 }}> */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Frame.io Lite</Text>
          <View style={styles.headerRight}>
            <Text style={styles.statsText}>
              {comments.length} comments • {drawings.length} drawings
            </Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.videoContainer}>
        <VideoPlayer
  ref={videoPlayerRef}
  source={{ uri: localVideo }}
  comments={comments}
  drawings={drawings}
  onAddComment={handleAddComment}
  onUpdateDrawings={handleUpdateDrawings}
/>
        </View>

        <View style={styles.commentsContainer}>
          <CommentList 
            data={comments}
            onJump={handleSeekFromList}
          />
        </View>
      </KeyboardAvoidingView>
      {/* </ScrollView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#0f0f0f' 
  },
  header: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  heading: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: '800' 
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    color: '#999',
    fontSize: 12,
    marginRight: 12,
  },
  resetBtn: { 
    backgroundColor: '#ff4757', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  resetBtnText: {
    color: 'white', 
    fontWeight: '700',
    fontSize: 12,
  },
  videoContainer: {
    flex: 1,
    maxHeight: '60%',
  },
  commentsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});