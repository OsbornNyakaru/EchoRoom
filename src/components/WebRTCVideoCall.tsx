import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { useWebRTC } from '../hooks/useWebRTC';
import { cn } from '../lib/utils';

interface WebRTCVideoCallProps {
  personaId: string;
  replicaId: string;
  isActive: boolean;
  onCallEnd: () => void;
  className?: string;
}

const WebRTCVideoCall: React.FC<WebRTCVideoCallProps> = ({
  personaId,
  replicaId,
  isActive,
  onCallEnd,
  className
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const {
    isConnected,
    isConnecting,
    localStream,
    error,
    connectionState,
    conversationUrl,
    conversationId,
    initializeWebRTC,
    cleanup,
    toggleMute,
    toggleVideo,
    localVideoRef
  } = useWebRTC({
    personaId,
    replicaId,
    isEnabled: isActive,
    onConnectionStateChange: (state) => {
      console.log('Tavus CVI connection state changed:', state);
    },
    onError: (error) => {
      console.error('Tavus CVI error:', error);
    }
  });

  // Initialize call when component becomes active - but only once
  useEffect(() => {
    if (isActive && !isConnecting && !isConnected && !hasInitialized) {
      console.log('🚀 Initializing WebRTC call...');
      setHasInitialized(true);
      initializeWebRTC();
    }
  }, [isActive, isConnecting, isConnected, hasInitialized, initializeWebRTC]);

  // Reset initialization flag when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      setHasInitialized(false);
      setCallDuration(0);
    }
  }, [isActive]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected && isActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, isActive]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (showControls && isConnected) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showControls, isConnected]);

  // Handle mute toggle
  const handleMuteToggle = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  // Handle video toggle
  const handleVideoToggle = () => {
    const videoOff = toggleVideo();
    setIsVideoOff(videoOff);
  };

  // Handle call end
  const handleCallEnd = () => {
    console.log('🔚 Ending call...');
    cleanup();
    setHasInitialized(false);
    onCallEnd();
  };

  // Open conversation in new tab
  const openConversationInNewTab = () => {
    if (conversationUrl) {
      window.open(conversationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div 
      className={cn(
        "relative w-full h-full bg-black rounded-2xl overflow-hidden",
        isFullscreen && "fixed inset-0 z-[9999] rounded-none",
        className
      )}
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Connection Status Overlay */}
      <AnimatePresence>
        {(isConnecting || error) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20"
          >
            <div className="text-center text-white max-w-md">
              {isConnecting && (
                <>
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Creating Conversation...</h3>
                  <p className="text-white/70">Setting up your Tavus CVI session</p>
                  <p className="text-white/50 text-sm mt-2">Replica: {replicaId}</p>
                </>
              )}
              
              {error && (
                <>
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhoneOff className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-red-400">Connection Failed</h3>
                  <p className="text-white/70 mb-4">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setHasInitialized(false);
                        initializeWebRTC();
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={handleCallEnd}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tavus CVI Iframe or Instructions */}
      <div className="absolute inset-0">
        {conversationUrl ? (
          <div className="w-full h-full flex flex-col">
            {/* Embedded Tavus CVI */}
            <div className="flex-1 relative">
              <iframe
                src={conversationUrl}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture"
                allowFullScreen
                title="Tavus CVI Conversation"
              />
              
              {/* Overlay message for better UX */}
              <div className="absolute top-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Tavus CVI Active</span>
                    <span className="text-xs text-white/60 ml-2">({replicaId})</span>
                  </div>
                  <Button
                    onClick={openConversationInNewTab}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Fallback when no conversation URL
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold">Preparing Conversation...</h3>
              <p className="text-white/70">Setting up Tavus CVI session</p>
              <p className="text-white/50 text-sm mt-2">Replica: {replicaId}</p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <AnimatePresence>
        {localStream && !isVideoOff && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-white/20 z-10"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {isMuted && (
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Duration */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white z-10"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              {/* Mute Button */}
              <Button
                onClick={handleMuteToggle}
                size="lg"
                variant={isMuted ? "destructive" : "outline"}
                className={cn(
                  "w-12 h-12 rounded-full",
                  isMuted 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                )}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              {/* Video Button */}
              <Button
                onClick={handleVideoToggle}
                size="lg"
                variant={isVideoOff ? "destructive" : "outline"}
                className={cn(
                  "w-12 h-12 rounded-full",
                  isVideoOff 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                )}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>

              {/* Speaker Button */}
              <Button
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                size="lg"
                variant={isSpeakerMuted ? "destructive" : "outline"}
                className={cn(
                  "w-12 h-12 rounded-full",
                  isSpeakerMuted 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                )}
              >
                {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              {/* Fullscreen Button */}
              <Button
                onClick={() => setIsFullscreen(!isFullscreen)}
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>

              {/* Open in New Tab Button */}
              {conversationUrl && (
                <Button
                  onClick={openConversationInNewTab}
                  size="lg"
                  variant="outline"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
              )}

              {/* End Call Button */}
              <Button
                onClick={handleCallEnd}
                size="lg"
                variant="destructive"
                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white ml-2"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection State Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          connectionState === 'connected' && "bg-green-500/20 text-green-400 border border-green-500/30",
          connectionState === 'connecting' && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
          connectionState === 'failed' && "bg-red-500/20 text-red-400 border border-red-500/30",
          connectionState === 'new' && "bg-gray-500/20 text-gray-400 border border-gray-500/30"
        )}>
          {connectionState === 'connected' && 'CVI Connected'}
          {connectionState === 'connecting' && 'Creating Conversation...'}
          {connectionState === 'failed' && 'Connection Failed'}
          {connectionState === 'new' && 'Ready'}
        </div>
      </div>

      {/* Conversation Info */}
      {conversationId && (
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs z-10">
          <div className="font-mono">ID: {conversationId.slice(-8)}</div>
        </div>
      )}
    </div>
  );
};

export default WebRTCVideoCall;