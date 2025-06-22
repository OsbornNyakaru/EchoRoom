"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { Bot, X, Loader2, AlertCircle, Maximize2, Minimize2, Phone, Video } from "lucide-react"
import { cn } from "../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { useTavusAvatar } from "../hooks/useTavusAvatar"
import ElevenLabsConvoAIWidget from "./ElevenLabsConvoAIWidget"
import WebRTCVideoCall from "./WebRTCVideoCall"
import { createPortal } from "react-dom"

interface TavusAvatarCardProps {
  personaId: string
  replicaId: string
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  localImageUrl?: string
}

const TavusAvatarCard: React.FC<TavusAvatarCardProps> = ({ 
  personaId, 
  replicaId, 
  isOpen, 
  onToggle, 
  onClose,
  localImageUrl
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeMode, setActiveMode] = useState<'preview' | 'call' | 'voice'>('preview')
  
  // Only fetch Tavus avatar if no local image is provided
  const { avatarUrl: tavusAvatarUrl, loading, error, isDemo, isStaticImage: tavusIsStaticImage, refetch } = useTavusAvatar(isOpen && !localImageUrl ? personaId : null)

  // Use local image if provided, otherwise use Tavus avatar
  const avatarUrl = localImageUrl || tavusAvatarUrl
  const isStaticImage = localImageUrl ? true : tavusIsStaticImage
  const isLocalImage = !!localImageUrl

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset mode when closing
  useEffect(() => {
    if (!isOpen) {
      setActiveMode('preview')
    }
  }, [isOpen])

  // Handle mode changes
  const handleStartVideoCall = () => {
    setActiveMode('call')
  }

  const handleEndVideoCall = () => {
    setActiveMode('preview')
  }

  const handleStartVoiceCall = () => {
    setActiveMode('voice')
  }

  // Collapsed state
  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative overflow-hidden rounded-3xl backdrop-blur-md border transition-all duration-500",
          "bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10",
          "border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/10",
          "cursor-pointer group p-6 mb-4",
          "w-full max-w-sm mx-auto",
        )}
        onClick={onToggle}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-white/20 shadow-2xl ring-4 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all duration-300">
              <AvatarImage src={localImageUrl || "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop"} alt="AI Avatar" />
              <AvatarFallback className="text-white font-bold text-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <Bot className="w-10 h-10" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white/20 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-white font-semibold text-lg flex items-center justify-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              AI Avatar
            </h3>
            <p className="text-white/70 text-sm">Click to start conversation</p>
            <div className="text-xs text-white/50 font-mono">
              Replica: {replicaId}
            </div>
            {isLocalImage && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs font-medium px-2 py-1">
                Custom Image
              </Badge>
            )}
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-medium px-3 py-1">
            AI Powered
          </Badge>
        </div>
      </motion.div>
    )
  }

  // Expanded state content
  const expandedContent = (
    <AnimatePresence>
      {/* Mobile/Tablet Modal (up to lg breakpoint) */}
      <motion.div
        className={cn(
          "lg:hidden fixed inset-0 z-[9999] flex items-center justify-center p-4",
          "bg-black/50 backdrop-blur-sm",
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget && activeMode !== 'call') onClose()
        }}
      >
        <motion.div
          className={cn(
            "relative bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden",
            "shadow-2xl border border-white/20",
            "flex flex-col w-full max-w-2xl h-[90vh] max-h-[800px]",
          )}
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.4, type: "spring", damping: 25 }}
        >
          {/* Mobile Header */}
          {activeMode !== 'call' && (
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white/20 ring-2 ring-emerald-500/30">
                  <AvatarImage src={localImageUrl || "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop"} alt="AI Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500">
                    <Bot className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold text-base flex items-center gap-2">
                    AI Avatar
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </h3>
                  <p className="text-white/60 text-xs">Interactive AI Assistant</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white/40 text-xs font-mono">Replica: {replicaId}</p>
                    {isLocalImage && (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs px-1 py-0">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
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
          )}

          {/* Mobile Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeMode === 'call' ? (
              <WebRTCVideoCall
                personaId={personaId}
                replicaId={replicaId}
                isActive={true}
                onCallEnd={handleEndVideoCall}
                className="flex-1"
                showCustomControls={false} // Hide custom controls by default
              />
            ) : (
              <>
                <div className="flex-1 bg-black/20 flex flex-col min-h-0 relative">
                  <MobileContent
                    loading={isLocalImage ? false : loading}
                    error={isLocalImage ? null : error}
                    avatarUrl={avatarUrl}
                    isDemo={isLocalImage ? false : isDemo}
                    isStaticImage={isStaticImage}
                    isLocalImage={isLocalImage}
                    onRetry={refetch}
                    onStartVideoCall={handleStartVideoCall}
                    onStartVoiceCall={handleStartVoiceCall}
                    activeMode={activeMode}
                  />
                </div>
                {activeMode === 'voice' && (
                  <div className="border-t border-white/10 bg-white/5 p-4 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-white">Voice Assistant</span>
                      <span className="text-xs text-white/60 ml-auto">ElevenLabs ConvoAI</span>
                    </div>
                    <ElevenLabsConvoAIWidget agentId="agent_01jx8ahxfveh2r99gz4x07hd0w" />
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Desktop Modal (lg and above) */}
      <motion.div
        className={cn(
          "hidden lg:flex fixed inset-0 z-[9999] items-center justify-center p-6",
          "bg-black/50 backdrop-blur-sm",
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget && activeMode !== 'call') onClose()
        }}
      >
        <motion.div
          className={cn(
            "relative bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden",
            "shadow-2xl border border-white/20",
            "flex flex-col",
            isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-6xl h-[90vh] max-h-[1000px]",
          )}
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.4, type: "spring", damping: 25 }}
        >
          {/* Desktop Header */}
          {activeMode !== 'call' && (
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 flex-shrink-0">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border-2 border-white/20 ring-2 ring-emerald-500/30">
                  <AvatarImage src={localImageUrl || "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&fit=crop"} alt="AI Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500">
                    <Bot className="w-7 h-7 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-bold text-xl flex items-center gap-3">
                    AI Avatar
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </h3>
                  <p className="text-white/70 text-base">Interactive AI Assistant Experience</p>
                  <div className="flex items-center gap-3">
                    <p className="text-white/50 text-sm font-mono">Replica: {replicaId}</p>
                    {isLocalImage && (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs px-2 py-1">
                        Custom Image
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  variant="outline"
                  size="lg"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 px-4"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="h-4 w-4 mr-2" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Fullscreen
                    </>
                  )}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                  className="bg-red-500/10 border-red-400/30 text-red-400 hover:bg-red-500/20 px-4"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {activeMode === 'call' ? (
              <WebRTCVideoCall
                personaId={personaId}
                replicaId={replicaId}
                isActive={true}
                onCallEnd={handleEndVideoCall}
                className="flex-1"
                showCustomControls={false} // Hide custom controls by default
              />
            ) : (
              <>
                {/* Video Section */}
                <div className="flex-1 bg-black/20 flex flex-col min-h-0 relative">
                  <DesktopContent
                    loading={isLocalImage ? false : loading}
                    error={isLocalImage ? null : error}
                    avatarUrl={avatarUrl}
                    isDemo={isLocalImage ? false : isDemo}
                    isStaticImage={isStaticImage}
                    isLocalImage={isLocalImage}
                    onRetry={refetch}
                    onStartVideoCall={handleStartVideoCall}
                    onStartVoiceCall={handleStartVoiceCall}
                    activeMode={activeMode}
                  />
                </div>

                {/* ConvoAI Section */}
                {activeMode === 'voice' && (
                  <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-white/5 flex flex-col">
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-lg font-semibold text-white">Voice Assistant</span>
                      </div>
                      <p className="text-white/60 text-sm">
                        Powered by ElevenLabs ConvoAI - Click to start voice conversation
                      </p>
                    </div>

                    <div className="flex-1 p-6 flex items-center justify-center">
                      <div className="w-full">
                        <ElevenLabsConvoAIWidget agentId="agent_01jx8ahxfveh2r99gz4x07hd0w" />
                      </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/10">
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <span>Status: Connected</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span>Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  // Use portal to render outside of parent container
  if (!mounted) return null

  return typeof window !== "undefined" && isOpen ? createPortal(expandedContent, document.body) : expandedContent
}

// Shared content components
const MobileContent: React.FC<{
  loading: boolean
  error: string | null
  avatarUrl: string | null
  isDemo: boolean
  isStaticImage: boolean
  isLocalImage: boolean
  onRetry: () => void
  onStartVideoCall: () => void
  onStartVoiceCall: () => void
  activeMode: 'preview' | 'call' | 'voice'
}> = ({ loading, error, avatarUrl, isDemo, isStaticImage, isLocalImage, onRetry, onStartVideoCall, onStartVoiceCall, activeMode }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 relative">
      <AnimatePresence mode="wait">
        {loading && !isLocalImage && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-white"
          >
            <Loader2 className="w-12 h-12 animate-spin text-emerald-400" />
            <p className="text-lg font-medium">Loading avatar...</p>
            <p className="text-sm text-white/60">Preparing your AI assistant</p>
          </motion.div>
        )}

        {error && !isLocalImage && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-center max-w-md"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <p className="text-red-400 font-medium text-lg mb-2">Connection Failed</p>
              <p className="text-white/70 text-sm">{error}</p>
            </div>
            <Button
              onClick={onRetry}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {avatarUrl && (!loading || isLocalImage) && (!error || isLocalImage) && (
          <motion.div
            key="media"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Media Container */}
            <div className="relative w-full max-w-sm aspect-square">
              {isStaticImage ? (
                <img
                  src={avatarUrl}
                  alt="AI Avatar Preview"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl"
                />
              ) : (
                <video
                  src={avatarUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover rounded-2xl shadow-2xl"
                />
              )}
              
              {/* Overlay with Buttons */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-2xl flex flex-col justify-end p-6">
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {isLocalImage ? "Custom Avatar Ready" : "AI Avatar Ready"}
                  </h3>
                  <p className="text-white/80 text-sm">Choose how you'd like to interact</p>
                  {isLocalImage && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs mt-2">
                      Using Custom Image
                    </Badge>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col gap-3"
                >
                  <Button
                    onClick={onStartVideoCall}
                    size="lg"
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0 h-12"
                  >
                    <Video className="w-5 h-5 mr-3" />
                    <span className="font-semibold">Start Video Call</span>
                  </Button>
                  <Button
                    onClick={onStartVoiceCall}
                    size="lg"
                    variant="outline"
                    className="w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30 text-blue-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-400/50 shadow-lg shadow-blue-500/10 h-12 backdrop-blur-sm"
                  >
                    <Phone className="w-5 h-5 mr-3" />
                    <span className="font-semibold">Voice Only</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const DesktopContent: React.FC<{
  loading: boolean
  error: string | null
  avatarUrl: string | null
  isDemo: boolean
  isStaticImage: boolean
  isLocalImage: boolean
  onRetry: () => void
  onStartVideoCall: () => void
  onStartVoiceCall: () => void
  activeMode: 'preview' | 'call' | 'voice'
}> = ({ loading, error, avatarUrl, isDemo, isStaticImage, isLocalImage, onRetry, onStartVideoCall, onStartVoiceCall, activeMode }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8 relative">
      <AnimatePresence mode="wait">
        {loading && !isLocalImage && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6 text-white"
          >
            <Loader2 className="w-20 h-20 animate-spin text-emerald-400" />
            <div className="text-center">
              <p className="text-2xl font-medium mb-2">Loading avatar...</p>
              <p className="text-lg text-white/60">Preparing your AI assistant experience</p>
            </div>
          </motion.div>
        )}

        {error && !isLocalImage && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6 text-center max-w-2xl"
          >
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <p className="text-red-400 font-medium text-2xl mb-3">Connection Failed</p>
              <p className="text-white/70 text-lg">{error}</p>
            </div>
            <Button
              onClick={onRetry}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {avatarUrl && (!loading || isLocalImage) && (!error || isLocalImage) && (
          <motion.div
            key="media"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Media Container */}
            <div className="relative w-full max-w-2xl aspect-video">
              {isStaticImage ? (
                <img
                  src={avatarUrl}
                  alt="AI Avatar Preview"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl"
                />
              ) : (
                <video
                  src={avatarUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover rounded-3xl shadow-2xl"
                />
              )}
              
              {/* Overlay with Buttons */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-3xl flex flex-col justify-end p-8">
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <h3 className="text-white text-2xl font-bold mb-3">
                    {isLocalImage ? "Custom Avatar Ready" : "AI Avatar Ready"}
                  </h3>
                  <p className="text-white/90 text-lg">Choose how you'd like to interact with your AI assistant</p>
                  {isLocalImage && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm mt-3 px-3 py-1">
                      Using Custom Image
                    </Badge>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex justify-center gap-6"
                >
                  <Button
                    onClick={onStartVideoCall}
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg shadow-lg shadow-emerald-500/25 border-0 h-14"
                  >
                    <Video className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Start Video Call</span>
                  </Button>
                  <Button
                    onClick={onStartVoiceCall}
                    size="lg"
                    variant="outline"
                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-400/30 text-blue-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:border-blue-400/50 px-8 py-4 text-lg shadow-lg shadow-blue-500/10 h-14 backdrop-blur-sm"
                  >
                    <Phone className="w-6 h-6 mr-3" />
                    <span className="font-semibold">Voice Only</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TavusAvatarCard