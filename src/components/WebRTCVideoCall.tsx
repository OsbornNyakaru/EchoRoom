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
  ExternalLink,
  ArrowLeft,
  Home,
  RotateCcw
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
  showCustomControls?: boolean; // New optional prop
}

const WebRTCVideoCall: React.FC<WebRTCVideoCallProps> = ({
  personaId,
  replicaId,
  isActive,
  onCallEnd,
  className,
  showCustomControls = false // Default to false - hide controls by default
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(false); // Changed to false by default
  const [hasInitialized, setHasInitialized] = useState(false);
  const [showNavigationHelp, setShowNavigationHelp] = useState(false);

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

  // Auto-hide controls (only if custom controls are enabled)
  useEffect(() => {
    if (!showCustomControls) return;
    
    let timeout: NodeJS.Timeout;
    
    if (showControls && isConnected) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showControls, isConnected, showCustomControls]);

  // Show navigation help after a delay when connected
  useEffect(() => {
    if (isConnected && !showCustomControls) {
      const timer = setTimeout(() => {
        setShowNavigationHelp(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setShowNavigationHelp(false), 5000);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, showCustomControls]);

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

  // Handle restart call
  const handleRestartCall = () => {
    console.log('🔄 Restarting call...');
    cleanup();
    setHasInitialized(false);
    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      initializeWebRTC();
    }, 1000);
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
      onMouseMove={() => showCustomControls && setShowControls(true)}
      onTouchStart={() => showCustomControls && setShowControls(true)}
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
                      onClick={handleRestartCall}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      onClick={handleCallEnd}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Go Back
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Help Overlay - Shows users how to exit */}
      <AnimatePresence>
        {showNavigationHelp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 backdrop-blur-md rounded-2xl p-6 text-white text-center max-w-sm mx-4"
          >
            <div className="mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Home className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Need to Exit?</h3>
              <p className="text-white/80 text-sm">
                Use the buttons below to navigate back or restart your conversation
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleCallEnd}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Call
              </Button>
              <Button
                onClick={() => setShowNavigationHelp(false)}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                Got it
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible Exit Button (top-left corner) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-20"
      >
        <Button
          onClick={handleCallEnd}
          variant="outline"
          size="sm"
          className="bg-black/50 border-white/20 text-white hover:bg-black/70 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Call
        </Button>
      </motion.div>

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
              
              {/* Minimal overlay message - Hidden by default, shows on interaction */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Tavus CVI Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={openConversationInNewTab}
                          size="sm"
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-6 px-2"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          New Tab
                        </Button>
                        <Button
                          onClick={handleRestartCall}
                          size="sm"
                          variant="outline"
                          className="bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30 text-xs h-6 px-2"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Restart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

      {/* Local Video (Picture-in-Picture) - Only show if custom controls are enabled */}
      <AnimatePresence>
        {showCustomControls && localStream && !isVideoOff && (
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

      {/* Call Duration - Only show if custom controls are enabled */}
      <AnimatePresence>
        {showCustomControls && isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white z-10"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Controls - Only show if showCustomControls is true */}
      <AnimatePresence>
        {showCustomControls && showControls && (
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

              {/* Restart Button */}
              <Button
                onClick={handleRestartCall}
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

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

      {/* Connection State Indicator - Always visible but minimal */}
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

      {/* Conversation Info - Only show if custom controls are enabled */}
      {showCustomControls && conversationId && (
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs z-10">
          <div className="font-mono">ID: {conversationId.slice(-8)}</div>
        </div>
      )}

      {/* Bottom Navigation Bar - Always visible for easy access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 right-4 z-20"
      >
        <div className="flex items-center justify-between bg-black/50 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Live Conversation</span>
            {conversationId && (
              <span className="text-white/60 text-xs font-mono">
                #{conversationId.slice(-6)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {conversationUrl && (
              <Button
                onClick={openConversationInNewTab}
                size="sm"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-7 px-3"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open in Tab
              </Button>
            )}
            <Button
              onClick={handleRestartCall}
              size="sm"
              variant="outline"
              className="bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30 text-xs h-7 px-3"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Restart
            </Button>
            <Button
              onClick={() => setShowNavigationHelp(true)}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-7 px-3"
            >
              Help
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WebRTCVideoCall;