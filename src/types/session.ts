export interface SessionSummary {
  roomId: string;
  mood: string;
  duration: number;
  participantsCount: number;
  messagesCount?: number;
  joinedAt: string;
  leftAt: string;
  userName: string;
  userId: string;
} 