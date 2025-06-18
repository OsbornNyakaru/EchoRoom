import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '../context/SocketContext';
import ChatWindow from '../components/chat/ChatWindow';
import TavusAvatarCard from '../components/TavusAvatarCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MessageSquare, 
  Users, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  LogOut, 
  Clock, 
  Sparkles,
  Heart,
  Coffee,
  Star,
  Moon,
  Sun,
  Smile,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { playZoom } from '../lib/soundUtils';

interface VoiceIndicatorProps {
  isSpeaking: boolean;
  isMuted: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isSpeaking, isMuted, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className="flex items-center gap-0.5">
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

const getMoodIcon = (mood: string) => {
  const icons = {
    hopeful: Sun,
    lonely: Moon,
    motivated: Zap,
    calm: Coffee,
    loving: Heart,
    joyful: Sparkles,
  };
  return icons[mood?.toLowerCase() as keyof typeof icons] || Coffee;
};

const getMoodColor = (mood: string) => {
  const colors = {
    hopeful: '#FFE66D',
    lonely: '#8E9AAF',
    motivated: '#FFB4A2',
    calm: '#A3C4BC',
    loving: '#FF8FA3',
    joyful: '#FFD93D',
  };
  return colors[mood?.toLowerCase() as keyof typeof colors] || '#A3C4BC';
};

const ParticipantCard: React.FC<{ participant: any; isCurrentUser: boolean }> = ({ 
  participant, 
  isCurrentUser 
}) => {
  const moodColor = getMoodColor(participant.mood);
  const MoodIcon = getMoodIcon(participant.mood);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="glass-card p-4 rounded-2xl relative overflow-hidden group hover:scale-105 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${moodColor}15 0%, rgba(255, 255, 255, 0.05) 100%)`,
        border: `1px solid ${moodColor}30`,
      }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${moodColor}40 0%, transparent 70%)`,
        }}
      />

      {isCurrentUser && (
        <motion.div 
          className="absolute top-2 right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" />
            You
          </div>
        </motion.div>
      )}
      
      <div className="flex flex-col items-center space-y-3 relative z-10">
        <div className="relative">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="w-16 h-16 border-2 border-white/20 shadow-lg">
              <AvatarImage src={participant.avatar} alt={participant.userName} />
              <AvatarFallback 
                style={{ backgroundColor: moodColor + '40' }}
                className="text-white font-semibold"
              >
                {participant.userName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            {/* Breathing animation for speaking */}
            {participant.isSpeaking && !participant.isMuted && (
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: moodColor }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.div>
          
          {/* Voice status indicator */}
          <motion.div 
            className="absolute -bottom-1 -right-1"
            whileHover={{ scale: 1.1 }}
          >
            <div 
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg',
                participant.isMuted ? 'bg-red-500' : 'bg-green-500'
              )}
            >
              {participant.isMuted ? (
                <MicOff className="w-3 h-3 text-white" />
              ) : (
                <Mic className="w-3 h-3 text-white" />
              )}
            </div>
          </motion.div>
        </div>

        <div className="text-center">
          <h3 className="text-white font-semibold text-sm truncate max-w-[120px] mb-1">
            {participant.userName || `User ${participant.userId?.substring(0, 5)}`}
          </h3>
          <div className="flex items-center justify-center gap-1 text-xs">
            <MoodIcon className="w-3 h-3" style={{ color: moodColor }} />
            <span className="text-gray-300 capitalize">
              {participant.mood || 'calm'}
            </span>
          </div>
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

const Room: React.FC = () => {
  const { socket, isConnected, roomId, participants, joinRoom, leaveRoom, userId, userName } = useSocketContext();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const mood = searchParams.get("mood") || "calm";

  const [currentView, setCurrentView] = useState<'chat' | 'participants'>('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [sessionTime, setSessionTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [hasPlayedZoom, setHasPlayedZoom] = useState(false);
  
  // Tavus Avatar state
  const [isTavusOpen, setIsTavusOpen] = useState(false);

  const moodColor = getMoodColor(mood);
  const MoodIcon = getMoodIcon(mood);

  // Update connection status based on socket state
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
      setIsLoading(false);
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected]);

  // Play zoom sound when successfully connected to room
  useEffect(() => {
    if (roomId && isConnected && !hasPlayedZoom) {
      const timer = setTimeout(() => {
        playZoom();
        setHasPlayedZoom(true);
      }, 800); // Delay to ensure room is fully loaded

      return () => clearTimeout(timer);
    }
  }, [roomId, isConnected, hasPlayedZoom]);

  // Session timer
  useEffect(() => {
    if (roomId) {
      const timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [roomId]);

  // Auto-join room based on mood
  useEffect(() => {
    const autoJoinRoom = async () => {
      if (!isConnected || !userId || !userName || roomId) return;

      try {
        console.log('[Room.tsx] Auto-joining room for mood:', mood);
        const response = await fetch('http://localhost:5000/api/sessions');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const sessions = await response.json();
        const matchingSession = sessions.find((s: any) => 
          s.category.toLowerCase() === mood.toLowerCase()
        );

        if (matchingSession) {
          joinRoom({
            roomId: matchingSession.id,
            userId: userId,
            userName: userName,
            mood: mood
          });
        }
      } catch (error) {
        console.error('[Room.tsx] Error auto-joining room:', error);
      }
    };

    autoJoinRoom();
  }, [isConnected, userId, userName, mood, roomId, joinRoom]);

  // Handle leaving room
  const handleLeaveRoom = useCallback(() => {
    leaveRoom();
    navigate('/');
  }, [leaveRoom, navigate]);

  // Format session time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tavus Avatar handlers
  const handleTavusToggle = () => {
    setIsTavusOpen(!isTavusOpen);
  };

  const handleTavusClose = () => {
    setIsTavusOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <motion.div 
          className="glass-card p-8 rounded-2xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white text-lg">Connecting to your {mood} room...</p>
          <p className="text-gray-400 text-sm mt-2">Finding the perfect space for you</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg grid-pattern">
      <div className="flex flex-col h-screen">
        {/* Enhanced Header */}
        <motion.header 
          className="p-4 md:p-6 border-b border-white/10 bg-black/20 backdrop-blur-sm"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: moodColor + '20', border: `2px solid ${moodColor}40` }}
                >
                  <MoodIcon className="w-6 h-6" style={{ color: moodColor }} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white capitalize">
                    {mood} Room
                  </h1>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                        connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
                      )} />
                      <span className="text-gray-300">
                        {connectionStatus === 'connected' ? 'Connected' : 
                         connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                      </span>
                    </div>
                    {roomId && (
                      <>
                        <span className="text-gray-500">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300">{formatTime(sessionTime)}</span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300">{participants.length} online</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Voice Controls */}
              <motion.div 
                className="hidden md:flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "glass-card border-white/20 text-white hover:bg-white/10",
                    isMuted && "bg-red-500/20 border-red-400/50 text-red-400"
                  )}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <Button
                  onClick={() => setIsDeafened(!isDeafened)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "glass-card border-white/20 text-white hover:bg-white/10",
                    isDeafened && "bg-red-500/20 border-red-400/50 text-red-400"
                  )}
                >
                  {isDeafened ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </motion.div>

              <Button
                onClick={handleLeaveRoom}
                variant="outline"
                className="glass-card border-red-400/30 text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </motion.header>

        {/* View Toggles for Mobile */}
        <motion.div 
          className="md:hidden flex justify-center gap-2 p-4 bg-black/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => setCurrentView('participants')}
            variant={currentView === 'participants' ? 'default' : 'outline'}
            className="flex items-center gap-2 glass-card"
            style={{
              backgroundColor: currentView === 'participants' ? moodColor + '40' : 'transparent',
              borderColor: moodColor + '30'
            }}
          >
            <Users className="h-4 w-4" /> 
            Participants ({participants.length})
          </Button>
          <Button
            onClick={() => setCurrentView('chat')}
            variant={currentView === 'chat' ? 'default' : 'outline'}
            className="flex items-center gap-2 glass-card"
            style={{
              backgroundColor: currentView === 'chat' ? moodColor + '40' : 'transparent',
              borderColor: moodColor + '30'
            }}
          >
            <MessageSquare className="h-4 w-4" /> 
            Chat
          </Button>
        </motion.div>

        {/* Main Room Layout */}
        {roomId ? (
          <div className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 p-4 md:p-6 min-h-0">
            {/* Left Side: Participant Grid */}
            <motion.div 
              className={cn(
                'md:col-span-2 relative',
                currentView === 'chat' ? 'hidden md:block' : ''
              )}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants ({participants.length})
                  </h2>
                  <motion.div
                    className="flex items-center gap-1 text-sm text-gray-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Activity className="w-4 h-4" />
                    Live
                  </motion.div>
                </div>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                  {participants.length === 0 ? (
                    <motion.div 
                      className="flex flex-col items-center justify-center h-full text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="glass-card p-8 rounded-2xl">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-gray-400 text-lg">Waiting for others to join...</p>
                        <p className="text-gray-500 text-sm mt-2">Your conversation will begin shortly</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {participants.map((participant, index) => (
                          <motion.div
                            key={participant.userId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <ParticipantCard
                              participant={participant}
                              isCurrentUser={participant.userId === userId}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Side: Enhanced Chat Window */}
            <motion.div 
              className={cn(
                'md:col-span-3 min-h-0',
                currentView === 'participants' ? 'hidden md:block' : ''
              )}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <ChatWindow />
            </motion.div>
          </div>
        ) : (
          <motion.div 
            className="flex-grow flex items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card p-8 rounded-2xl text-center max-w-md">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Connecting to Room</h3>
              <p className="text-gray-300 mb-4">
                We're finding the perfect {mood} space for you to connect with others.
              </p>
              <Button
                onClick={() => navigate(`/welcome?mood=${encodeURIComponent(mood)}`)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                Go to Welcome Page
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Mobile Voice Controls */}
        <motion.div 
          className="md:hidden p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              className={cn(
                "glass-card border-white/20 text-white hover:bg-white/10 flex-1 max-w-[120px]",
                isMuted && "bg-red-500/20 border-red-400/50 text-red-400"
              )}
            >
              {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            
            <Button
              onClick={() => setIsDeafened(!isDeafened)}
              variant="outline"
              className={cn(
                "glass-card border-white/20 text-white hover:bg-white/10 flex-1 max-w-[120px]",
                isDeafened && "bg-red-500/20 border-red-400/50 text-red-400"
              )}
            >
              {isDeafened ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
              {isDeafened ? 'Undeafen' : 'Deafen'}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Tavus Avatar Card */}
      <TavusAvatarCard
        mood={mood}
        isOpen={isTavusOpen}
        onToggle={handleTavusToggle}
        onClose={handleTavusClose}
      />
    </div>
  );
};

export default Room;