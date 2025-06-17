import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import { Socket } from 'socket.io-client';
import { Participant, RoomInfo, JoinRoomData, SessionPhase } from '../types/room';
import { ChatMessage, TypingUser } from '../types/chat';
import socket from '../lib/socket';
import { generateAnonymousUserName } from '../lib/utils';

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
    if (socket && isConnected) {
      const dataToSend = { 
        session_id: roomData.roomId,
        user_id: userIdRef.current, 
        username: userNameRef.current,
        mood: roomData.mood
      };
      console.log('[SocketContext] Emitting joinRoom with data:', dataToSend);
      socket.emit('joinRoom', dataToSend);
    } else {
      console.warn('[SocketContext] Cannot join room: socket not connected');
    }
  }, [isConnected]);

  const leaveRoom = useCallback(() => {
    if (socket && roomId && isConnected) {
      const dataToSend = { 
        session_id: roomId, 
        user_id: userIdRef.current 
      };
      console.log('[SocketContext] Emitting leaveRoom with data:', dataToSend);
      socket.emit('leaveRoom', dataToSend);
      
      // Clear local state
      setRoomId(null);
      setParticipants([]);
      setMessages([]);
      setTypingUsers([]);
    }
  }, [roomId, isConnected]);

  const sendMessage = useCallback((content: string, type: 'text' | 'system' | 'ai-prompt' | 'mood-check' = 'text') => {
    if (socket && roomId && isConnected) {
      const messagePayload = {
        session_id: roomId,
        sender: userNameRef.current,
        text: content,
        user_id: userIdRef.current,
        type: type
      };
      console.log('[SocketContext] Emitting sendMessage with payload:', messagePayload);
      socket.emit('sendMessage', messagePayload);
    }
  }, [roomId, isConnected]);

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    if (socket && isConnected) {
      const dataToSend = { 
        messageId, 
        reaction: emoji, 
        userId: userIdRef.current 
      };
      console.log('[SocketContext] Emitting message-reaction with data:', dataToSend);
      socket.emit('message-reaction', dataToSend);
    }
  }, [isConnected]);

  const startTyping = useCallback(() => {
    if (socket && roomId && isConnected) {
      const dataToSend = { 
        session_id: roomId, 
        user_id: userIdRef.current, 
        username: userNameRef.current 
      };
      console.log('[SocketContext] Emitting typing-start with data:', dataToSend);
      socket.emit('typing-start', dataToSend);
    }
  }, [roomId, isConnected]);

  const stopTyping = useCallback(() => {
    if (socket && roomId && isConnected) {
      const dataToSend = { 
        session_id: roomId, 
        user_id: userIdRef.current 
      };
      console.log('[SocketContext] Emitting typing-stop with data:', dataToSend);
      socket.emit('typing-stop', dataToSend);
    }
  }, [roomId, isConnected]);

  const updateVoiceStatus = useCallback((isSpeaking: boolean, isMuted: boolean) => {
    if (socket && isConnected) {
      const dataToSend = { 
        userId: userIdRef.current, 
        isSpeaking, 
        isMuted 
      };
      console.log('[SocketContext] Emitting voice-status with data:', dataToSend);
      socket.emit('voice-status', dataToSend);
      
      // Update local participant state immediately for better UX
      setParticipants(prev => 
        prev.map(p => 
          p.userId === userIdRef.current 
            ? { ...p, isSpeaking, isMuted }
            : p
        )
      );
    }
  }, [isConnected]);

  // Event Listeners (Backend -> Frontend)
  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = (data: any) => {
      console.log('[SocketContext] Received room-joined', data);
      
      if (data.session_id) {
        setRoomId(data.session_id);
      }
      
      // Handle participants data
      if (data.participants) {
        setParticipants(data.participants);
      } else if (data.users) {
        // Convert users array to participants format
        const convertedParticipants = data.users.map((user: any) => ({
          userId: user.user_id || user.id,
          userName: user.username || user.name,
          avatar: user.avatar || '/avatars/default-avatar.png',
          mood: user.mood || 'calm',
          isSpeaking: false,
          isMuted: false,
        }));
        setParticipants(convertedParticipants);
      }
    };

    const handleReceiveMessage = (data: any) => {
      console.log('[SocketContext] Received receiveMessage', data);
      
      const message: ChatMessage = {
        id: data.id || `msg-${Date.now()}-${Math.random()}`,
        userId: data.user_id || data.sender_id,
        userName: data.sender || data.username,
        avatar: data.avatar || '/avatars/default-avatar.png',
        content: data.text || data.message || data.content,
        type: data.type || 'text',
        timestamp: new Date(data.timestamp || data.created_at || Date.now()),
        reactions: data.reactions || [],
        isEdited: data.is_edited || false,
        replyTo: data.reply_to
      };
      
      setMessages(prev => {
        // Prevent duplicate messages
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    const handleUserJoined = (data: any) => {
      console.log('[SocketContext] Received user-joined', data);
      
      const newParticipant: Participant = {
        userId: data.user_id || data.id,
        userName: data.username || data.name,
        avatar: data.avatar || '/avatars/default-avatar.png',
        mood: data.mood || 'calm',
        isSpeaking: false,
        isMuted: false,
      };
      
      setParticipants(prev => {
        const exists = prev.some(p => p.userId === newParticipant.userId);
        if (exists) return prev;
        return [...prev, newParticipant];
      });
    };

    const handleUserLeft = (data: any) => {
      console.log('[SocketContext] Received user-left', data);
      const userId = data.user_id || data.id;
      setParticipants(prev => prev.filter(p => p.userId !== userId));
    };

    const handleTypingStart = (data: any) => {
      console.log('[SocketContext] Received typing-start', data);
      const typingUser: TypingUser = {
        userId: data.user_id || data.userId,
        userName: data.username || data.userName,
        avatar: data.avatar || '/avatars/default-avatar.png',
        timestamp: new Date()
      };
      
      setTypingUsers(prev => {
        const exists = prev.some(u => u.userId === typingUser.userId);
        if (exists) return prev;
        return [...prev, typingUser];
      });
    };

    const handleTypingStop = (data: any) => {
      console.log('[SocketContext] Received typing-stop', data);
      const userId = data.user_id || data.userId;
      setTypingUsers(prev => prev.filter(u => u.userId !== userId));
    };

    const handleVoiceStatus = (data: any) => {
      console.log('[SocketContext] Received voice-status', data);
      const { user_id, isSpeaking, isMuted } = data;
      
      setParticipants(prev =>
        prev.map(p =>
          p.userId === user_id
            ? { ...p, isSpeaking: isSpeaking || false, isMuted: isMuted || false }
            : p
        )
      );
    };

    const handleError = (error: any) => {
      console.error('[SocketContext] Socket error:', error);
    };

    const handleDisconnect = (reason: string) => {
      console.log('[SocketContext] Socket disconnected:', reason);
      // Clear state on disconnect
      setRoomId(null);
      setParticipants([]);
      setMessages([]);
      setTypingUsers([]);
    };

    // Register all event listeners
    socket.on('room-joined', handleRoomJoined);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);
    socket.on('voice-status', handleVoiceStatus);
    socket.on('error', handleError);
    socket.on('disconnect', handleDisconnect);

    // Cleanup listeners
    return () => {
      socket.off('room-joined', handleRoomJoined);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
      socket.off('voice-status', handleVoiceStatus);
      socket.off('error', handleError);
      socket.off('disconnect', handleDisconnect);
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