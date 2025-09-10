import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import DrawingCanvas from './DrawingCanvas';
import ColorPicker from './ColorPicker';
import { formatTime } from '../utils/time';
import { CommentItem, PathStroke } from '../types';

type Props = {
  source: any;
  comments: CommentItem[];
  drawings: PathStroke[];
  onAddComment: (c: CommentItem, newStrokes?: PathStroke[]) => void;
  onUpdateDrawings: (d: PathStroke[]) => void;
};

export type VideoPlayerRef = {
  seekTo: (ms: number, commentId?: string) => void;
};

const WINDOW = Dimensions.get('window');





// const VideoPlayer = React.forwardRef<VideoPlayerRef, Props>(
//   ({ source, comments, drawings, onAddComment, onUpdateDrawings }, ref) => {
//     const currentUser = { name: 'Noah Green', avatar: 'https://i.pravatar.cc/100' };

//     const [status, setStatus] = useState<any>(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [surface, setSurface] = useState({ w: WINDOW.width, h: (WINDOW.width * 9) / 16 });
//     const [drawMode, setDrawMode] = useState(false);
//     const [color, setColor] = useState('#ff4757');
//     const [strokeWidth] = useState(3);
//     const [commentText, setCommentText] = useState('');
//     const [lockedTimeMs, setLockedTimeMs] = useState<number | null>(null);
//     const [activeStrokes, setActiveStrokes] = useState<PathStroke[]>([]);
//     const [overlayStrokes, setOverlayStrokes] = useState<PathStroke[]>([]);
//     const [overlayForCommentId, setOverlayForCommentId] = useState<string | null>(null);
//     const [overlayTimeMs, setOverlayTimeMs] = useState<number | null>(null);

//     // Initialize video player with proper configuration
//     const player = useVideoPlayer(source, (player) => {
//       player.loop = false;
//       player.muted = false;
//     });

//     useEffect(() => {
//       console.log('VideoPlayer useEffect: Setting up player listeners.');
//       if (!player) return;
      
//       const subscription = player.addListener('statusChange', (status) => {
//         setIsPlaying(status?.isPlaying || false);
//         console.log('Video statusChange:', status.isPlaying ? 'Playing' : 'Paused');
//       });

//       const timeSubscription = player.addListener('timeUpdate', (time) => {
//         const currentTime = Math.round((time.currentTime || 0) * 1000);
//         const duration = Math.round((time?.duration || 0) * 1000);
//         setStatus({ currentTime, duration });
//       });

//       return () => {
//         subscription?.remove();
//         timeSubscription?.remove();
//         console.log('VideoPlayer useEffect cleanup: Listeners removed.');
//       };
//     }, [player]);

//     const currentMs = status?.currentTime ?? 0;
//     const durationMs = status?.duration ?? 0;

//     // useEffect(() => {
//     //   console.log('VideoPlayer useEffect: drawMode changed to', drawMode);
//     // }, [drawMode]);

//     useEffect(() => {
//       if (overlayTimeMs == null) return;
//       const delta = Math.abs(currentMs - overlayTimeMs);
//       console.log(`VideoPlayer useEffect: currentMs=${currentMs}, overlayTimeMs=${overlayTimeMs}, delta=${delta}`);
//       if (delta > 250) {
//         console.log('VideoPlayer useEffect: Clearing overlay strokes due to time delta.');
//         setOverlayStrokes([]);
//         setOverlayForCommentId(null);
//         setOverlayTimeMs(null);
//       }
//     }, [currentMs, overlayTimeMs]);

//     const togglePlay = async () => {
//       console.log('togglePlay called. isPlaying:', isPlaying);
//       if (!player) return;
//       try {
//         if (isPlaying) {
//           await player.pause();
//         } else {
//           await player.play();
//         }
//       } catch (error) {
//         console.error('Error toggling play:', error);
//       }
//     };

