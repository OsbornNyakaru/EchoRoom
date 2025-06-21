"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Mic, MicOff, Volume2, Shield, Radio, Activity } from "lucide-react"
import { cn } from "../../lib/utils"

interface VoiceParticipant {
  userId: string
  userName: string
  isMuted: boolean
  isSpeaking: boolean
  audioLevel: number
  avatar?: string
  mood?: string
  isCurrentUser?: boolean
}

interface VoiceParticipantListProps {
  participants: VoiceParticipant[]
  currentUserId: string
  className?: string
}

const VoiceParticipantList: React.FC<VoiceParticipantListProps> = ({ participants, currentUserId, className }) => {
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

  const VoiceWave: React.FC<{
    isSpeaking: boolean
    isMuted: boolean
    audioLevel: number
    color?: string
  }> = ({ isSpeaking, isMuted, audioLevel, color = "#10b981" }) => {
    const barCount = 4
    const normalizedLevel = Math.min(audioLevel / 100, 1)
    const activeBarCount = Math.ceil(normalizedLevel * barCount)

    return (
      <div className="flex items-center justify-center gap-0.5">
        {[...Array(barCount)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "rounded-full w-0.5 h-3",
              isMuted ? "bg-red-400/50" : i < activeBarCount && isSpeaking ? "bg-current" : "bg-gray-600",
            )}
            style={{ color: isMuted ? "#ef4444" : color }}
            animate={
              isSpeaking && !isMuted && i < activeBarCount
                ? {
                    scaleY: [0.3, 1, 0.3],
                    opacity: [0.5, 1, 0.5],
                  }
                : { scaleY: 0.3, opacity: 0.3 }
            }
            transition={{
              duration: 0.4 + Math.random() * 0.2,
              repeat: isSpeaking && !isMuted && i < activeBarCount ? Number.POSITIVE_INFINITY : 0,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    )
  }

  const ParticipantCard: React.FC<{ participant: VoiceParticipant }> = ({ participant }) => {
    const isCurrentUser = participant.userId === currentUserId
    const moodColor = getMoodColor(participant.mood || "calm")

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
          participant.isSpeaking && !participant.isMuted ? "bg-white/10 border border-white/20" : "hover:bg-white/5",
        )}
      >
        {/* Speaking indicator background */}
        {participant.isSpeaking && !participant.isMuted && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        )}

        <div className="relative z-10 flex items-center gap-3 w-full">
          {/* Avatar with speaking indicator */}
          <div className="relative">
            <Avatar className="w-10 h-10 border-2 border-white/10">
              <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.userName} />
              <AvatarFallback style={{ backgroundColor: moodColor + "20" }} className="text-white font-medium">
                {participant.userName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Speaking ring animation */}
            {participant.isSpeaking && !participant.isMuted && (
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

            {/* Microphone status indicator */}
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

          {/* Participant info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-white truncate">
                {participant.userName || `User ${participant.userId?.substring(0, 5)}`}
              </p>

              {isCurrentUser && (
                <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Shield className="w-2 h-2 mr-1" />
                  You
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">{participant.isMuted ? "Muted" : "Active"}</span>
              </div>

              {participant.mood && (
                <>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400 capitalize">{participant.mood}</span>
                </>
              )}
            </div>
          </div>

          {/* Voice activity indicator */}
          <div className="flex items-center gap-2">
            <VoiceWave
              isSpeaking={participant.isSpeaking}
              isMuted={participant.isMuted}
              audioLevel={participant.audioLevel}
              color={moodColor}
            />

            {/* Audio level number (for debugging) */}
            {participant.isSpeaking && !participant.isMuted && (
              <span className="text-xs text-gray-400 font-mono">{Math.round(participant.audioLevel)}</span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn("bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Voice Chat ({participants.length})
          </h3>

          <motion.div
            className="flex items-center gap-1 text-xs text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Activity className="w-3 h-3" />
            <span>Live</span>
          </motion.div>
        </div>
      </div>

      {/* Participants list */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {participants.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 text-center">
              <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No one in voice chat</p>
            </motion.div>
          ) : (
            <div className="p-2 space-y-1">
              {participants.map((participant, index) => (
                <motion.div
                  key={participant.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ParticipantCard participant={participant} />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default VoiceParticipantList
