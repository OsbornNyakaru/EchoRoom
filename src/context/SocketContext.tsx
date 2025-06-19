import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import type { Socket } from 'socket.io-client';
import { Participant, RoomInfo, JoinRoomData, SessionPhase } from '../types/room';
import { ChatMessage, TypingUser } from '../types/chat';
import socket from '../lib/socket';
import { generateAnonymousUserName } from '../lib/utils';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  roomId: string | null;
  participants: Participant[];
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  userId: string;
  userName: string;
  setUserName: (name: string) => void;
  joinRoom: (roomData: JoinRoomData) => void;
  leaveRoom: () => void;
  sendMessage: (text: string, type?: 'text' | 'system' | 'ai-prompt' | 'mood-check') => void;
  sendReaction: (messageId: string, emoji: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  updateVoiceStatus: (isSpeaking: boolean, isMuted: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Generate a proper UUID v4
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers - generates RFC 4122 compliant UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Validate UUID format
const isValidUUID = (uuid: string): boolean => {
  return typeof uuid === 'string' && UUID_REGEX.test(uuid);
};

// Clear any existing old-format userIds from localStorage
const clearOldUserData = () => {
  const existingUserId = localStorage.getItem('echoroom_userId');
  if (existingUserId && !isValidUUID(existingUserId)) {
    console.log('[SocketContext] Clearing old format userId:', existingUserId);
    localStorage.removeItem('echoroom_userId');
    localStorage.removeItem('echoroom_userName');
  }
};

// Initialize user ID with proper validation
const initializeUserId = (): string => {
  // Clear old data first
  clearOldUserData();
  
  const stored = localStorage.getItem('echoroom_userId');
  if (stored && isValidUUID(stored)) {
    console.log('[SocketContext] Using existing valid UUID:', stored);
    return stored;
  }
  
  const newUUID = generateUUID();
  console.log('[SocketContext] Generated new UUID:', newUUID);
  localStorage.setItem('echoroom_userId', newUUID);
  return newUUID;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useSocket();
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const [roomId, setRoomId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  
  // Initialize userId with proper validation
  const [userId] = useState<string>(() => initializeUserId());
  
  const [userName, setUserNameState] = useState<string>(
    localStorage.getItem('echoroom_userName') || generateAnonymousUserName()
  );

  // Persist userName in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('echoroom_userName', userName);
    console.log('[SocketContext] Persisted userName:', userName);
  }, [userName]);

  const setUserName = useCallback((name: string) => {
    setUserNameState(name);
    localStorage.setItem('echoroom_userName', name);
  }, []);

  // Event Emitters (Frontend -> Backend)
  const joinRoom = useCallback(async (roomData: JoinRoomData) => {
    if (socket && isConnected) {
      try {
        console.log('[SocketContext] Using userId for join:', userId);
        
        // Validate UUID format (should always be valid now, but double-check)
        if (!isValidUUID(userId)) {
          console.error('[SocketContext] Invalid UUID format:', userId);
          throw new Error('Invalid user ID format');
        }

        // First, create/update participant in database
        const participantData = {
          user_id: userId,
          session_id: roomData.roomId,
          user_name: roomData.userName,
          mood: roomData.mood,
          avatar: '/avatars/default-avatar.png',
          is_speaking: false,
          is_muted: false
        };

        console.log('[SocketContext] Creating participant in database:', participantData);

        const response = await fetch(`${backendUrl}/api/participants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(participantData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[SocketContext] Participant creation failed:', response.status, errorText);
          throw new Error(`Failed to create participant: ${response.status} - ${errorText}`);
        }

        const participant = await response.json();
        console.log('[SocketContext] Participant created successfully:', participant);

        // Then emit socket event to join room
        const dataToSend = { 
          session_id: roomData.roomId,
          user_id: userId, 
          username: roomData.userName,
          mood: roomData.mood
        };
        console.log('[SocketContext] Emitting joinRoom with data:', dataToSend);
        socket.emit('joinRoom', dataToSend);
        
      } catch (error) {
        console.error('[SocketContext] Error joining room:', error);
        throw error; // Re-throw to handle in UI
      }
    } else {
      console.warn('[SocketContext] Cannot join room: socket not connected');
      throw new Error('Socket not connected');
    }
  }, [isConnected, userId]);

  const leaveRoom = useCallback(async () => {
    if (socket && roomId && isConnected) {
      try {
        // Update participant status in database
        const response = await fetch(`${backendUrl}/api/participants/${userId}/${roomId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_speaking: false,
            is_muted: false
          }),
        });

        if (!response.ok) {
          console.warn('[SocketContext] Failed to update participant status on leave');
        }

        // Emit socket event to leave room
        const dataToSend = { 
          session_id: roomId, 
          user_id: userId 
        };
        console.log('[SocketContext] Emitting leaveRoom with data:', dataToSend);
        socket.emit('leaveRoom', dataToSend);
        
        // Clear local state
        setRoomId(null);
        setParticipants([]);
        setMessages([]);
        setTypingUsers([]);
      } catch (error) {
        console.error('[SocketContext] Error leaving room:', error);
      }
    }
  }, [roomId, isConnected, userId]);

  const sendMessage = useCallback((text: string, type: 'text' | 'system' | 'ai-prompt' | 'mood-check' = 'text') => {
    if (socket && roomId && isConnected) {
      const messagePayload = {
        session_id: roomId,
        sender: userName,
        text,
        user_id: userId,
        type: type
      };
      console.log('[SocketContext] Emitting sendMessage with payload:', messagePayload);
      socket.emit('sendMessage', messagePayload);
    }
  }, [roomId, isConnected, userName, userId]);

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    if (socket && isConnected) {
      const dataToSend = { 
        messageId, 
        reaction: emoji, 
        userId: userId 
      };
      console.log('[SocketContext] Emitting message-reaction with data:', dataToSend);
      socket.emit('message-reaction', dataToSend);
    }
  }, [isConnected, userId]);

  const startTyping = useCallback(() => {
    if (socket && roomId && isConnected) {
      const dataToSend = { 
        session_id: roomId, 
        user_id: userId, 
        username: userName 
      };
      console.log('[SocketContext] Emitting typing-start with data:', dataToSend);
      socket.emit('typing-start', dataToSend);
    }
  }, [roomId, isConnected, userName, userId]);

  const stopTyping = useCallback(() => {
    if (socket && roomId && isConnected) {
      const dataToSend = { 
        session_id: roomId, 
        user_id: userId 
      };
      console.log('[SocketContext] Emitting typing-stop with data:', dataToSend);
      socket.emit('typing-stop', dataToSend);
    }
  }, [roomId, isConnected, userId]);

  const updateVoiceStatus = useCallback(async (isSpeaking: boolean, isMuted: boolean) => {
    if (socket && isConnected && roomId) {
      try {
        // Update participant voice status in database
        const response = await fetch(`${backendUrl}/api/participants/${userId}/${roomId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_speaking: isSpeaking,
            is_muted: isMuted
          }),
        });

        if (!response.ok) {
          console.warn('[SocketContext] Failed to update voice status in database');
        }

        // Emit socket event
        const dataToSend = { 
          userId: userId, 
          isSpeaking, 
          isMuted 
        };
        console.log('[SocketContext] Emitting voice-status with data:', dataToSend);
        socket.emit('voice-status', dataToSend);
        
        // Update local participant state immediately for better UX
        setParticipants(prev => 
          prev.map(p => 
            p.userId === userId 
              ? { ...p, isSpeaking, isMuted }
              : p
          )
        );
      } catch (error) {
        console.error('[SocketContext] Error updating voice status:', error);
      }
    }
  }, [isConnected, roomId, userId]);

  // Event Listeners (Backend -> Frontend)
  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = (data: any) => {
      console.log('[SocketContext] Received room-joined', data);
      
      if (data.session_id) {
        setRoomId(data.session_id);
      }
      
      // Handle participants data from database
      if (data.participants) {
        const convertedParticipants = data.participants.map((participant: any) => ({
          userId: participant.user_id,
          userName: participant.user_name,
          avatar: participant.avatar || '/avatars/default-avatar.png',
          mood: participant.mood || 'calm',
          isSpeaking: participant.is_speaking || false,
          isMuted: participant.is_muted || false,
        }));
        setParticipants(convertedParticipants);
      } else if (data.users) {
        // Fallback for legacy format
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
        userName: data.username || data.user_name || data.name,
        avatar: data.avatar || '/avatars/default-avatar.png',
        mood: data.mood || 'calm',
        isSpeaking: data.is_speaking || false,
        isMuted: data.is_muted || false,
      };
      
      setParticipants(prev => {
        const exists = prev.some(p => p.userId === newParticipant.userId);
        if (exists) return prev;
        return [...prev, newParticipant];
      });
    };

    const handleUserLeft = (data: any) => {
      console.log('[SocketContext] Received user-left', data);
      const userIdToRemove = data.user_id || data.id;
      setParticipants(prev => prev.filter(p => p.userId !== userIdToRemove));
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
      const userIdToRemove = data.user_id || data.userId;
      setTypingUsers(prev => prev.filter(u => u.userId !== userIdToRemove));
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
    userId,
    userName,
    setUserName,
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