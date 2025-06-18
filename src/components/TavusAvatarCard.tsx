import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Bot, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Zap, 
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DailyIframe from '@daily-co/daily-js';

interface TavusAvatarCardProps {
  mood: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const TavusAvatarCard: React.FC<TavusAvatarCardProps> = ({ 
  mood, 
  isOpen, 
  onToggle, 
  onClose 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const callFrameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const moodColor = getMoodColor(mood);

  // Initialize Tavus conversation when component mounts
  useEffect(() => {
    const initializeTavusConversation = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        // Create Tavus conversation via backend
        const response = await fetch('/api/tavus/create-conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mood }),
        });

        if (!response.ok) {
          throw new Error('Failed to create Tavus conversation');
        }

        const data = await response.json();
        setConversationId(data.conversation_id);
        
      } catch (err) {
        console.error('Error initializing Tavus conversation:', err);
        setError('Failed to initialize AI avatar');
      } finally {
        setIsConnecting(false);
      }
    };

    if (isOpen && !conversationId) {
      initializeTavusConversation();
    }
  }, [isOpen, mood, conversationId]);

  // Initialize Daily call frame when conversation is ready
  useEffect(() => {
    const initializeDailyCall = async () => {
      if (!conversationId || !containerRef.current) return;

      try {
        setIsConnecting(true);

        // Get Daily room URL from backend
        const response = await fetch('/api/tavus/get-daily-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversation_id: conversationId }),
        });

        if (!response.ok) {
          throw new Error('Failed to get Daily room URL');
        }

        const { room_url } = await response.json();

        // Create Daily call frame
        callFrameRef.current = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '1rem',
          },
          showLeaveButton: false,
          showFullscreenButton: false,
          showLocalVideo: false,
          showParticipantsBar: false,
        });

        // Set up event listeners
        callFrameRef.current
          .on('joined-meeting', () => {
            setIsConnected(true);
            setIsConnecting(false);
          })
          .on('left-meeting', () => {
            setIsConnected(false);
          })
          .on('error', (error: any) => {
            console.error('Daily call error:', error);
            setError('Connection error occurred');
            setIsConnecting(false);
          });

        // Join the call
        await callFrameRef.current.join({ url: room_url });

      } catch (err) {
        console.error('Error initializing Daily call:', err);
        setError('Failed to connect to AI avatar');
        setIsConnecting(false);
      }
    };

    if (conversationId && isOpen) {
      initializeDailyCall();
    }

    // Cleanup
    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }
    };
  }, [conversationId, isOpen]);

  // Handle cleanup when closing
  const handleClose = async () => {
    try {
      if (callFrameRef.current) {
        await callFrameRef.current.leave();
        callFrameRef.current.destroy();
        callFrameRef.current = null;
      }

      if (conversationId) {
        // End Tavus conversation
        await fetch('/api/tavus/end-conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conversation_id: conversationId }),
        });
      }

      setConversationId(null);
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
      setIsExpanded(false);
      onClose();
    } catch (err) {
      console.error('Error closing Tavus session:', err);
      onClose();
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalVideo(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        className="absolute bottom-6 left-6 z-30"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={onToggle}
          className="glass-card border-white/20 text-white hover:bg-white/10 p-4 rounded-2xl shadow-xl group relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${moodColor}15 0%, rgba(255, 255, 255, 0.08) 100%)`,
            borderColor: moodColor + '30'
          }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at center, ${moodColor}40 0%, transparent 70%)`,
            }}
          />
          
          <div className="flex items-center gap-3 relative z-10">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Bot className="h-6 w-6" style={{ color: moodColor }} />
            </motion.div>
            <div className="text-left">
              <p className="text-sm font-semibold">Enable Tavus Avatar</p>
              <p className="text-xs text-gray-400">AI-powered conversation</p>
            </div>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      {/* Backdrop overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          'absolute z-50 glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/20',
          isExpanded 
            ? 'inset-4' // Full overlay when expanded
            : 'bottom-6 left-6 w-80 h-96' // Small card in bottom left
        )}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
        style={{
          background: `linear-gradient(135deg, ${moodColor}10 0%, rgba(255, 255, 255, 0.08) 100%)`,
          borderColor: moodColor + '30'
        }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b border-white/10 relative overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${moodColor}15 0%, rgba(255, 255, 255, 0.05) 100%)`
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  delay: i * 0.8,
                }}
                style={{
                  left: `${20 + i * 25}%`,
                  top: `${30 + i * 10}%`,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: moodColor + '20', border: `2px solid ${moodColor}40` }}
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Bot className="h-5 w-5" style={{ color: moodColor }} />
              </motion.div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  Tavus AI Avatar
                  {isConnected && (
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </h3>
                <p className="text-xs text-gray-400">
                  {isConnecting ? 'Connecting...' : 
                   isConnected ? 'Connected' : 
                   error ? 'Connection failed' : 'Ready to connect'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="sm"
                className="glass-card border-white/20 text-white hover:bg-white/10 p-2"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                size="sm"
                className="glass-card border-red-400/30 text-red-400 hover:bg-red-400/10 p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative bg-black/20">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="h-12 w-12 text-red-400 mx-auto mb-4" />
                </motion.div>
                <p className="text-red-400 font-medium">{error}</p>
                <p className="text-gray-400 text-sm mt-2">Please try again</p>
              </div>
            </div>
          ) : isConnecting ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Bot className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                </motion.div>
                <p className="text-white font-medium">Connecting to AI Avatar...</p>
                <p className="text-gray-400 text-sm mt-2">Setting up your conversation</p>
              </div>
            </div>
          ) : (
            <div ref={containerRef} className="w-full h-full" />
          )}
        </div>

        {/* Controls */}
        <div 
          className="p-4 border-t border-white/10"
          style={{
            background: `linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, ${moodColor}10 100%)`
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={toggleVideo}
              variant="outline"
              size="sm"
              className={cn(
                "glass-card border-white/20 text-white hover:bg-white/10 p-2",
                !isVideoEnabled && "bg-red-500/20 border-red-400/50 text-red-400"
              )}
              disabled={!isConnected}
            >
              {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="outline"
              size="sm"
              className={cn(
                "glass-card border-white/20 text-white hover:bg-white/10 p-2",
                isMuted && "bg-red-500/20 border-red-400/50 text-red-400"
              )}
              disabled={!isConnected}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={toggleAudio}
              variant="outline"
              size="sm"
              className={cn(
                "glass-card border-white/20 text-white hover:bg-white/10 p-2",
                !isAudioEnabled && "bg-red-500/20 border-red-400/50 text-red-400"
              )}
              disabled={!isConnected}
            >
              {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-400 animate-pulse' : 
                isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
              )} />
              <span>
                {isConnected ? 'Live' : isConnecting ? 'Connecting' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default TavusAvatarCard;