//     const seekTo = async (ms: number, commentId?: string) => {
//       console.log('seekTo called. Seeking to:', ms, 'for commentId:', commentId);
//       if (!player) return;
//       try {
//         await player.seekTo(ms / 1000);
//         await player.pause();
//         setStatus((s: any) => ({ ...(s ?? {}), currentTime: ms }));

//         const comment = comments.find((c) => c.id === commentId) ?? comments.find((c) => c.timeMs === ms);
//         if (comment && comment.drawingIds && comment.drawingIds.length > 0) {
//           const strokesToShow = drawings.filter((s) => comment.drawingIds?.includes(s.id));
//           setOverlayStrokes(strokesToShow);
//           setOverlayForCommentId(comment.id);
//           setOverlayTimeMs(comment.timeMs);
//           console.log('seekTo: Found drawing IDs, setting overlay strokes.');
//         } else {
//           setOverlayStrokes([]);
//           setOverlayForCommentId(null);
//           setOverlayTimeMs(ms);
//           console.log('seekTo: No drawing IDs found, clearing overlay strokes.');
//         }
//       } catch (error) {
//         console.error('Error seeking:', error);
//       }
//     };

//     React.useImperativeHandle(ref, () => ({
//       seekTo,
//     }));

//     const handleFocusComment = async () => {
//       console.log('handleFocusComment: Pausing video and locking time.');
//       if (!player) return;
//       try {
//         await player.pause();
//         setLockedTimeMs(currentMs);
//       } catch (error) {
//         console.error('Error pausing for comment:', error);
//       }
//     };

//     const handleToggleDrawMode = async () => {
//       console.log('handleToggleDrawMode called. Current drawMode:', drawMode);
//       if (!player) return;
//       if (!drawMode) {
//         setDrawMode(true);
//         try {
//           await player.pause();
//           setLockedTimeMs(currentMs);
//           console.log('handleToggleDrawMode: Entering draw mode, paused video.');
//         } catch (error) {
//           console.error('Error entering draw mode:', error);
//         }
//       } else {
//         setDrawMode(false);
//         setActiveStrokes([]);
//         console.log('handleToggleDrawMode: Exiting draw mode, clearing strokes.');
//       }
//     };

//     const handleActiveStrokesUpdate = (strokes: PathStroke[]) => {
//       console.log('handleActiveStrokesUpdate called. New number of strokes:', strokes.length);
//       const normalized = strokes.map((s) => ({
//         ...s,
//         id: s.id || `stroke_temp_${Math.random().toString(36).slice(2, 9)}`,
//         timeMs: lockedTimeMs ?? currentMs,
//       }));
//       setActiveStrokes(normalized);
//     };

//     const submitComment = async () => {
//       console.log('submitComment called. Comment text:', commentText.trim(), 'Strokes:', activeStrokes.length);
//       const t = (lockedTimeMs ?? currentMs) as number;
//       const newStrokes = activeStrokes.map((s) => {
//         return {
//           ...s,
//           id: s.id || `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
//           timeMs: t,
//         } as PathStroke;
//       });

//       // Update drawings first
//       if (newStrokes.length > 0) {
//         const merged = [...drawings, ...newStrokes];
//         onUpdateDrawings(merged);
//         console.log('submitComment: Merged new strokes with existing drawings.');
//       }

//       const drawingIds = newStrokes.map((s) => s.id);

//       const comment: CommentItem = {
//         id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
//         user: { name: currentUser.name, avatar: currentUser.avatar },
//         timeMs: t,
//         text: commentText.trim() || undefined,
//         drawingIds: drawingIds.length > 0 ? drawingIds : undefined,
//         createdAt: Date.now(),
//       };

//       onAddComment(comment, newStrokes);

//       // Reset states
//       setCommentText('');
//       setActiveStrokes([]);
//       setDrawMode(false);
//       setLockedTimeMs(null);
      
//       // Show the new drawings
//       if (newStrokes.length > 0) {
//         setOverlayStrokes(newStrokes);
//         setOverlayForCommentId(comment.id);
//         setOverlayTimeMs(comment.timeMs);
//         console.log('submitComment: Comment and drawings posted successfully. Resetting states.');
//       }
//     };

