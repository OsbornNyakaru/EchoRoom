export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  type: 'text' | 'system' | 'ai-prompt' | 'mood-check';
  timestamp: Date;
  reactions: MessageReaction[];
  isEdited?: boolean;
  replyTo?: string;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface TypingUser {
  userId: string;
  userName: string;
  avatar: string;
  timestamp: Date;
} 