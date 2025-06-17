export interface Participant {
  userId: string;
  userName: string;
  avatar: string;
  mood: string;
  isSpeaking: boolean;
  isMuted: boolean;
}

export interface RoomInfo {
  roomId: string;
  name: string;
  mood: string;
  createdAt: Date;
}

export interface JoinRoomData {
  roomId: string;
  userId: string;
  userName: string;
  mood: string;
}

export type SessionPhase = 'introduction' | 'discussion' | 'reflection' | 'conclusion'; 