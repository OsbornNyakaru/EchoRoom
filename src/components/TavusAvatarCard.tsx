"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import {
  Bot,
  X,
} from "lucide-react"
import { cn } from "../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { fetchTavusAvatarUrl } from "../utils/tavus"

interface TavusAvatarCardProps {
  personaId: string
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

const TavusAvatarCard: React.FC<TavusAvatarCardProps> = ({
  personaId,
  isOpen,
  onToggle,
  onClose,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setError(null)
    fetchTavusAvatarUrl(personaId)
      .then((url) => setAvatarUrl(url))
      .catch((err) => setError(err.message || "Failed to load Tavus avatar"))
      .finally(() => setLoading(false))
  }, [personaId, isOpen])

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className={cn(
          "relative p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 group cursor-pointer mb-4",
          "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
          "border-white/10 hover:border-white/20"
        )}
        onClick={onToggle}
      >
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="w-16 h-16 border-3 border-white/20 shadow-xl">
            <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Tavus AI Avatar" />
            <AvatarFallback className="text-white font-bold text-lg">
              <Bot className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <h3 className="text-white font-semibold text-sm mb-1 flex items-center justify-center gap-2">
            <Bot className="w-4 h-4" />
            Tavus AI Avatar
          </h3>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
            AI Powered
          </Badge>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="
        z-50 bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative mb-4
        w-full max-w-md
        sm:w-[90vw] sm:max-w-none sm:h-[60vh]
        h-[70vh]
        flex flex-col
      "
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-white/10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Tavus AI Avatar" />
            <AvatarFallback>
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <h3 className="text-white font-semibold flex items-center gap-2">
            Tavus AI Avatar
          </h3>
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="bg-red-500/10 border-red-400/30 text-red-400 hover:bg-red-500/20 p-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="
        relative bg-black/20 flex-1 flex items-center justify-center
        w-full h-full
        min-h-[200px]
      ">
        {loading && <span className="text-white">Loading avatar...</span>}
        {error && <span className="text-red-400">{error}</span>}
        {avatarUrl && (
          <video
            src={avatarUrl}
            controls
            autoPlay
            loop
            className="rounded-lg shadow-lg w-full h-full object-contain"
          />
        )}
      </div>
    </motion.div>
  )
}

export default TavusAvatarCard
