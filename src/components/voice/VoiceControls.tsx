"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Mic,
  MicOff,
  VolumeX,
  Headphones,
  Radio,
  Wifi,
  WifiOff,
  Settings,
  Users,
  Activity,
  Zap,
  AlertCircle,
} from "lucide-react"
import { cn } from "../../lib/utils"

interface VoiceControlsProps {
  isConnected: boolean
  isConnecting: boolean
  isMuted: boolean
  isDeafened: boolean
  audioLevel: number
  participantCount: number
  error?: string | null
  onToggleMute: () => void
  onToggleDeafen: () => void
  onConnect: () => void
  onDisconnect: () => void
  className?: string
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isConnected,
  isConnecting,
  isMuted,
  isDeafened,
  audioLevel,
  participantCount,
  error,
  onToggleMute,
  onToggleDeafen,
  onConnect,
  onDisconnect,
  className,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [pushToTalkActive, setPushToTalkActive] = useState(false)

  // Push to talk key handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && event.ctrlKey && !pushToTalkActive) {
        event.preventDefault()
        setPushToTalkActive(true)
        // Implement push to talk logic here
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space" && event.ctrlKey && pushToTalkActive) {
        event.preventDefault()
        setPushToTalkActive(false)
        // Implement push to talk logic here
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [pushToTalkActive])

  // Audio level visualization
  const AudioLevelIndicator: React.FC<{ level: number; isMuted: boolean }> = ({ level, isMuted }) => {
    const bars = 5
    const activeBarCount = Math.ceil((level / 100) * bars)

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(bars)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "w-1 h-4 rounded-full transition-colors duration-150",
              i < activeBarCount && !isMuted ? "bg-green-400" : isMuted ? "bg-red-400/30" : "bg-gray-600",
            )}
            animate={
              i < activeBarCount && !isMuted
                ? {
                    scaleY: [0.5, 1, 0.5],
                    opacity: [0.7, 1, 0.7],
                  }
                : { scaleY: 0.5, opacity: 0.3 }
            }
            transition={{
              duration: 0.3,
              repeat: i < activeBarCount && !isMuted ? Number.POSITIVE_INFINITY : 0,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={cn("bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              className={cn(
                "w-3 h-3 rounded-full",
                isConnected ? "bg-green-400" : isConnecting ? "bg-yellow-400" : "bg-red-400",
              )}
              animate={
                isConnecting
                  ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }
                  : isConnected
                    ? { scale: [1, 1.1, 1] }
                    : {}
              }
              transition={{
                duration: isConnecting ? 1 : 2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
            {isConnected ? (
              <Wifi className="absolute -top-1 -right-1 w-2 h-2 text-green-400" />
            ) : (
              <WifiOff className="absolute -top-1 -right-1 w-2 h-2 text-red-400" />
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-white">
              {isConnected ? "Voice Connected" : isConnecting ? "Connecting..." : "Voice Disconnected"}
            </p>
            {isConnected && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Users className="w-3 h-3" />
                <span>{participantCount} in voice</span>
              </div>
            )}
          </div>
        </div>

        {/* Connection Toggle */}
        {!isConnected && !isConnecting && (
          <Button
            onClick={onConnect}
            size="sm"
            className="bg-green-500/20 border-green-400/50 text-green-400 hover:bg-green-500/30"
          >
            <Radio className="w-4 h-4 mr-2" />
            Join Voice
          </Button>
        )}

        {isConnected && (
          <Button
            onClick={onDisconnect}
            size="sm"
            variant="outline"
            className="bg-red-500/10 border-red-400/30 text-red-400 hover:bg-red-500/20"
          >
            Leave Voice
          </Button>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls */}
      <div className="flex items-center gap-3 mb-4">
        {/* Microphone Control */}
        <motion.div className="flex-1">
          <motion.button
            type="button"
            onClick={onToggleMute}
            disabled={!isConnected}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3",
              isMuted
                ? "bg-red-500/20 border-red-400/50 text-red-400 hover:bg-red-500/30"
                : "bg-green-500/20 border-green-400/50 text-green-400 hover:bg-green-500/30",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="font-medium">{isMuted ? "Unmute" : "Mute"}</span>
          </motion.button>

          {/* Audio Level Indicator */}
          {isConnected && (
            <div className="flex items-center justify-center mt-2 gap-2">
              <Activity className="w-3 h-3 text-gray-400" />
              <AudioLevelIndicator level={audioLevel} isMuted={isMuted} />
            </div>
          )}
        </motion.div>

        {/* Deafen Control */}
        <motion.div className="flex-1">
          <motion.button
            onClick={onToggleDeafen}
            disabled={!isConnected}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3",
              isDeafened
                ? "bg-red-500/20 border-red-400/50 text-red-400 hover:bg-red-500/30"
                : "bg-white/5 border-white/20 text-white hover:bg-white/10",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isDeafened ? <VolumeX className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
            <span className="font-medium">{isDeafened ? "Listen" : "Deafen"}</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Advanced Controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <Settings className="w-4 h-4 mr-2" />
          Advanced
        </Button>

        {/* Push to Talk Indicator */}
        <AnimatePresence>
          {pushToTalkActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Push to Talk
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Settings Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Push to Talk</span>
                <Badge variant="outline" className="text-xs">
                  Ctrl + Space
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Voice Activity</span>
                <Badge variant="outline" className="text-xs">
                  Auto-detect
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Audio Quality</span>
                <Badge variant="outline" className="text-xs">
                  High
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default VoiceControls
