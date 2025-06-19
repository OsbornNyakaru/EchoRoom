import { ChatMessage, MessageReaction } from './chat';
import { Participant, RoomInfo, SessionPhase } from './room';

export interface SocketEvents {
  // Room events
  'join-room': (data: { roomId: string, userId: string, mood: string }) => void;
  'leave-room': (data: { roomId: string, userId: string }) => void;
  'room-joined': (data: { participants: Participant[], roomInfo: RoomInfo }) => void;
  
  // Chat events
  'send-message': (message: ChatMessage) => void;
  'receive-message': (message: ChatMessage) => void;
  'typing-start': (data: { userId: string, userName: string }) => void;
  'typing-stop': (data: { userId: string }) => void;
  'message-reaction': (data: { messageId: string, reaction: MessageReaction, userId: string }) => void;
  
  // Voice events
  'voice-status': (data: { userId: string, isSpeaking: boolean, isMuted: boolean }) => void;
  'ai-prompt': (data: { prompt: string, timestamp: Date }) => void;
  
  // Session events
  'session-update': (data: { timeRemaining: number, phase: SessionPhase }) => void;
  'session-end': () => void;
} 