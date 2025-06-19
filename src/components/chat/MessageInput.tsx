"use client"

import type React from "react"
import { useState, type KeyboardEvent, useRef, useEffect, useCallback, type TouchEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  ImageIcon,
  Camera,
  Mic,
  MicOff,
  AtSign,
  Bold,
  Italic,
  Code,
  Quote,
  ChevronUp,
  ChevronDown,
  Heart,
  Coffee,
  Moon,
  Sun,
  Zap,
  Sparkles,
  ArrowUp,
  Keyboard,
  Volume2,
  Vibrate,
} from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  onSendMessage: (content: string) => void
  onTypingStart: () => void
  onTypingStop: () => void
  currentUser?: {
    userId: string
    userName: string
    mood: string
    avatar: string
  }
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTypingStart, onTypingStop, currentUser }) => {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showMentions, setShowMentions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"up" | "down" | null>(null)
  const [hapticEnabled, setHapticEnabled] = useState(true)

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const draftTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recordButtonRef = useRef<HTMLButtonElement>(null)

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

  const moodColor = currentUser ? getMoodColor(currentUser.mood) : "#10b981"
  const MoodIcon = currentUser ? getMoodIcon(currentUser.mood) : Coffee

  // Simulate haptic feedback for mobile
  const triggerHaptic = useCallback(
    (type: "light" | "medium" | "heavy" = "light") => {
      if (!hapticEnabled) return

      // Try to use native haptic feedback if available
      if ("vibrate" in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30, 10, 30],
        }
        navigator.vibrate(patterns[type])
      }
    },
    [hapticEnabled],
  )

  // Detect mobile keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      const viewport = window.visualViewport
      if (viewport) {
        const keyboardHeight = window.innerHeight - viewport.height
        setIsKeyboardVisible(keyboardHeight > 100)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
      return () => window.visualViewport?.removeEventListener("resize", handleResize)
    }
  }, [])

  // Auto-resize textarea for mobile
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      const newHeight = Math.min(inputRef.current.scrollHeight, isExpanded ? 120 : 80)
      inputRef.current.style.height = `${newHeight}px`
    }
  }, [message, isExpanded])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setMessage(newValue)

    // Handle typing indicators
    if (newValue.length > 0 && !isTyping) {
      onTypingStart()
      setIsTyping(true)
      triggerHaptic("light")
    } else if (newValue.length === 0 && isTyping) {
      onTypingStop()
      setIsTyping(false)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after user stops typing
    if (newValue.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop()
        setIsTyping(false)
      }, 2000)
    }

    // Check for mentions
    if (newValue.includes("@")) {
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    sendMessage()
  }

  const sendMessage = useCallback(() => {
    const trimmedMessage = message.trim()
    if (trimmedMessage) {
      onSendMessage(trimmedMessage)
      setMessage("")
      triggerHaptic("medium")

      // Clear typing state immediately when sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTyping) {
        onTypingStop()
        setIsTyping(false)
      }

      // Reset states
      setShowQuickActions(false)
      setShowEmojiPicker(false)
      setShowFormatting(false)
      setShowMentions(false)
      setIsExpanded(false)
    }
  }, [message, isTyping, onSendMessage, onTypingStop, triggerHaptic])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Mobile keyboard handling
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Touch gesture handlers
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    const currentY = e.touches[0].clientY
    const deltaY = touchStartY - currentY

    if (Math.abs(deltaY) > 10) {
      setSwipeDirection(deltaY > 0 ? "up" : "down")
    }
  }

  const handleTouchEnd = () => {
    if (swipeDirection === "up" && !isExpanded) {
      setIsExpanded(true)
      triggerHaptic("light")
    } else if (swipeDirection === "down" && isExpanded) {
      setIsExpanded(false)
      triggerHaptic("light")
    }
    setSwipeDirection(null)
  }

  // Voice recording with long press
  const handleRecordStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    longPressTimeoutRef.current = setTimeout(() => {
      setIsRecording(true)
      setRecordingTime(0)
      triggerHaptic("heavy")

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }, 200) // 200ms long press
  }

  const handleRecordEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
    }

    if (isRecording) {
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }

      if (recordingTime > 0) {
        onSendMessage(`🎤 Voice message (${formatTime(recordingTime)})`)
        triggerHaptic("medium")
      }
      setRecordingTime(0)
    }
  }

  const insertText = (text: string) => {
    if (!inputRef.current) return

    const start = inputRef.current.selectionStart
    const end = inputRef.current.selectionEnd
    const newText = message.substring(0, start) + text + message.substring(end)

    setMessage(newText)
    triggerHaptic("light")

    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = start + text.length
        inputRef.current.setSelectionRange(newPosition, newPosition)
        inputRef.current.focus()
      }
    }, 0)
  }

  const insertFormatting = (before: string, after: string) => {
    if (!inputRef.current) return

    const start = inputRef.current.selectionStart
    const end = inputRef.current.selectionEnd
    const selectedText = message.substring(start, end)
    const newText = message.substring(0, start) + before + selectedText + after + message.substring(end)

    setMessage(newText)
    triggerHaptic("light")

    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = start + before.length + selectedText.length
        inputRef.current.setSelectionRange(newPosition, newPosition)
        inputRef.current.focus()
      }
    }, 0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (message.length > 0 && !isTyping) {
      onTypingStart()
      setIsTyping(true)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
      if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current)
      if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current)
    }
  }, [])

  // Mobile-optimized quick replies
  const quickReplies = [
    { emoji: "👍", label: "👍" },
    { emoji: "❤️", label: "❤️" },
    { emoji: "😂", label: "😂" },
    { emoji: "🤔", label: "🤔" },
    { emoji: "👏", label: "👏" },
    { emoji: "🙏", label: "🙏" },
    { emoji: "💪", label: "💪" },
    { emoji: "✨", label: "✨" },
  ]

  // Mobile-optimized quick actions
  const quickActions = [
    { icon: Camera, label: "Camera", color: "text-green-400" },
    { icon: ImageIcon, label: "Photo", color: "text-blue-400" },
    { icon: AtSign, label: "Mention", color: "text-purple-400" },
  ]

  // Mobile-optimized formatting
  const mobileFormatting = [
    { icon: Bold, label: "B", format: ["**", "**"] },
    { icon: Italic, label: "I", format: ["*", "*"] },
    { icon: Code, label: "<>", format: ["`", "`"] },
    { icon: Quote, label: '"', format: ["> ", ""] },
  ]

  // Mobile emoji grid
  const mobileEmojis = [
    "😊",
    "😂",
    "❤️",
    "👍",
    "🙏",
    "💪",
    "✨",
    "🔥",
    "🎉",
    "🤗",
    "😢",
    "🤔",
    "😍",
    "🥳",
    "😎",
    "🤝",
    "💯",
    "🚀",
    "⭐",
    "🌟",
    "💖",
    "🎯",
    "🏆",
    "🎊",
  ]

  const mentionSuggestions = [
    { name: "everyone", type: "group" },
    { name: "here", type: "group" },
    { name: "Alex Chen", type: "user" },
    { name: "Sarah Kim", type: "user" },
  ]

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative transition-all duration-300", isKeyboardVisible && "pb-safe-area-inset-bottom")}
      animate={{
        height: isExpanded ? "auto" : "auto",
        paddingBottom: isKeyboardVisible ? "env(safe-area-inset-bottom)" : "0",
      }}
    >
      {/* Mobile Swipe Indicator */}
      <AnimatePresence>
        {isFocused && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex justify-center pb-2"
          >
            <motion.div
              className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <ChevronUp className="w-3 h-3" />
              <span>Swipe up for more</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Mobile Toolbar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Quick Actions Row */}
            <div className="p-3 border-b border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 font-medium">Quick Actions</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0 text-gray-400"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.label}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    onClick={() => triggerHaptic("light")}
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <span className="text-xs text-white">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Formatting Row */}
            <div className="p-3 border-b border-white/10">
              <span className="text-xs text-gray-400 font-medium mb-2 block">Formatting</span>
              <div className="flex gap-2">
                {mobileFormatting.map((format) => (
                  <motion.button
                    key={format.label}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    onClick={() => {
                      insertFormatting(format.format[0], format.format[1])
                      triggerHaptic("light")
                    }}
                  >
                    <format.icon className="h-4 w-4 text-white" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick Emojis */}
            <div className="p-3">
              <span className="text-xs text-gray-400 font-medium mb-2 block">Quick Emojis</span>
              <div className="grid grid-cols-8 gap-2">
                {mobileEmojis.slice(0, 16).map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    whileTap={{ scale: 0.8 }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-lg"
                    onClick={() => {
                      insertText(emoji)
                      triggerHaptic("light")
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Preview - Mobile Optimized */}
      {currentUser && isFocused && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${moodColor}15 0%, rgba(255, 255, 255, 0.05) 100%)`,
            borderColor: moodColor + "30",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white border-2"
                style={{
                  backgroundColor: moodColor + "40",
                  borderColor: moodColor + "60",
                }}
              >
                {currentUser.userName?.charAt(0) || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{currentUser.userName}</span>
                  <MoodIcon className="w-3 h-3" style={{ color: moodColor }} />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{message.length}/500</span>
                  {isTyping && (
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400">typing</span>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 bg-blue-400 rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Haptic toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setHapticEnabled(!hapticEnabled)
                triggerHaptic("medium")
              }}
              className="h-8 w-8 p-0"
            >
              {hapticEnabled ? (
                <Vibrate className="h-4 w-4 text-green-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Quick Reactions - Mobile Optimized */}
      <AnimatePresence>
        {isFocused && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {quickReplies.map((reply, index) => (
              <motion.button
                key={reply.emoji}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
                onClick={() => {
                  onSendMessage(reply.emoji)
                  triggerHaptic("light")
                }}
              >
                {reply.emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording Overlay - Mobile Optimized */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-red-500/20 backdrop-blur-sm rounded-2xl border-2 border-red-500/50 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Mic className="w-10 h-10 text-white" />
              </motion.div>
              <p className="text-white font-medium text-lg">Recording...</p>
              <p className="text-red-400 text-xl font-mono">{formatTime(recordingTime)}</p>
              <p className="text-gray-300 text-sm mt-2">Release to send</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Form - Mobile Optimized */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Expand/Collapse Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsExpanded(!isExpanded)
            triggerHaptic("light")
          }}
          className="bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 p-3 rounded-full transition-all duration-200 flex-shrink-0"
        >
          <motion.div animate={{ rotate: isExpanded ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus className="h-5 w-5" />
          </motion.div>
        </Button>

        {/* Text Input - Mobile Optimized */}
        <div
          className="flex-1 relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Type a message..."
            className={cn(
              "w-full p-4 pr-16 rounded-2xl resize-none transition-all duration-200",
              "bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400",
              "focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20",
              "min-h-[56px] max-h-[120px] text-base", // Larger text for mobile
              isFocused && "border-blue-400/50 ring-2 ring-blue-400/20",
            )}
            rows={1}
            maxLength={500}
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
          />

          {/* Mobile Input Indicators */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {message.length > 400 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  message.length > 450 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400",
                )}
              >
                {message.length}
              </motion.div>
            )}

            {isFocused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full flex items-center gap-1"
              >
                <Keyboard className="w-2.5 h-2.5" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Voice Recording Button - Mobile Optimized */}
        <motion.button
          ref={recordButtonRef}
          type="button"
          onTouchStart={handleRecordStart}
          onTouchEnd={handleRecordEnd}
          onMouseDown={handleRecordStart}
          onMouseUp={handleRecordEnd}
          onMouseLeave={handleRecordEnd}
          className={cn(
            "p-3 rounded-full transition-all duration-200 flex-shrink-0 min-w-[48px] h-12",
            "bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10",
            isRecording && "bg-red-500/20 border-red-400/50 text-red-400 scale-110",
          )}
          whileTap={{ scale: 0.95 }}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </motion.button>

        {/* Send Button - Mobile Optimized */}
        <motion.button
          type="submit"
          disabled={!message.trim()}
          className={cn(
            "p-3 rounded-full transition-all duration-200 relative overflow-hidden flex-shrink-0 min-w-[48px] h-12",
            message.trim()
              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
              : "bg-white/5 backdrop-blur-sm border border-white/20 text-gray-400 cursor-not-allowed",
          )}
          whileTap={message.trim() ? { scale: 0.95 } : {}}
          onClick={() => message.trim() && triggerHaptic("medium")}
        >
          {message.trim() && (
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-full scale-0"
              animate={{ scale: [0, 1, 0] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
            />
          )}
          <ArrowUp className="h-5 w-5 relative z-10" />
        </motion.button>
      </form>

      {/* Mobile Keyboard Shortcuts Help */}
      <AnimatePresence>
        {isFocused && !isKeyboardVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="mt-2 text-xs text-gray-400 text-center"
          >
            Hold mic to record • Swipe up for more options
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default MessageInput
