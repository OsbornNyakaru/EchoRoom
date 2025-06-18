"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Mic, MicOff, Volume2, VolumeX, ArrowRight, Sparkles, Loader2 } from "lucide-react"
import FloatingParticles from "../components/floating-particles"
import UserNameModal from "../components/UserNameModal"
import { useSocketContext } from "../context/SocketContext"
import { playBeep } from "../lib/soundUtils"

interface ChatSession {
  id: string;
  category: string;
  created_at: string;
  description: string | null;
}

export default function Welcome() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const mood = searchParams.get("mood") || "calm"
  const { joinRoom, userId, userName, setUserName, isConnected } = useSocketContext()

  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [showUserNameModal, setShowUserNameModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [hasPlayedBeep, setHasPlayedBeep] = useState(false);

  const validMoods = ["hopeful", "lonely", "motivated", "calm", "loving", "joyful"]
  const validatedMood = validMoods.includes(mood) ? mood : "calm"

  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const REDIRECT_DELAY_MS = 5000; // 5 seconds delay for auto-redirection
  const [hasUserManuallyJoined, setHasUserManuallyJoined] = useState(false);

  // Play beep sound when component mounts (before video plays)
  useEffect(() => {
    if (!hasPlayedBeep) {
      const timer = setTimeout(() => {
        playBeep();
        setHasPlayedBeep(true);
      }, 500); // Small delay to ensure page is loaded

      return () => clearTimeout(timer);
    }
  }, [hasPlayedBeep]);

  const handleJoinRoom = useCallback(async () => {
    if (!isConnected || !userId) {
      console.warn('[Welcome.tsx] Cannot join room: Socket not connected or user info missing');
      return;
    }

    setHasUserManuallyJoined(true);
    setIsJoiningRoom(true);

    try {
      console.log('[Welcome.tsx] Fetching sessions to find matching room...');
      const response = await fetch('${VITE_BACKEND_URL}/api/sessions');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const sessions: ChatSession[] = await response.json();
      console.log('[Welcome.tsx] Available sessions:', sessions);

      // Find a session that matches the user's mood
      const matchingSession = sessions.find(session => 
        session.category.toLowerCase() === validatedMood.toLowerCase()
      );

      if (matchingSession) {
        console.log(`[Welcome.tsx] Found matching session for mood "${validatedMood}":`, matchingSession);
        setSelectedSession(matchingSession);
        
        // Show user name modal before joining
        setShowUserNameModal(true);
      } else {
        console.warn(`[Welcome.tsx] No session found for mood "${validatedMood}"`);
        // Fallback: navigate to room page anyway, let user select manually
        navigate(`/room?mood=${encodeURIComponent(validatedMood)}`);
      }
    } catch (error) {
      console.error('[Welcome.tsx] Error fetching sessions or joining room:', error);
      // Fallback: navigate to room page anyway
      navigate(`/room?mood=${encodeURIComponent(validatedMood)}`);
    } finally {
      setIsJoiningRoom(false);
    }
  }, [navigate, validatedMood, userId, isConnected]);

  const handleUserNameConfirm = useCallback(async (confirmedUserName: string) => {
    if (!selectedSession) return;

    try {
      setIsJoiningRoom(true);
      
      // Update the user name in context
      setUserName(confirmedUserName);
      
      // Join the room using the socket context
      await joinRoom({
        roomId: selectedSession.id,
        userId: userId,
        userName: confirmedUserName,
        mood: validatedMood
      });

      // Navigate to the room page
      navigate(`/room?mood=${encodeURIComponent(validatedMood)}`);
    } catch (error) {
      console.error('[Welcome.tsx] Error joining room:', error);
      navigate(`/room?mood=${encodeURIComponent(validatedMood)}`);
    } finally {
      setShowUserNameModal(false);
      setIsJoiningRoom(false);
    }
  }, [selectedSession, setUserName, joinRoom, userId, validatedMood, navigate]);

  const handleUserNameCancel = useCallback(() => {
    setShowUserNameModal(false);
    setSelectedSession(null);
    setIsJoiningRoom(false);
  }, []);

  const moodColors = {
    hopeful: "#FFE66D",
    lonely: "#8E9AAF",
    motivated: "#FFB4A2",
    calm: "#A3C4BC",
    loving: "#FF8FA3",
    joyful: "#FFD93D",
  }

  const moodEmojis = {
    hopeful: "🌅",
    lonely: "🌙",
    motivated: "⚡",
    calm: "🧘",
    loving: "💝",
    joyful: "✨",
  }

  const welcomeSteps = [
    {
      title: "Welcome to your safe space",
      message: `I'm here to guide you through your ${validatedMood} journey today. This is a space where you can be completely yourself.`,
      duration: 4000,
    },
    {
      title: "How this works",
      message:
        "You'll be connected with 2-3 others who share similar feelings. Everything is anonymous, and you control your participation.",
      duration: 4000,
    },
    {
      title: "Ready to connect?",
      message: "Take a deep breath. When you're ready, we'll find your perfect group for meaningful conversation.",
      duration: 3000,
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < welcomeSteps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setIsReady(true)
      }
    }, welcomeSteps[currentStep]?.duration || 3000)

    return () => clearTimeout(timer)
  }, [currentStep, welcomeSteps])

  useEffect(() => {
    if (welcomeVideoRef.current) {
      welcomeVideoRef.current.play();
    }
  }, [validatedMood]);

  useEffect(() => {
    if (isReady && isVideoFinished && !hasUserManuallyJoined && !isJoiningRoom) {
      const timeoutId = setTimeout(() => {
        handleJoinRoom();
      }, REDIRECT_DELAY_MS);

      return () => clearTimeout(timeoutId);
    }
  }, [isReady, isVideoFinished, hasUserManuallyJoined, isJoiningRoom, handleJoinRoom, REDIRECT_DELAY_MS]);

  const currentColor = moodColors[validatedMood as keyof typeof moodColors] || "#A3C4BC"

  return (
    <div className="aurora-bg grid-pattern min-h-screen relative overflow-hidden">
      <FloatingParticles />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-2xl flex flex-col justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-8rem)]"
        >
          <Card className="enhanced-glass p-6 md:p-10 rounded-[3rem] relative overflow-hidden flex flex-col justify-between h-auto max-h-[800px] mx-auto">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-10"
                style={{ backgroundColor: currentColor }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-5"
                style={{ backgroundColor: currentColor }}
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center mb-6 pt-4"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <motion.div
                  className="text-5xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  {moodEmojis[validatedMood as keyof typeof moodEmojis]}
                </motion.div>
                <Sparkles className="h-6 w-6 text-[#FFE66D]" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                Your{" "}
                <span style={{ color: currentColor }} className="capitalize">
                  {validatedMood}
                </span>{" "}
                Space
              </h1>
              <p className="text-lg text-[#D8E2DC]">
                {isJoiningRoom ? "Finding your perfect room..." : "Preparing your personalized experience..."}
              </p>
            </motion.div>

            {/* Tavus Avatar Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col items-center mb-4 w-full max-w-[200px] md:max-w-[250px] mx-auto"
            >
              <div className="relative mb-4 w-32 h-32 md:w-48 md:h-48 breathing-animation">
                <motion.div
                  className="tavus-container w-full h-full breathing-animation"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor}20 0%, rgba(255, 255, 255, 0.1) 100%)`,
                    boxShadow: `0 0 60px ${currentColor}30`,
                  }}
                >
                  <video
                    ref={welcomeVideoRef}
                    src={`/videos/welcome-${validatedMood.toLowerCase()}.mp4`}
                    autoPlay
                    loop={false}
                    muted={!isAudioEnabled}
                    onEnded={() => setIsVideoFinished(true)}
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                  />

                  {/* Voice ripples */}
                  <motion.div
                    className="voice-ripple"
                    style={{
                      color: currentColor,
                      width: "100%",
                      height: "100%",
                      top: 0,
                      left: 0,
                    }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                  <motion.div
                    className="voice-ripple"
                    style={{
                      color: currentColor,
                      width: "100%",
                      height: "100%",
                      top: 0,
                      left: 0,
                    }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                  />
                </motion.div>

                {/* Audio controls */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-card rounded-full w-10 h-10 p-0"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    disabled={isJoiningRoom}
                  >
                    {isAudioEnabled ? (
                      <Volume2 className="h-4 w-4 text-[#A3C4BC]" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-[#8E9AAF]" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-card rounded-full w-10 h-10 p-0"
                    onClick={() => setIsMicEnabled(!isMicEnabled)}
                    disabled={isJoiningRoom}
                  >
                    {isMicEnabled ? (
                      <Mic className="h-4 w-4 text-[#A3C4BC]" />
                    ) : (
                      <MicOff className="h-4 w-4 text-[#8E9AAF]" />
                    )}
                  </Button>
                </div>
              </div>

              {/* AI Message / Enter Room Button */}
              <AnimatePresence mode="wait">
                {isReady ? (
                  <motion.div
                    key="enter-room-button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="text-center text-base md:text-lg text-[#D8E2DC] mt-4 mb-6 max-w-2xl mx-auto min-h-[60px] flex items-center justify-center"
                  >
                    <Button
                      variant="glow"
                      size="lg"
                      className="px-10 py-5 rounded-full text-base font-semibold shadow-xl transition-all duration-300"
                      onClick={handleJoinRoom}
                      disabled={!isReady || isJoiningRoom || !isConnected}
                    >
                      {isJoiningRoom ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining Room...
                        </>
                      ) : (
                        <>
                          Enter Your {validatedMood.charAt(0).toUpperCase() + validatedMood.slice(1)} Room
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="text-center text-base md:text-lg text-[#D8E2DC] mt-4 mb-6 max-w-2xl mx-auto min-h-[60px] flex items-center justify-center"
                  >
                    <p>{welcomeSteps[currentStep]?.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Connection Status */}
              {!isConnected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-2"
                >
                  <p className="text-sm text-yellow-400">Connecting to server...</p>
                </motion.div>
              )}
            </motion.div>
          </Card>
        </motion.div>
      </div>

      {/* User Name Modal */}
      <UserNameModal
        isOpen={showUserNameModal}
        onConfirm={handleUserNameConfirm}
        onCancel={handleUserNameCancel}
        mood={validatedMood}
      />
    </div>
  )
}