import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommentItem, PathStroke } from '../types';

const COMMENTS_KEY = 'comments_v1';
const DRAWINGS_KEY = 'drawings_v1';

export async function loadComments(): Promise<CommentItem[]> {
  const raw = await AsyncStorage.getItem(COMMENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveComments(data: CommentItem[]) {
  await AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(data));
}

export async function loadDrawings(): Promise<PathStroke[]> {
  const raw = await AsyncStorage.getItem(DRAWINGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveDrawings(data: PathStroke[]) {
  await AsyncStorage.setItem(DRAWINGS_KEY, JSON.stringify(data));
}

export async function clearAll() {
  await AsyncStorage.multiRemove([COMMENTS_KEY, DRAWINGS_KEY]);
}
