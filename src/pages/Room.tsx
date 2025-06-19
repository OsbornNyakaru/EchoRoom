"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useSocketContext } from "../context/SocketContext"
import ChatWindow from "../components/chat/ChatWindow"
import TavusAvatarCard from "../components/TavusAvatarCard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Users,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Heart,
  Coffee,
  Moon,
  Sun,
  Zap,
  Shield,
  Menu,
  X,
  PhoneOff,
  Headphones,
  Radio,
  Waves,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { playZoom } from "../lib/soundUtils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface VoiceWaveProps {
  isSpeaking: boolean
  isMuted: boolean
  size?: "sm" | "md" | "lg"
  color?: string
}

const VoiceWave: React.FC<VoiceWaveProps> = ({ isSpeaking, isMuted, size = "md", color = "#10b981" }) => {
  const barCount = size === "sm" ? 3 : size === "md" ? 4 : 5
  const barHeight = size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-6"
  const barWidth = size === "sm" ? "w-0.5" : size === "md" ? "w-1" : "w-1.5"

  return (
    <div className="flex items-center justify-center gap-0.5">
      {[...Array(barCount)].map((_, i) => (
        <motion.div
          key={i}
          className={cn("rounded-full", barWidth, barHeight, isMuted ? "bg-red-400/50" : "bg-current")}
          style={{ color: isMuted ? "#ef4444" : color }}
          animate={
            isSpeaking && !isMuted
              ? {
                  scaleY: [0.3, 1, 0.3],
                  opacity: [0.5, 1, 0.5],
                }
              : { scaleY: 0.3, opacity: 0.3 }
          }
          transition={{
            duration: 0.5 + Math.random() * 0.3,
            repeat: isSpeaking && !isMuted ? Number.POSITIVE_INFINITY : 0,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

const getMoodIcon = (mood: string) => {
  const icons = {
    hopeful: Sun,
    lonely: Moon,
    motivated: Zap,
    calm: Coffee,
    loving: Heart,
    joyful: Sparkles,
  }
  return icons[mood?.toLowerCase() as keyof typeof icons] || Coffee
}

const getMoodColor = (mood: string) => {
  const colors = {
    hopeful: "#f59e0b",
    lonely: "#6366f1",
    motivated: "#ef4444",
    calm: "#10b981",
    loving: "#ec4899",
    joyful: "#8b5cf6",
  }
  return colors[mood?.toLowerCase() as keyof typeof colors] || "#10b981"
}

const getMoodGradient = (mood: string) => {
  const gradients = {
    hopeful: "from-amber-500/20 to-yellow-500/20",
    lonely: "from-indigo-500/20 to-purple-500/20",
    motivated: "from-red-500/20 to-pink-500/20",
    calm: "from-emerald-500/20 to-teal-500/20",
    loving: "from-pink-500/20 to-rose-500/20",
    joyful: "from-violet-500/20 to-purple-500/20",
  }
  return gradients[mood?.toLowerCase() as keyof typeof gradients] || gradients.calm
}

const ParticipantCard: React.FC<{
  participant: any
  isCurrentUser: boolean
  isCompact?: boolean
}> = ({ participant, isCurrentUser, isCompact = false }) => {
  const moodColor = getMoodColor(participant.mood)
  const moodGradient = getMoodGradient(participant.mood)
  const MoodIcon = getMoodIcon(participant.mood)

  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group"
      >
        <div className="relative">
          <Avatar className="w-10 h-10 border-2 border-white/10">
            <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.userName} />
            <AvatarFallback style={{ backgroundColor: moodColor + "20" }}>
              {participant.userName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          {participant.isSpeaking && (
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: moodColor }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )}

          <div
            className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900",
              participant.isMuted ? "bg-red-500" : "bg-green-500",
            )}
          >
            {participant.isMuted ? (
              <MicOff className="w-2.5 h-2.5 text-white" />
            ) : (
              <Mic className="w-2.5 h-2.5 text-white" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white truncate">
              {participant.userName || `User ${participant.userId?.substring(0, 5)}`}
            </p>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                You
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <MoodIcon className="w-3 h-3" style={{ color: moodColor }} />
            <span className="text-xs text-gray-400 capitalize">{participant.mood}</span>
          </div>
        </div>

        <div className="flex items-center">
          <VoiceWave isSpeaking={participant.isSpeaking} isMuted={participant.isMuted} size="sm" color={moodColor} />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className={cn(
        "relative p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 group",
        `bg-gradient-to-br ${moodGradient}`,
        "border-white/10 hover:border-white/20",
      )}
    >
      {isCurrentUser && (
        <motion.div
          className="absolute top-3 right-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Shield className="w-3 h-3 mr-1" />
            You
          </Badge>
        </motion.div>
      )}

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
            <Avatar className="w-20 h-20 border-3 border-white/20 shadow-xl">
              <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.userName} />
              <AvatarFallback style={{ backgroundColor: moodColor + "30" }} className="text-white font-bold text-lg">
                {participant.userName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            {participant.isSpeaking && !participant.isMuted && (
              <motion.div
                className="absolute inset-0 rounded-full border-3"
                style={{ borderColor: moodColor }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.div>

          <motion.div className="absolute -bottom-2 -right-2" whileHover={{ scale: 1.1 }}>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-900",
                participant.isMuted ? "bg-red-500" : "bg-green-500",
              )}
            >
              {participant.isMuted ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
            </div>
          </motion.div>
        </div>

        <div className="text-center">
          <h3 className="text-white font-semibold text-lg mb-2 truncate max-w-[140px]">
            {participant.userName || `User ${participant.userId?.substring(0, 5)}`}
          </h3>
          <div className="flex items-center justify-center gap-2 mb-3">
            <MoodIcon className="w-4 h-4" style={{ color: moodColor }} />
            <span className="text-gray-300 capitalize text-sm font-medium">{participant.mood || "calm"}</span>
          </div>
        </div>

        <div className="flex items-center justify-center h-8">
          <VoiceWave isSpeaking={participant.isSpeaking} isMuted={participant.isMuted} size="md" color={moodColor} />
        </div>
      </div>
    </motion.div>
  )
}

const Room: React.FC = () => {
  const {
    isConnected,
    roomId,
    participants,
    joinRoom,
    leaveRoom,
    userId,
    userName,
  } = useSocketContext()
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const mood = searchParams.get("mood") || "calm"

  const [currentView] = useState<"chat" | "participants">("chat")
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [sessionTime, setSessionTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [hasPlayedZoom, setHasPlayedZoom] = useState(false)

  // Tavus Avatar state
  const [isTavusOpen, setIsTavusOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isParticipantsSheetOpen, setIsParticipantsSheetOpen] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const [setShowScrollToBottom] = useState(false)

  const moodColor = getMoodColor(mood)
  const MoodIcon = getMoodIcon(mood)

  // Update connection status based on socket state
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("connected")
      setIsLoading(false)
    } else {
      setConnectionStatus("disconnected")
    }
  }, [isConnected])

  // Play zoom sound when successfully connected to room
  useEffect(() => {
    if (roomId && isConnected && !hasPlayedZoom) {
      const timer = setTimeout(() => {
        playZoom()
        setHasPlayedZoom(true)
      }, 800) // Delay to ensure room is fully loaded

      return () => clearTimeout(timer)
    }
  }, [roomId, isConnected, hasPlayedZoom])

  // Session timer
  useEffect(() => {
    if (roomId) {
      const timer = setInterval(() => {
        setSessionTime((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [roomId])

  // Auto-join room based on mood
  useEffect(() => {
    const autoJoinRoom = async () => {
      if (!isConnected || !userId || !userName || roomId) return

      try {
        console.log("[Room.tsx] Auto-joining room for mood:", mood)
        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const response = await fetch(`${backendUrl}/api/sessions`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const sessions = await response.json()
        const matchingSession = sessions.find((s: any) => s.category.toLowerCase() === mood.toLowerCase())

        if (matchingSession) {
          joinRoom({
            roomId: matchingSession.id,
            userId: userId,
            userName: userName,
            mood: mood,
          })
        }
      } catch (error) {
        console.error("[Room.tsx] Error auto-joining room:", error)
      }
    }

    autoJoinRoom()
  }, [isConnected, userId, userName, mood, roomId, joinRoom])

  // Handle leaving room
  const handleLeaveRoom = useCallback(() => {
    leaveRoom()
    navigate("/")
  }, [leaveRoom, navigate])

  // Format session time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Tavus Avatar handlers
  const handleTavusToggle = () => {
    setIsTavusOpen(!isTavusOpen)
  }

  const handleTavusClose = () => {
    setIsTavusOpen(false)
  }

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current && currentView === "chat") {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [participants, currentView])

  // Show scroll-to-bottom button if not at bottom

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          className="backdrop-blur-sm bg-white/5 border border-white/10 p-8 rounded-2xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <p className="text-white text-lg">Connecting to your {mood} room...</p>
          <p className="text-gray-400 text-sm mt-2">Finding the perfect space for you</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${moodColor}40 0%, transparent 70%)` }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${moodColor}40 0%, transparent 70%)` }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Mobile floating indicators */}
      <div className="lg:hidden fixed top-20 right-4 z-30 flex flex-col gap-2 pointer-events-none">
        {participants
          .filter((p) => p.isSpeaking && !p.isMuted)
          .slice(0, 3)
          .map((speaker) => (
            <motion.div
              key={speaker.userId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={speaker.avatar || "/placeholder.svg"} alt={speaker.userName} />
                <AvatarFallback>{speaker.userName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-white font-medium">{speaker.userName}</span>
              <VoiceWave isSpeaking={true} isMuted={false} size="sm" color={getMoodColor(speaker.mood)} />
            </motion.div>
          ))}
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.header
          className="p-4 lg:p-6 border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 bg-gray-900/95 backdrop-blur-xl border-white/10">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: moodColor + "20", border: `2px solid ${moodColor}40` }}
                      >
                        <MoodIcon className="w-6 h-6" style={{ color: moodColor }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white capitalize">{mood} Room</h2>
                        <p className="text-sm text-gray-400">{participants.length} participants</p>
                      </div>
                    </div>

                    <Separator className="my-4 bg-white/10" />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Participants</h3>
                      <ScrollArea className="h-[400px]">
                        {participants.map((participant) => (
                          <ParticipantCard
                            key={participant.userId}
                            participant={participant}
                            isCurrentUser={participant.userId === userId}
                            isCompact
                          />
                        ))}
                      </ScrollArea>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: moodColor + "20", border: `2px solid ${moodColor}40` }}
                >
                  <MoodIcon className="w-6 h-6" style={{ color: moodColor }} />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white capitalize">{mood} Room</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          connectionStatus === "connected"
                            ? "bg-green-400"
                            : connectionStatus === "connecting"
                              ? "bg-yellow-400"
                              : "bg-red-400",
                        )}
                      />
                      <span className="text-gray-300">
                        {connectionStatus === "connected"
                          ? "Connected"
                          : connectionStatus === "connecting"
                            ? "Connecting..."
                            : "Disconnected"}
                      </span>
                    </div>
                    {roomId && (
                      <>
                        <Separator orientation="vertical" className="h-4 bg-white/20" />
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300">{formatTime(sessionTime)}</span>
                        </div>
                        <Separator orientation="vertical" className="h-4 bg-white/20" />
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-300">{participants.length} online</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile: participants button */}
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden bg-white/5 border-white/20 text-white hover:bg-white/10"
                onClick={() => setIsParticipantsSheetOpen(true)}
              >
                <Users className="h-5 w-5" />
              </Button>
              {/* Voice Controls (desktop only) */}
              <motion.div
                className="hidden lg:flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-white/5 border-white/20 text-white hover:bg-white/10",
                    isMuted && "bg-red-500/20 border-red-400/50 text-red-400",
                  )}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={() => setIsDeafened(!isDeafened)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-white/5 border-white/20 text-white hover:bg-white/10",
                    isDeafened && "bg-red-500/20 border-red-400/50 text-red-400",
                  )}
                >
                  {isDeafened ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </motion.div>
              <Button
                onClick={handleLeaveRoom}
                variant="outline"
                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Leave</span>
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Participants Sheet for Mobile */}
        <Sheet open={isParticipantsSheetOpen} onOpenChange={setIsParticipantsSheetOpen}>
          <SheetContent
            side="right"
            className="p-0 pt-10 max-w-[90vw] w-[300px] bg-gray-900/95 backdrop-blur-xl border-white/10"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-white">Participants ({participants.length})</h2>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsParticipantsSheetOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="overflow-y-auto h-[calc(100vh-6rem)] p-2">
              {participants.map((participant) => (
                <ParticipantCard
                  key={participant.userId}
                  participant={participant}
                  isCurrentUser={participant.userId === userId}
                  isCompact
                />
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        {roomId ? (
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Chat Area - Full space with integrated MessageInput */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <ChatWindow />
            </div>

            {/* Participants Sidebar - Desktop */}
            <motion.div
              className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-white/10 bg-black/10 backdrop-blur-sm"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants ({participants.length})
                  </h2>
                  <motion.div
                    className="flex items-center gap-1 text-xs text-gray-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Radio className="w-3 h-3" />
                    <span>Live</span>
                  </motion.div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-3">
                <TavusAvatarCard
                  mood={mood}
                  isOpen={isTavusOpen}
                  onToggle={handleTavusToggle}
                  onClose={handleTavusClose}
                />
                {participants.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center justify-center h-full text-center p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Waves className="h-12 w-12 text-gray-400 mb-3" />
                    </motion.div>
                    <h3 className="text-base font-semibold text-white mb-2">Waiting for others...</h3>
                    <p className="text-gray-400 text-xs">Your conversation will begin shortly</p>
                  </motion.div>
                ) : (
                  <div className="grid gap-3">
                    <AnimatePresence>
                      {participants.map((participant, index) => (
                        <motion.div
                          key={participant.userId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ParticipantCard participant={participant} isCurrentUser={participant.userId === userId} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          </div>
        ) : (
          <motion.div
            className="flex-grow flex items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="backdrop-blur-sm bg-white/5 border border-white/10 p-8 rounded-2xl text-center max-w-md">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              >
                <Sparkles className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Connecting to Room</h3>
              <p className="text-gray-300 mb-4">
                We're finding the perfect {mood} space for you to connect with others
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
          className="lg:hidden p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 max-w-[140px] bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm",
                isMuted && "bg-red-500/20 border-red-400/50 text-red-400",
              )}
            >
              {isMuted ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>
            <Button
              onClick={() => setIsDeafened(!isDeafened)}
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 max-w-[140px] bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm",
                isDeafened && "bg-red-500/20 border-red-400/50 text-red-400",
              )}
            >
              {isDeafened ? <VolumeX className="h-5 w-5 mr-2" /> : <Headphones className="h-5 w-5 mr-2" />}
              {isDeafened ? "Listen" : "Deafen"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Room
