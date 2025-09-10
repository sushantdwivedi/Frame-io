import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, PanResponder, Dimensions, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Skia, useCanvasRef } from '@shopify/react-native-skia';
import type { PathStroke, Point } from '../types';

type Props = {
  width: number;
  height: number;
  active: boolean;
  color: string;
  strokeWidth?: number;
  currentTimeMs: number;
  initialStrokes: PathStroke[];
  onUpdate: (strokes: PathStroke[]) => void;
};



export default function DrawingCanvas({
  width,
  height,
  active,
  color,
  strokeWidth = 3,
  currentTimeMs,
  initialStrokes, 
  onUpdate,
}: Props) {

  const [currentStroke, setCurrentStroke] = useState<PathStroke | null>(null);
  const isDrawingRef = useRef(false);
  const canvasRef = useRef<any>(null);

  const createSkiaPath = useCallback((points: Point[]) => {
    if (points.length === 0) return Skia.Path.Make();
    
    const path = Skia.Path.Make();
    path.moveTo(points[0].x, points[0].y);
    
    if (points.length === 1) {
      path.addCircle(points[0].x, points[0].y, strokeWidth / 2);
    } else {
      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currentPoint = points[i];
        
        if (i === 1) {
          path.lineTo(currentPoint.x, currentPoint.y);
        } else {
          const midX = (prevPoint.x + currentPoint.x) / 2;
          const midY = (prevPoint.y + currentPoint.y) / 2;
          path.quadTo(prevPoint.x, prevPoint.y, midX, midY);
        }
      }
      
      if (points.length > 2) {
        const lastPoint = points[points.length - 1];
        path.lineTo(lastPoint.x, lastPoint.y);
      }
    }
    return path;
  }, [strokeWidth]);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => active,
      onMoveShouldSetPanResponder: () => active,
      
      onPanResponderGrant: (evt) => {
        if (!active) return;
        
        isDrawingRef.current = true;
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint: Point = { 
          x: Math.max(0, Math.min(locationX, width)), 
          y: Math.max(0, Math.min(locationY, height)) 
        };
        
        const strokeId = `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const newStroke: PathStroke = {
          id: strokeId,
          timeMs: currentTimeMs,
          color,
          width: strokeWidth,
          points: [newPoint],
        };
        
        setCurrentStroke(newStroke);
      },
      
      onPanResponderMove: (evt) => {
        if (!active || !isDrawingRef.current || !currentStroke) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const newPoint: Point = { 
          x: Math.max(0, Math.min(locationX, width)), 
          y: Math.max(0, Math.min(locationY, height)) 
        };
        
        setCurrentStroke(prevStroke => {
          if (!prevStroke) return null;
          const newPoints = [...prevStroke.points, newPoint];
          return {
            ...prevStroke,
            points: newPoints.length > 1000 ? newPoints.slice(-1000) : newPoints,
          };
        });
      },
      
      onPanResponderRelease: () => {
        if (!active || !currentStroke || currentStroke.points.length === 0) {
          setCurrentStroke(null);
          isDrawingRef.current = false;
          return;
        }
        
        // Add the completed stroke to the collection
        const updatedStrokes = [...initialStrokes, currentStroke];
        onUpdate(updatedStrokes);
        
        // Clear the current stroke
        setCurrentStroke(null);
        isDrawingRef.current = false;
      },
      
      onPanResponderTerminate: () => {
        setCurrentStroke(null);
        isDrawingRef.current = false;
      },
    })
  , [active, width, height, color, strokeWidth, currentTimeMs, initialStrokes, currentStroke, onUpdate]);

  const renderStrokes = useMemo(() => {
    const elements: React.ReactElement[] = [];
    
    // Render existing strokes (from initialStrokes prop)
    initialStrokes.forEach((stroke) => {
      if (stroke.points && stroke.points.length > 0) {
        const path = createSkiaPath(stroke.points);
        elements.push(
          <Path
            key={stroke.id}
            path={path}
            color={stroke.color}
            style="stroke"
            strokeWidth={stroke.width}
            strokeCap="round"
            strokeJoin="round"
          />
        );
      }
    });
    
    // Render the currently-drawing stroke (from local state)
    if (currentStroke && currentStroke.points.length > 0) {
      const path = createSkiaPath(currentStroke.points);
      elements.push(
        <Path
          key="current-stroke"
          path={path}
          color={currentStroke.color}
          style="stroke"
          strokeWidth={currentStroke.width}
          strokeCap="round"
          strokeJoin="round"
        />
      );
    }
    
    return elements;
  }, [initialStrokes, currentStroke, createSkiaPath]);

  return (
    <>
      <View 
        style={{ 
          width, 
          height, 
          position: 'absolute', 
          top: 0, 
          left: 0,
          backgroundColor: active ? 'rgba(255,255,255,0.01)' : 'transparent',
          zIndex: active ? 10 : 1,
        }} 
        {...panResponder.panHandlers}
      >
        <Canvas ref={canvasRef} style={{ width, height }}>
          {renderStrokes}
        </Canvas>
      </View>
      
      {active && (
        <View style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(0,0,0,0.7)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
          zIndex: 20,
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
            Drawing Mode - Touch to draw
          </Text>
        </View>
      )}
    </>
  );
};



// export default function DrawingCanvas({
//   width,
//   height,
//   active,
//   color,
//   strokeWidth = 3,
//   currentTimeMs,
//   initialStrokes, 
//   onUpdate,
// }: Props) {
//   const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
//   const currentIdRef = useRef<string | null>(null);
//   const canvasRef = useCanvasRef();

//   const createSkiaPath = useCallback((points: Point[]) => {
//     // ... (rest of the function is the same)
//     if (points.length === 0) return Skia.Path.Make();
    
//     const path = Skia.Path.Make();
//     path.moveTo(points[0].x, points[0].y);
    
//     if (points.length === 1) {
//       path.addCircle(points[0].x, points[0].y, strokeWidth / 2);
//     } else {
//       for (let i = 1; i < points.length; i++) {
//         const prevPoint = points[i - 1];
//         const currentPoint = points[i];
        
//         if (i === 1) {
//           path.lineTo(currentPoint.x, currentPoint.y);
//         } else {
//           const midX = (prevPoint.x + currentPoint.x) / 2;
//           const midY = (prevPoint.y + currentPoint.y) / 2;
//           path.quadTo(prevPoint.x, prevPoint.y, midX, midY);
//         }
//       }
      
//       if (points.length > 2) {
//         const lastPoint = points[points.length - 1];
//         path.lineTo(lastPoint.x, lastPoint.y);
//       }
//     }
//     return path;
//   }, [strokeWidth]);

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => active,
//       onMoveShouldSetPanResponder: () => active,
      
//       onPanResponderGrant: (evt) => {
//         if (!active) return;
        
//         const { locationX, locationY } = evt.nativeEvent;
//         const newPoint: Point = { 
//           x: Math.max(0, Math.min(locationX, width)), 
//           y: Math.max(0, Math.min(locationY, height)) 
//         };
        
//         currentIdRef.current = `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
//         setCurrentPoints([newPoint]);
//         // No need for setIsDrawing, the PanResponder handles the gesture state.
//       },
      
//       onPanResponderMove: (evt) => {
//         if (!active) return;
        
//         const { locationX, locationY } = evt.nativeEvent;
//         const newPoint: Point = { 
//           x: Math.max(0, Math.min(locationX, width)), 
//           y: Math.max(0, Math.min(locationY, height)) 
//         };
        
//         setCurrentPoints((prev) => {
//           const newPoints = [...prev, newPoint];
//           return newPoints.length > 1000 ? newPoints.slice(-1000) : newPoints;
//         });
//       },
      
//       onPanResponderRelease: () => {
//         if (!active || !currentIdRef.current || currentPoints.length === 0) {
//           // If no stroke was drawn, just clear the temp state and return.
//           setCurrentPoints([]);
//           currentIdRef.current = null;
//           return;
//         }
        
//         const newStroke: PathStroke = {
//           id: currentIdRef.current,
//           timeMs: currentTimeMs,
//           color,
//           width: strokeWidth,
//           points: [...currentPoints],
//         };
        
//         // Pass the new stroke along with existing strokes to the parent
//         // for state management. This is the crucial line.
//         onUpdate([...initialStrokes, newStroke]);
        
//         // After sending the data to the parent, clear the local temporary state.
//         setCurrentPoints([]);
//         currentIdRef.current = null;
//       },
      
//       onPanResponderTerminate: () => {
//         // Clear temporary points if gesture is interrupted
//         setCurrentPoints([]);
//         currentIdRef.current = null;
//       },
//     })
//   ).current;

//   const renderStrokes = useCallback(() => {
//     const elements: React.ReactElement[] = [];
    
//     // Render existing strokes (from initialStrokes prop)
//     initialStrokes.forEach((stroke) => {
//       if (stroke.points && stroke.points.length > 0) {
//         const path = createSkiaPath(stroke.points);
//         elements.push(
//           <Path
//             key={stroke.id}
//             path={path}
//             color={stroke.color}
//             style="stroke"
//             strokeWidth={stroke.width}
//             strokeCap="round"
//             strokeJoin="round"
//           />
//         );
//       }
//     });
    
//     // Render the currently-drawing stroke (from local state)
//     if (currentPoints.length > 0) {
//       const path = createSkiaPath(currentPoints);
//       elements.push(
//         <Path
//           key="current-stroke"
//           path={path}
//           color={color}
//           style="stroke"
//           strokeWidth={strokeWidth}
//           strokeCap="round"
//           strokeJoin="round"
//         />
//       );
//     }
    
//     return elements;
//   }, [initialStrokes, currentPoints, color, strokeWidth, createSkiaPath]);

//   // The rest of the component is unchanged
//   return (
//     <>
//       <View 
//         style={{ 
//           width, 
//           height, 
//           position: 'absolute', 
//           top: 0, 
//           left: 0,
//           backgroundColor: active ? 'rgba(255,255,255,0.01)' : 'transparent',
//           zIndex: active ? 10 : 1,
//         }} 
//         {...panResponder.panHandlers}
//       >
//         <Canvas ref={canvasRef} style={{ width, height }}>
//           {renderStrokes()}
//         </Canvas>
//       </View>
      
//       {active && (
//         <View style={{
//           position: 'absolute',
//           top: 10,
//           left: 10,
//           backgroundColor: 'rgba(0,0,0,0.7)',
//           paddingHorizontal: 8,
//           paddingVertical: 4,
//           borderRadius: 4,
//           zIndex: 20,
//         }}>
//           <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
//             Drawing Mode - Touch to draw
//           </Text>
//         </View>
//       )}
//     </>
//   );
// }