//     const onLayoutVideo = (e: LayoutChangeEvent) => {
//       const { width } = e.nativeEvent.layout;
//       setSurface({ w: width, h: (width * 9) / 16 });
//       console.log('onLayoutVideo: Video surface dimensions updated to', width, (width * 9) / 16);
//     };

//     const initialStrokesForCanvas = useMemo(() => {
//       const strokesToRender = drawMode ? activeStrokes : overlayStrokes;
//       console.log('useMemo: Deciding which strokes to render. Draw mode:', drawMode, '. Number of strokes:', strokesToRender.length);
//       return strokesToRender;
//     }, [drawMode, activeStrokes, overlayStrokes]);

//     const canSubmit = commentText.trim().length > 0 || activeStrokes.length > 0;

//     return (
//       <View style={styles.container}>
//         <View onLayout={onLayoutVideo} style={[styles.videoBox, { height: surface.h }]}>
//           <VideoView 
//             style={StyleSheet.absoluteFill} 
//             player={player} 
//             allowsFullscreen={false}
//             allowsPictureInPicture={false}
//             contentFit="contain"
//             nativeControls={false}
//           />

//           {surface.w > 0 && surface.h > 0 && (
//             <DrawingCanvas
//               width={surface.w}
//               height={surface.h}
//               // active={true}
//               active={drawMode}
//               color={color}
//               strokeWidth={strokeWidth}
//               currentTimeMs={lockedTimeMs ?? currentMs}
//               initialStrokes={initialStrokesForCanvas}
//               onUpdate={handleActiveStrokesUpdate}
//             />
//           )}

//           <View style={styles.controls}>
//             <TouchableOpacity style={styles.controlBtn} onPress={togglePlay}>
//               <Text style={styles.controlText}>{isPlaying ? '⏯️' : '▶️'}</Text>
//             </TouchableOpacity>
//             <View style={styles.timeBox}>
//               <Text style={styles.timeText}>
//                 {formatTime(currentMs)} / {formatTime(durationMs)}
//               </Text>
//             </View>
//             <TouchableOpacity 
//               style={[styles.controlBtn, drawMode && styles.active]} 
//               onPress={() => handleToggleDrawMode()}
//             >
//               <Text style={styles.controlText}>✏️</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {drawMode && (
//           <View style={styles.colorRow}>
//             <ColorPicker value={color} onChange={setColor} />
//             <TouchableOpacity 
//               style={[styles.clearBtn, !activeStrokes.length && styles.disabled]} 
//               onPress={() => setActiveStrokes([])}
//               disabled={!activeStrokes.length}
//             >
//               <Text style={styles.clearText}>Clear</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })} style={styles.bottomBar}>
//           <View style={styles.lockStamp}>
//             <Text style={styles.lockStampText}>{formatTime(lockedTimeMs ?? currentMs)}</Text>
//           </View>
//           <TextInput
//             placeholder="Write your comment here"
//             placeholderTextColor="#999"
//             style={styles.input}
//             value={commentText}
//             onFocus={handleFocusComment}
//             onChangeText={setCommentText}
//             onSubmitEditing={canSubmit ? submitComment : undefined}
//             returnKeyType="send"
//             multiline
//             maxLength={500}
//           />
//           <TouchableOpacity 
//             onPress={submitComment} 
//             style={[styles.commentBtn, !canSubmit && styles.disabled]}
//             disabled={!canSubmit}
//           >
//             <Text style={styles.commentBtnText}>Post</Text>
//           </TouchableOpacity>
//         </KeyboardAvoidingView>
//       </View>
//     );
//   }
// );


