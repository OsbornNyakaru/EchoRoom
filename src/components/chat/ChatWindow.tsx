"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MessageList from "./MessageList"
import TypingIndicator from "./TypingIndicator"
import { useSocketContext } from "../../context/SocketContext"
import {
  MessageSquare,
  Users,
  Maximize2,
  Minimize2,
  Hash,
  Sparkles,
  Wifi,
  WifiOff,
  Star,
  Brain,
  Eye,
  Shield,
  Edit3,
  ChevronDown,
} from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

const ChatWindow: React.FC = () => {
  const { messages, typingUsers, userId, participants, roomId, isConnected } = useSocketContext()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null)
  const [messageStats, setMessageStats] = useState({ total: 0, today: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<string | null>(null)

  // Track unread messages with advanced logic
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.id !== lastMessageRef.current) {
        lastMessageRef.current = lastMessage.id

        // If message is not from current user and user hasn't read it
        if (lastMessage.userId !== userId && lastMessage.id !== lastReadMessageId) {
          setUnreadCount((prev) => prev + 1)
        }
      }
    }
  }, [messages, userId, lastReadMessageId])

  // Update message statistics
  useEffect(() => {
    const today = new Date().toDateString()
    const todayMessages = messages.filter((msg) => new Date(msg.timestamp).toDateString() === today).length

    setMessageStats({
      total: messages.length,
      today: todayMessages,
    })
  }, [messages])

  // Enhanced auto-scroll with smart detection
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100

      if (isNearBottom) {
        container.scrollTop = container.scrollHeight
        setShowScrollToBottom(false)
        // Mark messages as read when scrolled to bottom
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1]
          setLastReadMessageId((prevId) => (prevId !== lastMessage.id ? lastMessage.id : prevId))
          setUnreadCount((prevCount) => (prevCount !== 0 ? 0 : prevCount))
        }
      } else {
        setShowScrollToBottom(true)
      }
    }
  }, [messages])

  // Enhanced scroll handler
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      setShowScrollToBottom(!isNearBottom && messages.length > 0)

      // Mark as read when scrolled to bottom
      if (isNearBottom && messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        setLastReadMessageId((prevId) => (prevId !== lastMessage.id ? lastMessage.id : prevId))
        setUnreadCount((prevCount) => (prevCount !== 0 ? 0 : prevCount))
      }
    }
  }

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  if (!roomId) {
    return (
      <div className="flex flex-col h-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex-1 flex items-center justify-center">
          <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">No Room Selected</h3>
            <p className="text-gray-400">Choose a room to start chatting</p>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentUser = participants.find((p) => p.userId === userId)

  return (
    <motion.div
      className={cn(
        "flex flex-col bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden relative border border-white/10 h-full",
        isExpanded ? "fixed inset-4 z-50" : "",
      )}
      layout
      transition={{ duration: 0.3 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      style={{ flex: 'none', minHeight: 0, height: '100%' }}
    >
      {/* Revolutionary Chat Header */}
      <motion.div
        className="flex items-center justify-between p-3 lg:p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm relative overflow-hidden"
        animate={{
          background: isHovering
            ? "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.12) 100%)"
            : "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.10) 100%)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.8,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 lg:gap-3 relative z-10 flex-1 min-w-0">
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400" />
            </motion.div>

            {/* Advanced notification system */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                  <motion.div
                    className="absolute inset-0 bg-red-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2 truncate">
              <Hash className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">Room Chat</span>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="flex-shrink-0"
              >
                <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-400" />
              </motion.div>
            </h2>

            {/* Enhanced status bar - simplified for mobile */}
            <div className="flex items-center gap-1 lg:gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <motion.div
                  className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-green-400" : "bg-red-400")}
                  animate={isConnected ? { scale: [1, 1.2, 1] } : { opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
                {isConnected ? (
                  <Wifi className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                ) : (
                  <WifiOff className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                )}
                <span className="hidden sm:inline">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>

              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Users className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                <span>{participants.length}</span>
                <span className="hidden lg:inline">online</span>
              </div>

              <span className="hidden lg:inline">•</span>
              <div className="hidden lg:flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{messageStats.total} messages</span>
              </div>

              {typingUsers.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Edit3 className="h-2.5 w-2.5 lg:h-3 lg:w-3 text-blue-400" />
                    </motion.div>
                    <span className="text-blue-400 text-xs">{typingUsers.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 lg:gap-2 relative z-10 flex-shrink-0">
          {/* Advanced controls - simplified for mobile */}
          <motion.div className="hidden lg:flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 p-1.5 rounded-lg"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Brain className="h-3 w-3" />
              </motion.div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 p-1.5 rounded-lg"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Eye className="h-3 w-3" />
              </motion.div>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              {isExpanded ? (
                <Minimize2 className="h-3 w-3 lg:h-4 lg:w-4" />
              ) : (
                <Maximize2 className="h-3 w-3 lg:h-4 lg:w-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 relative overflow-hidden min-h-0" style={{ minHeight: 0, height: '100%' }}>
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 dark:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-700 px-4 py-2"
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full p-6 text-center min-h-[300px]"
              >
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl max-w-sm border border-white/10 relative overflow-hidden">
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                    animate={{
                      background: [
                        "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))",
                        "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
                        "linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))",
                      ],
                    }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                  />

                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white mb-2">Start the Conversation</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Be the first to share your thoughts and connect with others in this space.
                    </p>

                    {currentUser && (
                      <motion.div
                        className="p-3 rounded-xl bg-white/5 border border-white/10"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <p className="text-xs text-gray-400 mb-1">You're here as:</p>
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-6 h-6 rounded-full bg-blue-500/40 flex items-center justify-center text-xs font-semibold text-white relative"
                            whileHover={{ scale: 1.1 }}
                          >
                            {currentUser.userName?.charAt(0) || "U"}
                            <Shield className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                          </motion.div>
                          <span className="text-white text-sm font-medium">{currentUser.userName}</span>
                          <span className="text-xs text-gray-400 capitalize">• {currentUser.mood}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-1">
                <MessageList messages={messages} currentUserId={userId} participants={participants} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Revolutionary Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollToBottom && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={scrollToBottom}
              className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 bg-white/10 backdrop-blur-sm p-2 lg:p-3 rounded-full border border-white/20 text-white hover:bg-white/20 transition-all duration-200 shadow-lg group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="flex items-center gap-1 lg:gap-2">
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="relative"
                >
                  <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
                  <motion.div
                    className="absolute inset-0 text-blue-400"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
                  </motion.div>
                </motion.div>

                {unreadCount > 0 && (
                  <motion.span
                    className="text-xs bg-gradient-to-r from-red-500 to-pink-500 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-full font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>

              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Typing Indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm"
          >
            <TypingIndicator typingUsers={typingUsers} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ChatWindow
