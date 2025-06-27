"use client"

import type React from "react"
import { useState, type KeyboardEvent, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  MicOff,
  X,
  Image,
  Camera,
  FileText,
  MapPin,
  Gift,
  Sticker,
} from "lucide-react"
import { cn } from "../../lib/utils"

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
  disabled?: boolean
  placeholder?: string
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onTypingStart, 
  onTypingStop, 
  currentUser,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [showMentions, setShowMentions] = useState(false)

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      const newHeight = Math.min(inputRef.current.scrollHeight, 120)
      inputRef.current.style.height = `${newHeight}px`
    }
  }, [message])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setMessage(newValue)

    // Handle typing indicators
    if (newValue.length > 0 && !isTyping) {
      onTypingStart()
      setIsTyping(true)
    } else if (newValue.length === 0 && isTyping) {
      onTypingStop()
      setIsTyping(false)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    if (newValue.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        onTypingStop()
        setIsTyping(false)
      }, 1500)
    }

    // Check for mentions
    const lastAtIndex = newValue.lastIndexOf('@')
    if (lastAtIndex !== -1 && lastAtIndex === newValue.length - 1) {
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const sendMessage = useCallback(() => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setMessage("")

      // Clear typing state
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTyping) {
        onTypingStop()
        setIsTyping(false)
      }

      // Close any open panels
      setShowEmojiPicker(false)
      setShowAttachments(false)
      setShowMentions(false)
    }
  }, [message, disabled, isTyping, onSendMessage, onTypingStop])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Voice recording
  const handleRecordStart = () => {
    longPressTimeoutRef.current = setTimeout(() => {
      setIsRecording(true)
      setRecordingTime(0)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }, 200)
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
      }
      setRecordingTime(0)
    }
  }

  const insertEmoji = (emoji: string) => {
    if (!inputRef.current) return

    const start = inputRef.current.selectionStart
    const end = inputRef.current.selectionEnd
    const newText = message.substring(0, start) + emoji + message.substring(end)

    setMessage(newText)

    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = start + emoji.length
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
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
      if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current)
    }
  }, [])

  // Quick emoji reactions
  const quickEmojis = ["😊", "😂", "❤️", "👍", "🙏", "🔥", "🎉", "🤔"]

  // Attachment options
  const attachmentOptions = [
    { icon: Image, label: "Photo", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Camera, label: "Camera", color: "text-green-500", bg: "bg-green-50" },
    { icon: FileText, label: "Document", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: MapPin, label: "Location", color: "text-red-500", bg: "bg-red-50" },
    { icon: Gift, label: "Poll", color: "text-yellow-500", bg: "bg-yellow-50" },
    { icon: Sticker, label: "Sticker", color: "text-pink-500", bg: "bg-pink-50" },
  ]

  // Mention suggestions
  const mentionSuggestions = [
    { name: "everyone", type: "channel", avatar: "#" },
    { name: "here", type: "channel", avatar: "#" },
    { name: currentUser?.userName || "You", type: "user", avatar: currentUser?.userName?.charAt(0) || "U" },
  ]

  const hasContent = message.trim().length > 0

  return (
    <div className="relative">
      {/* Voice Recording Overlay */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-red-500/10 backdrop-blur-sm rounded-2xl border-2 border-red-500/30 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Mic className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-red-600 font-medium">Recording...</p>
              <p className="text-red-500 text-lg font-mono">{formatTime(recordingTime)}</p>
              <p className="text-gray-500 text-sm mt-1">Release to send</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mentions Dropdown */}
      <AnimatePresence>
        {showMentions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[250px] max-h-[200px] overflow-y-auto z-50"
          >
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions</div>
              {mentionSuggestions.map((mention, index) => (
                <motion.button
                  key={mention.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  onClick={() => {
                    const newMessage = message.slice(0, -1) + `@${mention.name} `
                    setMessage(newMessage)
                    setShowMentions(false)
                    inputRef.current?.focus()
                  }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    mention.type === "channel" 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {mention.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{mention.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{mention.type}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-700">Quick reactions</div>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quickEmojis.map((emoji, index) => (
                <motion.button
                  key={emoji}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-lg transition-colors"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments Menu */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-700">Share</div>
              <button
                onClick={() => setShowAttachments(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {attachmentOptions.map((option, index) => (
                <motion.button
                  key={option.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // Handle attachment selection
                    setShowAttachments(false)
                  }}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", option.bg)}>
                    <option.icon className={cn("w-5 h-5", option.color)} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "flex items-end gap-2 p-3 bg-white rounded-2xl border transition-all duration-200",
          isFocused ? "border-blue-300 shadow-sm" : "border-gray-200",
          disabled && "opacity-50 pointer-events-none"
        )}>
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => {
              setShowAttachments(!showAttachments)
              setShowEmojiPicker(false)
            }}
            className={cn(
              "p-2 rounded-full transition-colors flex-shrink-0",
              showAttachments 
                ? "bg-blue-100 text-blue-600" 
                : "hover:bg-gray-100 text-gray-500"
            )}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none border-0 outline-none bg-transparent text-gray-900 placeholder-gray-500 text-base leading-5 max-h-[120px] min-h-[24px]"
              rows={1}
              maxLength={2000}
              style={{ height: "24px" }}
            />
            
            {/* Character count for long messages */}
            {message.length > 1800 && (
              <div className={cn(
                "absolute -top-6 right-0 text-xs px-2 py-1 rounded-full",
                message.length > 1950 
                  ? "bg-red-100 text-red-600" 
                  : "bg-yellow-100 text-yellow-600"
              )}>
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker)
                setShowAttachments(false)
              }}
              className={cn(
                "p-2 rounded-full transition-colors",
                showEmojiPicker 
                  ? "bg-blue-100 text-blue-600" 
                  : "hover:bg-gray-100 text-gray-500"
              )}
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Voice/Send Button */}
            {hasContent ? (
              <motion.button
                type="submit"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            ) : (
              <button
                type="button"
                onMouseDown={handleRecordStart}
                onMouseUp={handleRecordEnd}
                onMouseLeave={handleRecordEnd}
                onTouchStart={handleRecordStart}
                onTouchEnd={handleRecordEnd}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isRecording 
                    ? "bg-red-100 text-red-600" 
                    : "hover:bg-gray-100 text-gray-500"
                )}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Quick Emoji Bar (when focused but no content) */}
      <AnimatePresence>
        {isFocused && !hasContent && !showEmojiPicker && !showAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex gap-2 overflow-x-auto pb-2"
          >
            {quickEmojis.map((emoji, index) => (
              <motion.button
                key={emoji}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg transition-colors"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MessageInput