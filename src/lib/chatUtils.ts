import { ChatMessage, TypingUser } from '../types/chat';

export const formatMessageTimestamp = (timestamp: Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getTypingUsersText = (typingUsers: TypingUser[]): string => {
  if (typingUsers.length === 0) {
    return '';
  }
  if (typingUsers.length === 1) {
    return `${typingUsers[0].userName} is typing...`;
  }
  return 'Multiple users are typing...';
}; 