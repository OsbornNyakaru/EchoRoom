import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import { Socket } from 'socket.io-client';
import { Participant, RoomInfo, JoinRoomData, SessionPhase } from '../types/room';
import { ChatMessage, TypingUser } from '../types/chat';
import socket from '../lib/socket'; // Import the shared socket instance
import { generateAnonymousUserName } from '../lib/utils'; // Import the new utility

interface SocketContextType {
  socket: typeof Socket | null;
  isConnected: boolean;
  roomId: string | null;
  participants: Participant[];
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  userId: string;
  userName: string;
  joinRoom: (roomData: JoinRoomData) => void;
  leaveRoom: () => void;
  sendMessage: (content: string, type?: 'text' | 'system' | 'ai-prompt' | 'mood-check') => void;
  sendReaction: (messageId: string, emoji: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  updateVoiceStatus: (isSpeaking: boolean, isMuted: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useSocket();
  
  const [roomId, setRoomId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const userIdRef = useRef<string>(localStorage.getItem('echoroom_userId') || `user-${Math.random().toString(36).substring(2, 9)}`);
  const userNameRef = useRef<string>(localStorage.getItem('echoroom_userName') || generateAnonymousUserName());

  // Persist userId and userName in localStorage
  useEffect(() => {
    localStorage.setItem('echoroom_userId', userIdRef.current);
    localStorage.setItem('echoroom_userName', userNameRef.current);
  }, []);

  // Event Emitters (Frontend -> Backend)
  const joinRoom = useCallback((roomData: JoinRoomData) => {
    if (socket) {
      const dataToSend = { ...roomData, userId: userIdRef.current, userName: userNameRef.current };
      console.log('[SocketContext] Emitting joinRoom with data:', dataToSend);
      socket.emit('joinRoom', dataToSend);
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (socket && roomId) {
      const dataToSend = { roomId, userId: userIdRef.current };
      console.log('[SocketContext] Emitting leaveRoom with data:', dataToSend);
      socket.emit('leaveRoom', dataToSend);
      setRoomId(null);
      setParticipants([]);
      setMessages([]);
      setTypingUsers([]);
    }
  }, [roomId]);

  const sendMessage = useCallback((content: string, type: 'text' | 'system' | 'ai-prompt' | 'mood-check' = 'text') => {
    if (socket && roomId) {
      const messagePayload = {
        session_id: roomId,
        sender: userNameRef.current,
        text: content,
        userId: userIdRef.current,
      };
      console.log('[SocketContext] Emitting sendMessage with payload:', messagePayload);
      socket.emit('sendMessage', messagePayload);
    }
  }, [roomId]);

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    if (socket) {
      const dataToSend = { messageId, reaction: emoji, userId: userIdRef.current };
      console.log('[SocketContext] Emitting message-reaction with data:', dataToSend);
      socket.emit('message-reaction', dataToSend);
    }
  }, []);

  const startTyping = useCallback(() => {
    if (socket && roomId) {
      const dataToSend = { roomId, userId: userIdRef.current, userName: userNameRef.current };
      console.log('[SocketContext] Emitting typing-start with data:', dataToSend);
      socket.emit('typing-start', dataToSend);
    }
  }, [roomId]);

  const stopTyping = useCallback(() => {
    if (socket && roomId) {
      const dataToSend = { roomId, userId: userIdRef.current };
      console.log('[SocketContext] Emitting typing-stop with data:', dataToSend);
      socket.emit('typing-stop', dataToSend);
    }
  }, [roomId]);

  const updateVoiceStatus = useCallback((isSpeaking: boolean, isMuted: boolean) => {
    if (socket) {
      const dataToSend = { userId: userIdRef.current, isSpeaking, isMuted };
      console.log('[SocketContext] Emitting voice-status with data:', dataToSend);
      socket.emit('voice-status', dataToSend);
    }
  }, []);

  // Event Listeners (Backend -> Frontend)
  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = (data: { participants: Participant[], roomInfo: RoomInfo }) => {
      console.log('[SocketContext] Received room-joined', data);
      setRoomId(data.roomInfo.roomId);
      // Ensure the current user is added to participants if not already there
      const currentParticipant: Participant = {
        userId: userIdRef.current,
        userName: userNameRef.current,
        avatar: '/avatars/default-avatar.png',
        mood: data.roomInfo.mood,
        isSpeaking: false,
        isMuted: false,
      };
      setParticipants((prev) => {
        const existing = prev.find(p => p.userId === userIdRef.current);
        return existing ? prev : [...prev, currentParticipant];
      });
    };

    const handleReceiveMessage = (message: ChatMessage) => {
      console.log('[SocketContext] Received receiveMessage', message);
      setMessages((prev) => {
        const newMessages = [...prev, message];
        // Ensure unique messages if there's a chance of duplicates
        const uniqueMessages = Array.from(new Map(newMessages.map(item => [item['id'], item])).values());
        return uniqueMessages;
      });
    };

    const handleTypingStart = (data: { userId: string, userName: string }) => {
      console.log('[SocketContext] Received typing-start', data);
      setTypingUsers((prev) => {
        if (!prev.find((u) => u.userId === data.userId)) {
          return [...prev, { ...data, avatar: '/avatars/default-avatar.png', timestamp: new Date() }];
        }
        return prev;
      });
    };

    const handleTypingStop = (data: { userId: string }) => {
      console.log('[SocketContext] Received typing-stop', data);
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    const handleMessageReaction = (data: { messageId: string, reaction: string, userId: string }) => {
      console.log('[SocketContext] Received message-reaction', data);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === data.messageId
            ? {
                ...msg,
                reactions: msg.reactions.map((r) =>
                  r.emoji === data.reaction
                    ? { ...r, users: [...r.users, data.userId], count: r.count + 1 }
                    : r
                ), 
              }
            : msg
        )
      );
    };

    const handleSessionUpdate = (data: { timeRemaining: number, phase: SessionPhase }) => {
      console.log('[SocketContext] Received session-update', data);
    };

    const handleSessionEnd = () => {
      console.log('[SocketContext] Received session-end');
    };

    // Register listeners
    socket.on('room-joined', handleRoomJoined);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);
    socket.on('message-reaction', handleMessageReaction);
    socket.on('session-update', handleSessionUpdate);
    socket.on('session-end', handleSessionEnd);

    return () => {
      // Clean up listeners on unmount
      socket.off('room-joined', handleRoomJoined);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
      socket.off('message-reaction', handleMessageReaction);
      socket.off('session-update', handleSessionUpdate);
      socket.off('session-end', handleSessionEnd);
    };
  }, [socket]);

  const value = {
    socket,
    isConnected,
    roomId,
    participants,
    messages,
    typingUsers,
    userId: userIdRef.current,
    userName: userNameRef.current,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendReaction,
    startTyping,
    stopTyping,
    updateVoiceStatus,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}; 