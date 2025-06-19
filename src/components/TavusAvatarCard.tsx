"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import {
  Bot,
  Video,
  VideoOff,
  Mic,
  MicOff,
  X,
  Sparkles,
  Zap,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Shield,
  Radio,
  Brain,
  Cpu,
  Activity,
} from "lucide-react"
import { cn } from "../lib/utils"
import DailyIframe from "@daily-co/daily-js"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const tavusApiKey = import.meta.env.VITE_TAVUS_API_KEY
const personaId = import.meta.env.VITE_TAVUS_PERSONA_ID

interface TavusAvatarCardProps {
  mood: string
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

const TavusAvatarCard: React.FC<TavusAvatarCardProps> = ({ mood, isOpen, onToggle, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const callFrameRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const backendUrl = VITE_BACKEND_URL

  const getMoodConfig = (mood: string) => {
    const configs = {
      hopeful: { icon: Sparkles, color: "#f59e0b", gradient: "from-amber-500/20 to-yellow-500/20" },
      lonely: { icon: Brain, color: "#6366f1", gradient: "from-indigo-500/20 to-purple-500/20" },
      motivated: { icon: Zap, color: "#ef4444", gradient: "from-red-500/20 to-pink-500/20" },
      calm: { icon: Activity, color: "#10b981", gradient: "from-emerald-500/20 to-teal-500/20" },
      loving: { icon: Sparkles, color: "#ec4899", gradient: "from-pink-500/20 to-rose-500/20" },
      joyful: { icon: Sparkles, color: "#8b5cf6", gradient: "from-violet-500/20 to-purple-500/20" },
    }
    return configs[mood?.toLowerCase() as keyof typeof configs] || configs.calm
  }

  const moodConfig = getMoodConfig(mood)
  const MoodIcon = moodConfig.icon

  // Simulate speaking animation when connected
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(
        () => {
          setIsSpeaking((prev) => !prev)
        },
        2000 + Math.random() * 3000,
      ) // Random speaking intervals

      return () => clearInterval(interval)
    }
  }, [isConnected])

  // Initialize Tavus conversation when component mounts
  useEffect(() => {
    const initializeTavusConversation = async () => {
      try {
        setIsConnecting(true)
        setError(null)

        const response = await fetch("https://tavusapi.com/v2/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": tavusApiKey,
          },
          body: JSON.stringify({ persona_id: personaId, properties: { apply_greenscreen: true }, mood }),
        })

        if (!response.ok) {
          throw new Error("Failed to create Tavus conversation")
        }

        const data = await response.json()
        setConversationId(data.conversation_id)
      } catch (err) {
        console.error("Error initializing Tavus conversation:", err)
        setError("Failed to initialize AI avatar")
      } finally {
        setIsConnecting(false)
      }
    }

    if (isOpen && !conversationId) {
      initializeTavusConversation()
    }
  }, [isOpen, mood, conversationId])

  // Initialize Daily call frame when conversation is ready
  useEffect(() => {
    const initializeDailyCall = async () => {
      if (!conversationId || !containerRef.current) return

      try {
        setIsConnecting(true)

        const response = await fetch(`${backendUrl}/api/tavus/get-daily-room`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conversation_id: conversationId }),
        })

        if (!response.ok) {
          throw new Error("Failed to get Daily room URL")
        }

        const { room_url } = await response.json()

        callFrameRef.current = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: {
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "1rem",
          },
          showLeaveButton: false,
          showFullscreenButton: false,
          showLocalVideo: false,
          showParticipantsBar: false,
        })

        callFrameRef.current
          .on("joined-meeting", () => {
            setIsConnected(true)
            setIsConnecting(false)
          })
          .on("left-meeting", () => {
            setIsConnected(false)
          })
          .on("error", (error: any) => {
            console.error("Daily call error:", error)
            setError("Connection error occurred")
            setIsConnecting(false)
          })

        await callFrameRef.current.join({ url: room_url })
      } catch (err) {
        console.error("Error initializing Daily call:", err)
        setError("Failed to connect to AI avatar")
        setIsConnecting(false)
      }
    }

    if (conversationId && isOpen) {
      initializeDailyCall()
    }

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy()
        callFrameRef.current = null
      }
    }
  }, [conversationId, isOpen])

  const handleClose = async () => {
    try {
      if (callFrameRef.current) {
        await callFrameRef.current.leave()
        callFrameRef.current.destroy()
        callFrameRef.current = null
      }

      if (conversationId) {
        await fetch(`${backendUrl}/api/tavus/end-conversation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conversation_id: conversationId }),
        })
      }

      setConversationId(null)
      setIsConnected(false)
      setIsConnecting(false)
      setError(null)
      setIsExpanded(false)
      setIsSpeaking(false)
      onClose()
    } catch (err) {
      console.error("Error closing Tavus session:", err)
      onClose()
    }
  }

  const toggleVideo = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalVideo(!isVideoEnabled)
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  const toggleAudio = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!isAudioEnabled)
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  const toggleMute = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  // Voice Wave Component for AI Avatar
  const VoiceWave: React.FC<{ isSpeaking: boolean; size?: "sm" | "md" | "lg"; color?: string }> = ({
    isSpeaking,
    size = "md",
    color = moodConfig.color,
  }) => {
    const barCount = size === "sm" ? 3 : size === "md" ? 4 : 5
    const barHeight = size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-6"
    const barWidth = size === "sm" ? "w-0.5" : size === "md" ? "w-1" : "w-1.5"

    return (
      <div className="flex items-center justify-center gap-0.5">
        {[...Array(barCount)].map((_, i) => (
          <motion.div
            key={i}
            className={cn("rounded-full", barWidth, barHeight, "bg-current")}
            style={{ color }}
            animate={
              isSpeaking
                ? {
                    scaleY: [0.3, 1, 0.3],
                    opacity: [0.5, 1, 0.5],
                  }
                : { scaleY: 0.3, opacity: 0.3 }
            }
            transition={{
              duration: 0.5 + Math.random() * 0.3,
              repeat: isSpeaking ? Number.POSITIVE_INFINITY : 0,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    )
  }

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className={cn(
          "relative p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 group cursor-pointer mb-4",
          `bg-gradient-to-br ${moodConfig.gradient}`,
          "border-white/10 hover:border-white/20",
        )}
        onClick={onToggle}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
              <Avatar className="w-16 h-16 border-3 border-white/20 shadow-xl">
                <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Tavus AI Avatar" />
                <AvatarFallback
                  style={{ backgroundColor: moodConfig.color + "30" }}
                  className="text-white font-bold text-lg"
                >
                  <Bot className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>

              <motion.div
                className="absolute inset-0 rounded-full border-3"
                style={{ borderColor: moodConfig.color }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            <motion.div className="absolute -bottom-2 -right-2" whileHover={{ scale: 1.1 }}>
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg border-2 border-gray-900">
                <Cpu className="w-3 h-3 text-white" />
              </div>
            </motion.div>
          </div>

          <div className="text-center">
            <h3 className="text-white font-semibold text-sm mb-1 flex items-center justify-center gap-2">
              <Bot className="w-4 h-4" />
              Tavus AI Avatar
            </h3>
            <div className="flex items-center justify-center gap-2 mb-2">
              <MoodIcon className="w-3 h-3" style={{ color: moodConfig.color }} />
              <span className="text-gray-300 capitalize text-xs font-medium">{mood} Assistant</span>
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
              <Shield className="w-2 h-2 mr-1" />
              AI Powered
            </Badge>
          </div>

          <div className="flex items-center justify-center h-6">
            <VoiceWave isSpeaking={false} size="sm" color={moodConfig.color} />
          </div>
        </div>

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </motion.div>
    )
  }

  return (
    <>
      {/* Backdrop overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "z-50 bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/20",
          isExpanded ? "fixed inset-4 w-auto h-auto" : "relative mb-4",
        )}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
        style={{
          background: `linear-gradient(135deg, ${moodConfig.color}10 0%, rgba(255, 255, 255, 0.08) 100%)`,
          borderColor: moodConfig.color + "30",
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b border-white/10 relative overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${moodConfig.color}15 0%, rgba(255, 255, 255, 0.05) 100%)`,
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
                  repeat: Number.POSITIVE_INFINITY,
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
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-white/10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Tavus AI Avatar" />
                  <AvatarFallback style={{ backgroundColor: moodConfig.color + "20" }}>
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>

                {isSpeaking && isConnected && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: moodConfig.color }}
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

                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900 bg-blue-500">
                  <Cpu className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  Tavus AI Avatar
                  {isConnected && (
                    <motion.div
                      className="flex items-center gap-1 text-xs text-gray-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Radio className="w-3 h-3" />
                      <span>Live</span>
                    </motion.div>
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <MoodIcon className="w-3 h-3" style={{ color: moodConfig.color }} />
                  <span className="text-xs text-gray-400 capitalize">{mood} Assistant</span>
                  <span className="text-xs text-gray-400">
                    {isConnecting ? "Connecting..." : isConnected ? "Connected" : error ? "Connection failed" : "Ready"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 p-2"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                size="sm"
                className="bg-red-500/10 border-red-400/30 text-red-400 hover:bg-red-500/20 p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Voice Wave Indicator */}
          <div className="flex items-center justify-center mt-3">
            <VoiceWave isSpeaking={isSpeaking && isConnected} size="sm" color={moodConfig.color} />
          </div>
        </div>

        {/* Video Container */}
        <div className={cn("relative bg-black/20", isExpanded ? "flex-1" : "h-48")}>
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
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
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
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
          className="p-3 border-t border-white/10"
          style={{
            background: `linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, ${moodConfig.color}10 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleVideo}
                variant="outline"
                size="sm"
                className={cn(
                  "bg-white/5 border-white/20 text-white hover:bg-white/10 p-2",
                  !isVideoEnabled && "bg-red-500/20 border-red-400/50 text-red-400",
                )}
                disabled={!isConnected}
              >
                {isVideoEnabled ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
              </Button>

              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
                className={cn(
                  "bg-white/5 border-white/20 text-white hover:bg-white/10 p-2",
                  isMuted && "bg-red-500/20 border-red-400/50 text-red-400",
                )}
                disabled={!isConnected}
              >
                {isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              </Button>

              <Button
                onClick={toggleAudio}
                variant="outline"
                size="sm"
                className={cn(
                  "bg-white/5 border-white/20 text-white hover:bg-white/10 p-2",
                  !isAudioEnabled && "bg-red-500/20 border-red-400/50 text-red-400",
                )}
                disabled={!isConnected}
              >
                {isAudioEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected
                    ? "bg-green-400 animate-pulse"
                    : isConnecting
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-red-400",
                )}
              />
              <span>{isConnected ? "Live" : isConnecting ? "Connecting" : "Offline"}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default TavusAvatarCard
