import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ExternalLink,
  ArrowLeft,
  Home,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Info,
  Hash,
  Clock,
  Wifi
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
  const [isVerticalPanelExpanded, setIsVerticalPanelExpanded] = useState(false);

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
            <div className="text-center text-white max-w-md px-4">
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
                  <div className="flex gap-3 justify-center flex-wrap">
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
                      className="border-white/20 text-white hover:bg-white/10 flex items-center"
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

      {/* Always-visible Exit Button (top-left corner) - Moved down slightly and made responsive */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "absolute z-20",
          "top-4 sm:top-6 left-2 sm:left-4" // Responsive positioning
        )}
      >
        <Button
          onClick={handleCallEnd}
          variant="outline"
          size="sm"
          className={cn(
            "bg-black/50 border-white/20 text-white hover:bg-black/70 backdrop-blur-sm flex items-center",
            "text-xs sm:text-sm", // Responsive text size
            "h-8 sm:h-9", // Responsive height
            "px-2 sm:px-3" // Responsive padding
          )}
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Exit Call</span>
          <span className="xs:hidden">Exit</span>
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
                    className={cn(
                      "absolute bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-10",
                      "top-2 sm:top-4 right-2 sm:right-4", // Responsive positioning
                      "max-w-[calc(100vw-6rem)]" // Prevent overflow
                    )}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs sm:text-sm">Tavus CVI Active</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          onClick={openConversationInNewTab}
                          size="sm"
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-6 px-2"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">New Tab</span>
                        </Button>
                        <Button
                          onClick={handleRestartCall}
                          size="sm"
                          variant="outline"
                          className="bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30 text-xs h-6 px-2"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Restart</span>
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
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center p-4">
            <div className="text-center text-white max-w-md">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold">Preparing Conversation...</h3>
              <p className="text-white/70 text-sm sm:text-base">Setting up Tavus CVI session</p>
              <p className="text-white/50 text-xs sm:text-sm mt-2">Replica: {replicaId}</p>
            </div>
          </div>
        )}
      </div>

      {/* Vertical Control Panel - Right Side - Streamlined without Help/Restart */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={cn(
              "absolute z-20",
              // Responsive positioning - moved up significantly more
              "right-1 xs:right-2 sm:right-3 md:right-4",
              // Moved up from 25%/30%/35% to 15%/18%/20%/22%/25%
              "top-[15%] xs:top-[18%] sm:top-[20%] md:top-[22%] lg:top-[25%]",
              "transform -translate-y-1/2"
            )}
          >
            <motion.div
              className={cn(
                "bg-black/70 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden",
                "shadow-lg sm:shadow-xl md:shadow-2xl",
                // Responsive max width to prevent overflow
                "max-w-[calc(100vw-1rem)] xs:max-w-[calc(100vw-2rem)] sm:max-w-none"
              )}
              animate={{
                width: isVerticalPanelExpanded 
                  ? "min(240px, calc(100vw - 1rem))" // Reduced from 280px to 240px - even more compact!
                  : "44px", // Reduced from 48px to 44px for collapsed state
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Toggle Button */}
              <div className={cn(
                "flex items-center justify-between",
                "p-2 xs:p-2.5 sm:p-3", // Reduced padding
                isVerticalPanelExpanded ? "min-h-[44px] sm:min-h-[48px]" : "h-9 xs:h-10 sm:h-11" // Reduced heights
              )}>
                <AnimatePresence>
                  {isVerticalPanelExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 min-w-0 flex-1"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                      <span className={cn(
                        "text-white font-medium truncate",
                        "text-xs sm:text-sm" // Reduced text size
                      )}>
                        Live Session
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <Button
                  onClick={() => setIsVerticalPanelExpanded(!isVerticalPanelExpanded)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-white hover:bg-white/10 flex-shrink-0 p-0",
                    "w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7" // Reduced button size
                  )}
                >
                  {isVerticalPanelExpanded ? (
                    <ChevronRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <ChevronLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                  )}
                </Button>
              </div>

              {/* Expanded Content - Streamlined without Help/Restart sections */}
              <AnimatePresence>
                {isVerticalPanelExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/10"
                  >
                    <div className={cn(
                      "space-y-2 xs:space-y-2.5 sm:space-y-3", // Slightly increased spacing for better readability
                      "p-2 xs:p-2.5 sm:p-3", // Reduced padding
                      "overflow-visible" // No scrolling
                    )}>
                      {/* Connection Status - More compact */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-white/60 text-xs">
                          <Wifi className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Status</span>
                        </div>
                        <div className="bg-white/5 rounded-md p-2"> {/* Slightly increased padding for readability */}
                          <div className={cn(
                            "flex items-center gap-1.5",
                            connectionState === 'connected' && "text-green-400",
                            connectionState === 'connecting' && "text-yellow-400",
                            connectionState === 'failed' && "text-red-400"
                          )}>
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full animate-pulse",
                              connectionState === 'connected' && "bg-green-400",
                              connectionState === 'connecting' && "bg-yellow-400",
                              connectionState === 'failed' && "bg-red-400"
                            )} />
                            <span className="text-xs font-medium">
                              {connectionState === 'connected' && 'Connected'}
                              {connectionState === 'connecting' && 'Connecting...'}
                              {connectionState === 'failed' && 'Failed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Call Duration - More compact */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-white/60 text-xs">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>Duration</span>
                        </div>
                        <div className="bg-white/5 rounded-md p-2"> {/* Slightly increased padding for readability */}
                          <span className="text-white font-mono text-sm">
                            {formatDuration(callDuration)}
                          </span>
                        </div>
                      </div>

                      {/* Conversation Info - More compact */}
                      {conversationId && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-white/60 text-xs">
                            <Hash className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">Session</span>
                          </div>
                          <div className="bg-white/5 rounded-md p-2"> {/* Slightly increased padding for readability */}
                            <span className="text-white font-mono text-xs break-all">
                              {conversationId.slice(-8)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Streamlined without Help/Restart */}
                      <div className="space-y-1.5">
                        <div className="text-white/60 text-xs">Actions</div>
                        
                        {/* Single column layout with only essential buttons */}
                        <div className="grid grid-cols-1 gap-1.5">
                          {conversationUrl && (
                            <Button
                              onClick={openConversationInNewTab}
                              size="sm"
                              variant="outline"
                              className={cn(
                                "w-full bg-white/5 border-white/20 text-white hover:bg-white/10 justify-start",
                                "text-xs h-7", // Slightly larger for better usability
                                "px-2.5" // Slightly more padding
                              )}
                            >
                              <ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" />
                              <span className="truncate">Open in New Tab</span>
                            </Button>
                          )}

                          {/* End Call Button - More prominent and larger */}
                          <Button
                            onClick={handleCallEnd}
                            size="sm"
                            variant="destructive"
                            className={cn(
                              "w-full bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30 justify-start",
                              "text-xs h-8", // Larger than other buttons for prominence
                              "px-2.5", // Slightly more padding
                              "font-semibold", // Made text bolder
                              "border-2 mt-1" // Thicker border and margin for prominence
                            )}
                          >
                            <PhoneOff className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="truncate">End Call</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local Video (Picture-in-Picture) - Only show if custom controls are enabled */}
      <AnimatePresence>
        {showCustomControls && localStream && !isVideoOff && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute bg-black rounded-lg overflow-hidden border-2 border-white/20 z-10",
              "top-2 sm:top-4 right-2 sm:right-4", // Responsive positioning
              "w-24 h-18 xs:w-28 xs:h-21 sm:w-32 sm:h-24" // Responsive sizing
            )}
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
              <div className="absolute bottom-1 right-1 w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center">
                <MicOff className="w-2 h-2 xs:w-3 xs:h-3 text-white" />
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
            className={cn(
              "absolute bg-black/50 backdrop-blur-sm rounded-lg text-white z-10",
              "top-2 sm:top-4 left-1/2 transform -translate-x-1/2", // Responsive positioning
              "px-2 xs:px-3 py-1 xs:py-2" // Responsive padding
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs xs:text-sm font-mono">{formatDuration(callDuration)}</span>
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
            className={cn(
              "absolute z-20",
              "bottom-4 xs:bottom-6 left-1/2 transform -translate-x-1/2" // Responsive positioning
            )}
          >
            <div className={cn(
              "flex items-center gap-2 xs:gap-3 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10",
              "p-3 xs:p-4", // Responsive padding
              "max-w-[calc(100vw-2rem)]", // Prevent overflow
              "overflow-x-auto" // Allow horizontal scroll if needed
            )}>
              {/* Mute Button */}
              <Button
                onClick={handleMuteToggle}
                size="lg"
                variant={isMuted ? "destructive" : "outline"}
                className={cn(
                  "rounded-full flex-shrink-0",
                  "w-10 h-10 xs:w-12 xs:h-12", // Responsive size
                  isMuted 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                )}
              >
                {isMuted ? <MicOff className="w-4 h-4 xs:w-5 xs:h-5" /> : <Mic className="w-4 h-4 xs:w-5 xs:h-5" />}
              </Button>

              {/* Video Button */}
              <Button
                onClick={handleVideoToggle}
                size="lg"
                variant={isVideoOff ? "destructive" : "outline"}
                className={cn(
                  "rounded-full flex-shrink-0",
                  "w-10 h-10 xs:w-12 xs:h-12", // Responsive size
                  isVideoOff 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                )}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4 xs:w-5 xs:h-5" /> : <Video className="w-4 h-4 xs:w-5 xs:h-5" />}
              </Button>

              {/* Speaker Button */}
              <Button
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                size="lg"
                variant={isSpeakerMuted ? "destructive" : "outline"}
                className={cn(
                  "rounded-full flex-shrink-0",
                  "w-10 h-10 xs:w-12 xs:h-12", // Responsive size
                  isSpeakerMuted 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                )}
              >
                {isSpeakerMuted ? <VolumeX className="w-4 h-4 xs:w-5 xs:h-5" /> : <Volume2 className="w-4 h-4 xs:w-5 xs:h-5" />}
              </Button>

              {/* Fullscreen Button */}
              <Button
                onClick={() => setIsFullscreen(!isFullscreen)}
                size="lg"
                variant="outline"
                className={cn(
                  "rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 flex-shrink-0",
                  "w-10 h-10 xs:w-12 xs:h-12" // Responsive size
                )}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 xs:w-5 xs:h-5" /> : <Maximize2 className="w-4 h-4 xs:w-5 xs:h-5" />}
              </Button>

              {/* Open in New Tab Button */}
              {conversationUrl && (
                <Button
                  onClick={openConversationInNewTab}
                  size="lg"
                  variant="outline"
                  className={cn(
                    "rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 flex-shrink-0",
                    "w-10 h-10 xs:w-12 xs:h-12" // Responsive size
                  )}
                >
                  <ExternalLink className="w-4 h-4 xs:w-5 xs:h-5" />
                </Button>
              )}

              {/* Restart Button */}
              <Button
                onClick={handleRestartCall}
                size="lg"
                variant="outline"
                className={cn(
                  "rounded-full bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30 flex-shrink-0",
                  "w-10 h-10 xs:w-12 xs:h-12" // Responsive size
                )}
              >
                <RotateCcw className="w-4 h-4 xs:w-5 xs:h-5" />
              </Button>

              {/* End Call Button */}
              <Button
                onClick={handleCallEnd}
                size="lg"
                variant="destructive"
                className={cn(
                  "rounded-full bg-red-500 hover:bg-red-600 text-white ml-2 flex-shrink-0",
                  "w-10 h-10 xs:w-12 xs:h-12" // Responsive size
                )}
              >
                <PhoneOff className="w-4 h-4 xs:w-5 xs:h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection State Indicator - Always visible but minimal and responsive */}
      <div className={cn(
        "absolute z-10",
        "top-2 xs:top-3 sm:top-4 left-1/2 transform -translate-x-1/2" // Responsive positioning
      )}>
        <div className={cn(
          "rounded-full text-xs font-medium",
          "px-2 xs:px-3 py-1", // Responsive padding
          connectionState === 'connected' && "bg-green-500/20 text-green-400 border border-green-500/30",
          connectionState === 'connecting' && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
          connectionState === 'failed' && "bg-red-500/20 text-red-400 border border-red-500/30",
          connectionState === 'new' && "bg-gray-500/20 text-gray-400 border border-gray-500/30"
        )}>
          <span className="hidden xs:inline">
            {connectionState === 'connected' && 'CVI Connected'}
            {connectionState === 'connecting' && 'Creating Conversation...'}
            {connectionState === 'failed' && 'Connection Failed'}
            {connectionState === 'new' && 'Ready'}
          </span>
          <span className="xs:hidden">
            {connectionState === 'connected' && 'Connected'}
            {connectionState === 'connecting' && 'Connecting...'}
            {connectionState === 'failed' && 'Failed'}
            {connectionState === 'new' && 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WebRTCVideoCall;