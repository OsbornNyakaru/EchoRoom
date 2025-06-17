import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '../context/SocketContext';
import ChatWindow from '../components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, Users, Mic, MicOff, Volume2, VolumeX, Settings, LogOut, Clock, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatSession {
  id: string;
  category: string;
  created_at: string;
  description: string | null;
}

interface VoiceIndicatorProps {
  isSpeaking: boolean;
  isMuted: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isSpeaking, isMuted, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'bg-current rounded-full',
            sizeClasses[size],
            isMuted ? 'opacity-30' : 'opacity-70'
          )}
          animate={
            isSpeaking && !isMuted
              ? {
                  scaleY: [0.5, 1.5, 0.5],
                  opacity: [0.5, 1, 0.5],
                }
              : { scaleY: 0.5, opacity: 0.3 }
          }
          transition={{
            duration: 0.6,
            repeat: isSpeaking && !isMuted ? Infinity : 0,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

const ParticipantCard: React.FC<{ participant: any; isCurrentUser: boolean }> = ({ 
  participant, 
  isCurrentUser 
}) => {
  const moodColors = {
    hopeful: '#FFE66D',
    lonely: '#8E9AAF',
    motivated: '#FFB4A2',
    calm: '#A3C4BC',
    loving: '#FF8FA3',
    joyful: '#FFD93D',
    books: '#9B59B6',
  };

  const moodColor = moodColors[participant.mood?.toLowerCase() as keyof typeof moodColors] || '#A3C4BC';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card p-4 rounded-2xl relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${moodColor}15 0%, rgba(255, 255, 255, 0.05) 100%)`,
        border: `1px solid ${moodColor}30`,
      }}
    >
      {isCurrentUser && (
        <div className="absolute top-2 right-2">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            You
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <Avatar className="w-16 h-16 border-2 border-white/20">
            <AvatarImage src={participant.avatar} alt={participant.userName} />
            <AvatarFallback style={{ backgroundColor: moodColor + '40' }}>
              {participant.userName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {/* Voice status indicator */}
          <div className="absolute -bottom-1 -right-1">
            <div 
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                participant.isMuted ? 'bg-red-500' : 'bg-green-500'
              )}
            >
              {participant.isMuted ? (
                <MicOff className="w-3 h-3 text-white" />
              ) : (
                <Mic className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-white font-semibold text-sm truncate max-w-[120px]">
            {participant.userName || `User ${participant.userId?.substring(0, 5)}`}
          </h3>
          <p className="text-xs text-gray-300 capitalize">
            {participant.mood || 'calm'}
          </p>
        </div>

        {/* Voice activity indicator */}
        <div className="flex items-center justify-center h-6" style={{ color: moodColor }}>
          <VoiceIndicator 
            isSpeaking={participant.isSpeaking} 
            isMuted={participant.isMuted} 
            size="sm"
          />
        </div>
      </div>
    </motion.div>
  );
};

const ParticipantGrid: React.FC<{ participants: any[]; currentUserId: string }> = ({ 
  participants, 
  currentUserId 
}) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
        <Users className="h-6 w-6" />
        Participants ({participants.length})
      </h2>
    </div>
    
    <div className="flex-grow overflow-y-auto custom-scrollbar">
      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="glass-card p-8 rounded-2xl">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Waiting for others to join...</p>
            <p className="text-gray-500 text-sm mt-2">Your conversation will begin shortly</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence>
            {participants.map((participant) => (
              <ParticipantCard
                key={participant.userId}
                participant={participant}
                isCurrentUser={participant.userId === currentUserId}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  </div>
);

const SessionSelector: React.FC<{
  sessions: ChatSession[];
  activeSessionId: string | null;
  onJoinSession: (sessionId: string, sessionCategory: string) => void;
  isConnected: boolean;
}> = ({ sessions, activeSessionId, onJoinSession, isConnected }) => {
  const moodColors = {
    hopeful: '#FFE66D',
    lonely: '#8E9AAF',
    motivated: '#FFB4A2',
    calm: '#A3C4BC',
    loving: '#FF8FA3',
    joyful: '#FFD93D',
    books: '#9B59B6',
  };

  const moodEmojis = {
    hopeful: '🌅',
    lonely: '🌙',
    motivated: '⚡',
    calm: '🧘',
    loving: '💝',
    joyful: '✨',
    books: '📚',
  };

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-center text-white mb-6 flex items-center justify-center gap-2">
        <Sparkles className="h-8 w-8 text-yellow-400" />
        Choose Your Room
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          const categoryLower = session.category.toLowerCase();
          const moodColor = moodColors[categoryLower as keyof typeof moodColors] || '#A3C4BC';
          const emoji = moodEmojis[categoryLower as keyof typeof moodEmojis] || '🌟';
          
          return (
            <motion.button
              key={session.id}
              onClick={() => onJoinSession(session.id, session.category)}
              disabled={!isConnected}
              className={cn(
                'glass-card p-4 rounded-2xl text-center transition-all duration-300 relative overflow-hidden',
                isActive ? 'ring-2 ring-white/50 scale-105' : 'hover:scale-105',
                !isConnected && 'opacity-50 cursor-not-allowed'
              )}
              style={{
                background: isActive 
                  ? `linear-gradient(135deg, ${moodColor}40 0%, ${moodColor}20 100%)`
                  : `linear-gradient(135deg, ${moodColor}20 0%, rgba(255, 255, 255, 0.05) 100%)`,
                border: `1px solid ${moodColor}${isActive ? '60' : '30'}`,
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">{emoji}</div>
              <h3 className="text-white font-semibold text-sm mb-1">
                {session.category}
              </h3>
              {session.description && (
                <p className="text-xs text-gray-300 leading-tight">
                  {session.description}
                </p>
              )}
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const Room: React.FC = () => {
  const { socket, isConnected, roomId, participants, joinRoom, leaveRoom, userId, userName } = useSocketContext();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const mood = searchParams.get("mood") || "calm";

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'participants'>('participants');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // Update connection status based on socket state
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected]);

  // Fetch sessions from backend
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        console.log('[Room.tsx] Fetching sessions from backend...');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/sessions`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ChatSession[] = await response.json();
        console.log('[Room.tsx] Fetched sessions:', data);
        setSessions(data);

        // Auto-join based on mood if available
        if (mood && data.length > 0 && !activeSessionId) {
          const sessionForMood = data.find(s => s.category.toLowerCase() === mood.toLowerCase());
          if (sessionForMood) {
            console.log(`[Room.tsx] Auto-joining session for mood "${mood}": ${sessionForMood.id}`);
            handleJoinSession(sessionForMood.id, sessionForMood.category);
          }
        }
      } catch (error) {
        console.error('[Room.tsx] Error fetching sessions:', error);
        // Fallback to hardcoded sessions if API fails
        const fallbackSessions: ChatSession[] = [
          {
            id: "3c0baaf2-45d5-4986-8a56-e205ad9e1c4f",
            category: "Motivated",
            created_at: "2025-06-12T17:33:55.574268+00:00",
            description: "Ready to take on challenges"
          },
          {
            id: "9dcaa32f-b371-4ebf-9153-8747a16e19b2",
            category: "Hopeful",
            created_at: "2025-06-12T17:33:55.574268+00:00",
            description: "Looking forward with optimism"
          },
          {
            id: "ad209c8b-dde1-44e7-8642-7da4e1f8cfe3",
            category: "Lonely",
            created_at: "2025-06-12T17:33:55.574268+00:00",
            description: "Seeking connection and understanding"
          },
          {
            id: "cd90792e-bb54-4a5b-b1b9-59fb27fbc49f",
            category: "Joyful",
            created_at: "2025-06-12T17:33:55.574268+00:00",
            description: "Filled with happiness and gratitude"
          },
          {
            id: "647161c4-0bfc-4142-9f7a-fc6eefb17325",
            category: "Calm",
            created_at: "2025-06-12T17:33:55.574268+00:00",
            description: "Finding peace in the moment"
          },
          {
            id: "5b169685-1790-493e-a569-3aeec7b60b33",
            category: "Loving",
            created_at: "2025-06-12T17:33:55.574268+00:00",
            description: "Embracing warmth and compassion"
          },
          {
            id: "60df81b2-2d61-47fa-8988-9165d3b3f793",
            category: "Books",
            created_at: "2025-06-08T14:26:03.683316+00:00",
            description: null
          }
        ];
        setSessions(fallbackSessions);
        console.log('[Room.tsx] Using fallback sessions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [mood]);

  // Handle joining a session
  const handleJoinSession = useCallback((sessionId: string, sessionCategory: string) => {
    if (!socket || !userId || !userName || !isConnected) {
      console.warn('[Room.tsx] Cannot join: Socket not connected or user info missing.');
      return;
    }
    
    if (activeSessionId !== sessionId) {
      console.log(`[Room.tsx] Joining session: ${sessionId} (Category: ${sessionCategory})`);
      setActiveSessionId(sessionId);
      joinRoom({ roomId: sessionId, userId: userId, userName: userName, mood: sessionCategory });
    }
  }, [activeSessionId, joinRoom, userId, userName, socket, isConnected]);

  // Handle leaving room
  const handleLeaveRoom = useCallback(() => {
    leaveRoom();
    setActiveSessionId(null);
    navigate('/');
  }, [leaveRoom, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg grid-pattern">
      <div className="flex flex-col h-screen p-4 md:p-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Your <span className="capitalize text-gradient">{mood}</span> Space
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
                )} />
                <span className="text-gray-300">
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </span>
                {connectionStatus === 'connected' ? (
                  <Wifi className="h-4 w-4 text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-400" />
                )}
              </div>
            </div>
            
            <Button
              onClick={handleLeaveRoom}
              variant="outline"
              className="glass-card border-red-400/30 text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </header>

        {/* Session Selector */}
        <SessionSelector
          sessions={sessions}
          activeSessionId={activeSessionId}
          onJoinSession={handleJoinSession}
          isConnected={isConnected}
        />

        {/* View Toggles for Mobile */}
        <div className="md:hidden flex justify-center gap-2 mb-4">
          <Button
            onClick={() => setCurrentView('participants')}
            variant={currentView === 'participants' ? 'default' : 'outline'}
            className="flex items-center gap-2 glass-card"
          >
            <Users className="h-4 w-4" /> 
            Participants ({participants.length})
          </Button>
          <Button
            onClick={() => setCurrentView('chat')}
            variant={currentView === 'chat' ? 'default' : 'outline'}
            className="flex items-center gap-2 glass-card"
          >
            <MessageSquare className="h-4 w-4" /> 
            Chat
          </Button>
        </div>

        {/* Main Room Layout */}
        {activeSessionId ? (
          <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-6 min-h-0">
            {/* Left Side: Participant Grid */}
            <div className={cn(
              'md:col-span-2',
              currentView === 'chat' ? 'hidden md:block' : ''
            )}>
              <ParticipantGrid participants={participants} currentUserId={userId} />
            </div>

            {/* Right Side: Chat Window */}
            <div className={cn(
              'md:col-span-3 min-h-0',
              currentView === 'participants' ? 'hidden md:block' : ''
            )}>
              <ChatWindow />
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <Card className="glass-card p-8 rounded-2xl text-center max-w-md">
              <Sparkles className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Choose a Room</h3>
              <p className="text-gray-300">
                Select a room above that matches your current mood to start connecting with others.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;