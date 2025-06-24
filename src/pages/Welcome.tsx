"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Mic, MicOff, Volume2, VolumeX, ArrowRight, Sparkles, Loader2, Home, Bot, Info, ArrowLeft, Grid3X3, ChevronDown, Sun, Moon, Star, Coffee, Heart, Smile, Book } from 'lucide-react'
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

interface RoomOption {
  title: string;
  mood: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
}

export default function Welcome() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const mood = searchParams.get("mood") || "calm"
  const { joinRoom, userId, setUserName, isConnected } = useSocketContext()

  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [showUserNameModal, setShowUserNameModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [hasPlayedBeep, setHasPlayedBeep] = useState(false);
  const [showRoomsDropdown, setShowRoomsDropdown] = useState(false);

  const validMoods = ["hopeful", "lonely", "motivated", "calm", "loving", "joyful", "books"]
  const validatedMood = validMoods.includes(mood) ? mood : "calm"

  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const REDIRECT_DELAY_MS = 5000; // 5 seconds delay for auto-redirection
  const [hasUserManuallyJoined, setHasUserManuallyJoined] = useState(false);

  // Room options for the dropdown
  const roomOptions: RoomOption[] = [
    {
      title: "Hopeful",
      mood: "hopeful",
      description: "Looking forward with optimism",
      icon: <Sun className="w-4 h-4" />,
      color: "#FFE66D",
      bgGradient: "from-yellow-400/20 to-orange-400/20"
    },
    {
      title: "Lonely",
      mood: "lonely", 
      description: "Seeking connection and understanding",
      icon: <Moon className="w-4 h-4" />,
      color: "#8E9AAF",
      bgGradient: "from-indigo-400/20 to-purple-400/20"
    },
    {
      title: "Motivated",
      mood: "motivated",
      description: "Ready to take on challenges", 
      icon: <Star className="w-4 h-4" />,
      color: "#FFB4A2",
      bgGradient: "from-red-400/20 to-pink-400/20"
    },
    {
      title: "Calm",
      mood: "calm",
      description: "Finding peace in the moment",
      icon: <Coffee className="w-4 h-4" />,
      color: "#A3C4BC", 
      bgGradient: "from-emerald-400/20 to-teal-400/20"
    },
    {
      title: "Loving",
      mood: "loving",
      description: "Embracing warmth and compassion",
      icon: <Heart className="w-4 h-4" />,
      color: "#FF8FA3",
      bgGradient: "from-pink-400/20 to-rose-400/20"
    },
    {
      title: "Joyful", 
      mood: "joyful",
      description: "Celebrating life's beautiful moments",
      icon: <Smile className="w-4 h-4" />,
      color: "#FFD93D",
      bgGradient: "from-yellow-400/20 to-amber-400/20"
    },
    {
      title: "Books",
      mood: "books",
      description: "Dive into stories and share reads",
      icon: <Book className="w-4 h-4" />,
      color: "#9B59B6",
      bgGradient: "from-purple-400/20 to-violet-400/20"
    }
  ];

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

  const handleJoinRoom = useCallback(async (selectedMood?: string) => {
    if (!isConnected || !userId) {
      console.warn('[Welcome.tsx] Cannot join room: Socket not connected or user info missing');
      return;
    }

    const moodToUse = selectedMood || validatedMood;
    setHasUserManuallyJoined(true);
    setIsJoiningRoom(true);

    try {
      console.log('[Welcome.tsx] Fetching sessions to find matching room...');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/sessions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const sessions: ChatSession[] = await response.json();
      console.log('[Welcome.tsx] Available sessions:', sessions);

      // Find a session that matches the user's mood
      const matchingSession = sessions.find(session => 
        session.category.toLowerCase() === moodToUse.toLowerCase()
      );

      if (matchingSession) {
        console.log(`[Welcome.tsx] Found matching session for mood "${moodToUse}":`, matchingSession);
        setSelectedSession(matchingSession);
        
        // Show user name modal before joining
        setShowUserNameModal(true);
      } else {
        console.warn(`[Welcome.tsx] No session found for mood "${moodToUse}"`);
        // Fallback: navigate to room page anyway, let user select manually
        navigate(`/room?mood=${encodeURIComponent(moodToUse)}`);
      }
    } catch (error) {
      console.error('[Welcome.tsx] Error fetching sessions or joining room:', error);
      // Fallback: navigate to room page anyway
      navigate(`/room?mood=${encodeURIComponent(moodToUse)}`);
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

  // Enhanced navigation functions
  const handleHomeClick = () => {
    navigate('/')
  }

  const handleAboutClick = () => {
    // Navigate to home page and scroll to about section
    navigate('/')
    // Small delay to ensure navigation completes before scrolling
    setTimeout(() => {
      const aboutSection = document.querySelector('.about-section')
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        // If about section not found immediately, try again after a longer delay
        setTimeout(() => {
          const aboutSection = document.querySelector('.about-section')
          if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' })
          }
        }, 500)
      }
    }, 100)
  }

  const handleBackClick = () => {
    navigate(-1) // Go back to previous page
  }

  // Handle room selection from dropdown
  const handleRoomSelect = (roomMood: string) => {
    setShowRoomsDropdown(false);
    navigate(`/welcome?mood=${encodeURIComponent(roomMood)}`);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showRoomsDropdown) {
        const target = event.target as Element;
        if (!target.closest('.rooms-dropdown-container')) {
          setShowRoomsDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRoomsDropdown]);

  const moodColors = {
    hopeful: "#FFE66D",
    lonely: "#8E9AAF",
    motivated: "#FFB4A2",
    calm: "#A3C4BC",
    loving: "#FF8FA3",
    joyful: "#FFD93D",
    books: "#9B59B6",
  }

  const moodEmojis = {
    hopeful: "🌅",
    lonely: "🌙",
    motivated: "⚡",
    calm: "🧘",
    loving: "💝",
    joyful: "✨",
    books: "📚",
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
    <div className="aurora-bg grid-pattern min-h-screen relative">
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          /* Modern Thin Scrollbar Styles for Larger Devices */
          @media (min-width: 1024px) {
            /* Webkit browsers (Chrome, Safari, Edge) */
            .modern-scrollbar::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }

            .modern-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 2px;
              margin: 4px;
            }

            .modern-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
              border-radius: 2px;
              transition: all 0.3s ease;
            }

            .modern-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%);
              width: 6px;
            }

            .modern-scrollbar::-webkit-scrollbar-corner {
              background: transparent;
            }

            /* Firefox */
            .modern-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
            }

            /* Enhanced hover effect for the scrollable container */
            .modern-scrollbar:hover::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, rgba(163, 196, 188, 0.6) 0%, rgba(163, 196, 188, 0.3) 100%);
              box-shadow: 0 0 8px rgba(163, 196, 188, 0.3);
            }

            /* Smooth scrolling behavior */
            .modern-scrollbar {
              scroll-behavior: smooth;
            }

            /* Custom scrollbar for dropdown with mood-specific colors */
            .rooms-dropdown-scroll::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, ${currentColor}60 0%, ${currentColor}30 100%);
            }

            .rooms-dropdown-scroll::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, ${currentColor}80 0%, ${currentColor}40 100%);
              box-shadow: 0 0 8px ${currentColor}40;
            }
          }

          /* Hide scrollbar on smaller devices for cleaner mobile experience */
          @media (max-width: 1023px) {
            .modern-scrollbar::-webkit-scrollbar {
              display: none;
            }
            
            .modern-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          }
        `}
      </style>
      {/* Floating particles background */}
      <FloatingParticles />

      {/* Enhanced Navigation Bar - Fully Responsive */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Left Side - Back Button & Brand */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {/* Back Button with Enhanced Tooltip */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 px-2 sm:px-3 py-2 transition-all duration-200 flex items-center gap-1 sm:gap-2 hover:scale-105"
                  onClick={handleBackClick}
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium hidden xs:inline">Back</span>
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm border border-white/10 shadow-lg">
                  <div className="font-medium">Go Back</div>
                  <div className="text-white/70 text-xs mt-0.5">Return to previous page</div>
                </div>
              </div>

              {/* Brand - Responsive */}
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <div 
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentColor}80 0%, ${currentColor}60 100%)`,
                    boxShadow: `0 4px 12px ${currentColor}30`
                  }}
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-white font-bold text-sm sm:text-lg truncate">EchoRoom</span>
                  <div className="text-xs text-white/60 capitalize hidden sm:block">
                    {validatedMood} Space
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Current Mood Indicator - Hidden on small screens */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
              style={{ 
                background: `linear-gradient(135deg, ${currentColor}20 0%, rgba(255, 255, 255, 0.05) 100%)`,
                borderColor: `${currentColor}30`
              }}
            >
              <motion.div
                className="text-xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                {moodEmojis[validatedMood as keyof typeof moodEmojis]}
              </motion.div>
              <div>
                <div className="text-white font-medium text-sm capitalize">
                  {validatedMood} Room
                </div>
                <div className="text-white/60 text-xs">
                  Preparing your space...
                </div>
              </div>
            </motion.div>

            {/* Right Side - Navigation Icons - Fully Responsive */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              {/* Home Icon with Enhanced Tooltip */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 w-7 h-7 sm:w-9 sm:h-9 p-0 transition-all duration-200 hover:scale-105"
                  onClick={handleHomeClick}
                >
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm border border-white/10 shadow-lg">
                  <div className="font-medium">Home</div>
                  <div className="text-white/70 text-xs mt-0.5">Return to main page</div>
                </div>
              </div>
              
              {/* Rooms Dropdown with Enhanced Responsive Design */}
              <div className="relative group rooms-dropdown-container">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 w-7 h-7 sm:w-9 sm:h-9 p-0 transition-all duration-200 hover:scale-105 flex items-center justify-center"
                  onClick={() => setShowRoomsDropdown(!showRoomsDropdown)}
                >
                  <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <ChevronDown className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ml-0.5 transition-transform duration-200 ${showRoomsDropdown ? 'rotate-180' : ''}`} />
                </Button>
                
                {/* Enhanced Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm border border-white/10 shadow-lg">
                  <div className="font-medium">All Rooms</div>
                  <div className="text-white/70 text-xs mt-0.5">Choose a different mood</div>
                </div>

                {/* Fully Responsive Rooms Dropdown with Modern Scrollbar */}
                <AnimatePresence>
                  {showRoomsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 w-[280px] sm:w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                      style={{
                        // Moved dropdown left by 8px on mobile and 12px on desktop
                        right: window.innerWidth < 640 ? '8px' : 'auto',
                        left: window.innerWidth >= 640 ? 'calc(50% - 144px - 12px)' : 'auto',
                        maxWidth: 'calc(100vw - 1rem)',
                      }}
                    >
                      <div className="p-3">
                        <div className="text-white font-medium text-sm mb-3 px-2">Choose Your Room</div>
                        <div className="space-y-1 max-h-80 overflow-y-auto modern-scrollbar rooms-dropdown-scroll">
                          {roomOptions.map((room, index) => (
                            <motion.button
                              key={room.mood}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleRoomSelect(room.mood)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 text-left group ${
                                room.mood === validatedMood ? 'bg-white/5 border border-white/20' : ''
                              }`}
                              style={{
                                background: room.mood === validatedMood 
                                  ? `linear-gradient(135deg, ${room.color}20 0%, rgba(255, 255, 255, 0.05) 100%)`
                                  : undefined
                              }}
                            >
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                                style={{ 
                                  backgroundColor: `${room.color}20`,
                                  border: `1px solid ${room.color}40`
                                }}
                              >
                                <div style={{ color: room.color }}>
                                  {room.icon}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-sm flex items-center gap-2">
                                  {room.title}
                                  {room.mood === validatedMood && (
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                  )}
                                </div>
                                <div className="text-white/60 text-xs truncate">
                                  {room.description}
                                </div>
                              </div>
                              <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* About Icon with Enhanced Tooltip - Updated to navigate to home about section */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 w-7 h-7 sm:w-9 sm:h-9 p-0 transition-all duration-200 hover:scale-105"
                  onClick={handleAboutClick}
                >
                  <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm border border-white/10 shadow-lg">
                  <div className="font-medium">About</div>
                  <div className="text-white/70 text-xs mt-0.5">Learn more about EchoRoom</div>
                </div>
              </div>

              {/* Quick Room Access with Enhanced Responsive Design */}
              <div className="relative group ml-1 sm:ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white/20 hover:bg-white/10 hover:border-white/30 px-2 sm:px-3 py-2 transition-all duration-200 flex items-center gap-1 sm:gap-2 hover:scale-105 text-xs sm:text-sm"
                  style={{ 
                    borderColor: `${currentColor}40`,
                    background: `linear-gradient(135deg, ${currentColor}10 0%, rgba(255, 255, 255, 0.05) 100%)`
                  }}
                  onClick={() => handleJoinRoom()}
                  disabled={isJoiningRoom || !isConnected}
                >
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium hidden sm:inline">
                    {isJoiningRoom ? 'Joining...' : 'Quick Join'}
                  </span>
                  <span className="font-medium sm:hidden">
                    {isJoiningRoom ? '...' : 'Join'}
                  </span>
                </Button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm border border-white/10 shadow-lg">
                  <div className="font-medium">Quick Join</div>
                  <div className="text-white/70 text-xs mt-0.5">Join {validatedMood} room directly</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8 pt-16 sm:pt-20 modern-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-2xl flex flex-col justify-center min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-10rem)]"
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
                  className="text-4xl sm:text-5xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  {moodEmojis[validatedMood as keyof typeof moodEmojis]}
                </motion.div>
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFE66D]" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2">
                Your{" "}
                <span style={{ color: currentColor }} className="capitalize">
                  {validatedMood}
                </span>{" "}
                Space
              </h1>
              <p className="text-base sm:text-lg text-[#D8E2DC]">
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
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-card rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 border-2 border-white/20 backdrop-blur-md bg-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    disabled={isJoiningRoom}
                    style={{
                      boxShadow: `0 4px 20px ${currentColor}30`,
                    }}
                  >
                    {isAudioEnabled ? (
                      <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-sm" />
                    ) : (
                      <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 drop-shadow-sm" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-card rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 border-2 border-white/20 backdrop-blur-md bg-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    onClick={() => setIsMicEnabled(!isMicEnabled)}
                    disabled={isJoiningRoom}
                    style={{
                      boxShadow: `0 4px 20px ${currentColor}30`,
                    }}
                  >
                    {isMicEnabled ? (
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-sm" />
                    ) : (
                      <MicOff className="h-4 w-4 sm:h-5 sm:w-5 text-white/60 drop-shadow-sm" />
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
                    className="text-center text-sm sm:text-base md:text-lg text-[#D8E2DC] mt-4 mb-6 max-w-2xl mx-auto min-h-[60px] flex items-center justify-center"
                  >
                    <Button
                      variant="glow"
                      size="lg"
                      className="flex items-center justify-center mx-auto w-full max-w-xs md:max-w-md px-4 sm:px-6 py-3 sm:py-4 md:px-10 md:py-6 rounded-2xl text-sm sm:text-base md:text-lg font-semibold shadow-2xl transition-all duration-500 border-0 text-white relative overflow-hidden group hover:scale-105 hover:shadow-3xl disabled:hover:scale-100 disabled:opacity-70"
                      style={{
                        background: `linear-gradient(135deg, ${currentColor}90 0%, ${currentColor}70 50%, ${currentColor}90 100%)`,
                        boxShadow: `0 8px 32px ${currentColor}40, 0 0 0 1px ${currentColor}30`,
                      }}
                      onClick={() => handleJoinRoom()}
                      disabled={!isReady || isJoiningRoom || !isConnected}
                    >
                      {/* Animated background overlay */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(45deg, transparent 30%, ${currentColor} 50%, transparent 70%)`,
                          transform: 'translateX(-100%)',
                          animation: 'shimmer 2s infinite',
                        }}
                      />
                      
                      {isJoiningRoom ? (
                        <>
                          <Loader2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          <span className="font-medium">Joining Room...</span>
                        </>
                      ) : (
                        <span className="flex items-center justify-center gap-2 w-full relative z-10">
                          <span className="font-medium block text-center w-full">
                            Enter Your {validatedMood.charAt(0).toUpperCase() + validatedMood.slice(1)} Room
                          </span>
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
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
                    className="text-center text-sm sm:text-base md:text-lg text-[#D8E2DC] mt-4 mb-6 max-w-2xl mx-auto min-h-[60px] flex items-center justify-center px-4"
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
                  <p className="text-xs sm:text-sm text-yellow-400">Connecting to server...</p>
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