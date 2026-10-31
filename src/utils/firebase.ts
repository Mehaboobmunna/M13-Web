import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Player } from '../types/quartetClash';

export interface RoomData {
  id: string;
  roomCode: string;
  hostId: string;
  hostName: string;
  status: 'lobby' | 'playing' | 'ended';
  tableSize: number;
  currentThemeId: string;
  round: number;
  activePlayerIdx: number;
  starterIdx: number;
  turnMessage: string;
  currentStep: string;
  players: Player[];
  activeTransfer: any;
  resultModal?: any;
  createdAt: string;
  updatedAt: string;
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if present in config
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const PLAYER_ID_KEY = 'buildsmith_quartet_player_identity';

export interface LocalPlayerIdentity {
  id: string;
  name: string;
}

export function getOrCreatePlayerId(): LocalPlayerIdentity {
  try {
    const saved = localStorage.getItem(PLAYER_ID_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const identity: LocalPlayerIdentity = {
    id: `user_${Math.random().toString(36).substring(2, 9)}`,
    name: `Player ${randomNum}`,
  };

  try {
    localStorage.setItem(PLAYER_ID_KEY, JSON.stringify(identity));
  } catch {
    // ignore
  }

  return identity;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createMultiplayerRoom(room: RoomData): Promise<void> {
  const roomRef = doc(db, 'rooms', room.roomCode);
  await setDoc(roomRef, {
    ...room,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateMultiplayerRoom(roomId: string, data: Partial<RoomData>): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function findRoomByCode(code: string): Promise<RoomData | null> {
  const cleanCode = code.trim().toUpperCase();
  const roomRef = doc(db, 'rooms', cleanCode);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) return null;
  return snap.data() as RoomData;
}

export function subscribeToRoom(roomId: string, callback: (room: RoomData | null) => void): () => void {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(
    roomRef,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
      } else {
        callback(snap.data() as RoomData);
      }
    },
    (err) => {
      console.warn('Firestore room subscription error:', err);
      callback(null);
    }
  );
}