const VideoPlayer = React.forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ source, comments, drawings, onAddComment, onUpdateDrawings }, ref) => {
    const currentUser = { name: 'Noah Green', avatar: 'https://i.pravatar.cc/100' };

    const [status, setStatus] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    const [surface, setSurface] = useState({ w: WINDOW.width, h: (WINDOW.width * 9) / 16 });
    const [drawMode, setDrawMode] = useState(false);
    const [color, setColor] = useState('#ff4757');
    const [strokeWidth] = useState(3);
    const [commentText, setCommentText] = useState('');
    const [lockedTimeMs, setLockedTimeMs] = useState<number | null>(null);
    const [activeStrokes, setActiveStrokes] = useState<PathStroke[]>([]);
    const [overlayStrokes, setOverlayStrokes] = useState<PathStroke[]>([]);
    const [overlayForCommentId, setOverlayForCommentId] = useState<string | null>(null);
    const [overlayTimeMs, setOverlayTimeMs] = useState<number | null>(null);

    // Initialize video player with proper configuration
    const player = useVideoPlayer(source, (player) => {
      player.loop = false;
      player.muted = false;
    });

    useEffect(() => {
      console.log('VideoPlayer useEffect: Setting up player listeners.');
      if (!player) return;
      
      const subscription = player.addListener('statusChange', (newStatus) => {
        console.log('Video statusChange:', newStatus);
        setIsPlaying(newStatus?.isPlaying || false);
        
        // Handle video end
        if (newStatus?.status === 'readyToPlay' && status?.currentTime >= status?.duration - 100) {
          setHasEnded(true);
          setIsPlaying(false);
        }
      });

      const timeSubscription = player.addListener('timeUpdate', (time) => {
        const currentTime = Math.round((time.currentTime || 0) * 1000);
        const duration = Math.round((time?.duration || 0) * 1000);
        
        setStatus({ currentTime, duration });
        
        // Check if video has ended
        if (currentTime >= duration - 100 && duration > 0) {
          setHasEnded(true);
          setIsPlaying(false);
        } else {
          setHasEnded(false);
        }
      });

      return () => {
        subscription?.remove();
        timeSubscription?.remove();
        console.log('VideoPlayer useEffect cleanup: Listeners removed.');
      };
    }, [player, status?.currentTime, status?.duration]);

    const currentMs = status?.currentTime ?? 0;
    const durationMs = status?.duration ?? 0;

    useEffect(() => {
      if (overlayTimeMs == null) return;
      const delta = Math.abs(currentMs - overlayTimeMs);
      console.log(`VideoPlayer useEffect: currentMs=${currentMs}, overlayTimeMs=${overlayTimeMs}, delta=${delta}`);
      if (delta > 250) {
        console.log('VideoPlayer useEffect: Clearing overlay strokes due to time delta.');
        setOverlayStrokes([]);
        setOverlayForCommentId(null);
        setOverlayTimeMs(null);
      }
    }, [currentMs, overlayTimeMs]);

    const togglePlay = async () => {
      console.log('togglePlay called. isPlaying:', isPlaying, 'hasEnded:', hasEnded);
      if (!player) return;
      
      try {
        if (hasEnded) {
          // Restart video from beginning
          await player.seekTo(0);
          await player.play();
          setHasEnded(false);
        } else if (isPlaying) {
          await player.pause();
        } else {
          await player.play();
        }
      } catch (error) {
        console.error('Error toggling play:', error);
      }
    };

    const seekTo = async (ms: number, commentId?: string) => {
      console.log('seekTo called. Seeking to:', ms, 'for commentId:', commentId);
      if (!player) return;
      try {
        await player.seekTo(ms / 1000);
        setStatus((s: any) => ({ ...(s ?? {}), currentTime: ms }));
        setHasEnded(false);

        const comment = comments.find((c) => c.id === commentId) ?? comments.find((c) => c.timeMs === ms);
        if (comment && comment.drawingIds && comment.drawingIds.length > 0) {
          const strokesToShow = drawings.filter((s) => comment.drawingIds?.includes(s.id));
          setOverlayStrokes(strokesToShow);
          setOverlayForCommentId(comment.id);
          setOverlayTimeMs(comment.timeMs);
          console.log('seekTo: Found drawing IDs, setting overlay strokes.');
        } else {
          setOverlayStrokes([]);
          setOverlayForCommentId(null);
          setOverlayTimeMs(ms);
          console.log('seekTo: No drawing IDs found, clearing overlay strokes.');
        }
      } catch (error) {
        console.error('Error seeking:', error);
      }
    };

    React.useImperativeHandle(ref, () => ({
      seekTo,
    }));

    const handleFocusComment = async () => {
      console.log('handleFocusComment: Pausing video and locking time.');
      if (!player) return;
      try {
        await player.pause();
        setLockedTimeMs(currentMs);
      } catch (error) {
        console.error('Error pausing for comment:', error);
      }
    };

    const handleToggleDrawMode = async () => {
      console.log('handleToggleDrawMode called. Current drawMode:', drawMode);
      if (!player) return;
      
      if (!drawMode) {
        setDrawMode(true);
        try {
          await player.pause();
          const timeToLock = currentMs;
          setLockedTimeMs(timeToLock);
          // Clear any overlay strokes when entering draw mode
          setOverlayStrokes([]);
          setOverlayForCommentId(null);
          setOverlayTimeMs(null);
          console.log('handleToggleDrawMode: Entering draw mode, paused video at', timeToLock);
        } catch (error) {
          console.error('Error entering draw mode:', error);
        }
      } else {
        setDrawMode(false);
        setActiveStrokes([]);
        setLockedTimeMs(null);
        console.log('handleToggleDrawMode: Exiting draw mode, clearing strokes.');
      }
    };

    const handleActiveStrokesUpdate = (strokes: PathStroke[]) => {
      console.log('handleActiveStrokesUpdate called. New number of strokes:', strokes.length);
      const timeStamp = lockedTimeMs ?? currentMs;
      const normalized = strokes.map((s) => ({
        ...s,
        timeMs: timeStamp,
      }));
      setActiveStrokes(normalized);
    };

    const submitComment = async () => {
      console.log('submitComment called. Comment text:', commentText.trim(), 'Strokes:', activeStrokes.length);
      const t = (lockedTimeMs ?? currentMs) as number;
      const newStrokes = activeStrokes.map((s, index) => ({
        ...s,
        id: s.id || `stroke_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 9)}`,
        timeMs: t,
      }));

      // Update drawings first if we have strokes
      if (newStrokes.length > 0) {
        const merged = [...drawings, ...newStrokes];
        onUpdateDrawings(merged);
        console.log('submitComment: Added new strokes to drawings.');
      }

      const drawingIds = newStrokes.map((s) => s.id);

      const comment: CommentItem = {
        id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        user: { name: currentUser.name, avatar: currentUser.avatar },
        timeMs: t,
        text: commentText.trim() || undefined,
        drawingIds: drawingIds.length > 0 ? drawingIds : undefined,
        createdAt: Date.now(),
      };

      onAddComment(comment, newStrokes);

      // Reset states
      setCommentText('');
      setActiveStrokes([]);
      setDrawMode(false);
      setLockedTimeMs(null);
      
      // Show the new drawings immediately
      if (newStrokes.length > 0) {
        setOverlayStrokes(newStrokes);
        setOverlayForCommentId(comment.id);
        setOverlayTimeMs(comment.timeMs);
        console.log('submitComment: Comment and drawings posted successfully. Displaying new drawings.');
      }
    };

    const onLayoutVideo = (e: LayoutChangeEvent) => {
      const { width } = e.nativeEvent.layout;
      setSurface({ w: width, h: (width * 9) / 16 });
      console.log('onLayoutVideo: Video surface dimensions updated to', width, (width * 9) / 16);
    };

    // Determine which strokes to show on canvas
    const strokesForCanvas = useMemo(() => {
      if (drawMode) {
        // In draw mode, show active strokes being drawn
        return activeStrokes;
      } else {
        // Not in draw mode, show overlay strokes from selected comment
        return overlayStrokes;
      }
    }, [drawMode, activeStrokes, overlayStrokes]);

    const canSubmit = commentText.trim().length > 0 || activeStrokes.length > 0;

    const getPlayButtonText = () => {
      if (hasEnded) return '🔄'; // Replay icon
      return isPlaying ? '⏸️' : '▶️';
    };

    return (
      <View style={styles.container}>
        <View onLayout={onLayoutVideo} style={[styles.videoBox, { height: surface.h }]}>
          <VideoView 
            style={StyleSheet.absoluteFill} 
            player={player} 
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            contentFit="contain"
            nativeControls={false}
          />

          {surface.w > 0 && surface.h > 0 && (
            <DrawingCanvas
              width={surface.w}
              height={surface.h}
              active={true}
              // active={drawMode}
              color={color}
              strokeWidth={strokeWidth}
              currentTimeMs={lockedTimeMs ?? currentMs}
              initialStrokes={strokesForCanvas}
              onUpdate={handleActiveStrokesUpdate}
            />
          )}

          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlBtn} onPress={togglePlay}>
              <Text style={styles.controlText}>{getPlayButtonText()}</Text>
            </TouchableOpacity>
            <View style={styles.timeBox}>
              <Text style={styles.timeText}>
                {formatTime(currentMs)} / {formatTime(durationMs)}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.controlBtn, drawMode && styles.active]} 
              onPress={handleToggleDrawMode}
            >
              <Text style={styles.controlText}>✏️</Text>
            </TouchableOpacity>
          </View>

          {hasEnded && (
            <View style={styles.replayOverlay}>
              <TouchableOpacity style={styles.replayButton} onPress={togglePlay}>
                <Text style={styles.replayText}>🔄 Replay</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {drawMode && (
          <View style={styles.colorRow}>
            <ColorPicker value={color} onChange={setColor} />
            <TouchableOpacity 
              style={[styles.clearBtn, !activeStrokes.length && styles.disabled]} 
              onPress={() => setActiveStrokes([])}
              disabled={!activeStrokes.length}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })} style={styles.bottomBar}>
          <View style={styles.lockStamp}>
            <Text style={styles.lockStampText}>{formatTime(lockedTimeMs ?? currentMs)}</Text>
          </View>
          <TextInput
            placeholder="Write your comment here"
            placeholderTextColor="#999"
            style={styles.input}
            value={commentText}
            onFocus={handleFocusComment}
            onChangeText={setCommentText}
            onSubmitEditing={canSubmit ? submitComment : undefined}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            onPress={submitComment} 
            style={[styles.commentBtn, !canSubmit && styles.disabled]}
            disabled={!canSubmit}
          >
            <Text style={styles.commentBtnText}>Post</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    );
  }
);




export default VideoPlayer;

const styles = StyleSheet.create({
  container: { backgroundColor: '#0f0f0f', width: '100%', flexDirection: 'column' },
  videoBox: {
    width: '100%',
    backgroundColor: 'black',
    overflow: 'hidden',
    position: 'relative',
  },
  controls: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 12,
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  controlBtn: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  active: { backgroundColor: '#2f72ff' },
  controlText: { color: 'white', fontWeight: '600', fontSize: 16 },
  colorRow: { 
    backgroundColor: 'white', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtn: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#ffffff',
    minHeight: 60,
  },
  lockStamp: { 
    backgroundColor: '#191919', 
    paddingHorizontal: 10, 
    paddingVertical: 8, 
    borderRadius: 6, 
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  lockStampText: {
    color: 'white', 
    fontWeight: '700',
    fontSize: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#111',
    marginRight: 8,
    maxHeight: 80,
    textAlignVertical: 'top',
  },
  commentBtn: { 
    backgroundColor: '#2f72ff', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  commentBtnText: {
    color: 'white', 
    fontWeight: '700',
    fontSize: 14,
  },
  replayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  replayButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  replayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});