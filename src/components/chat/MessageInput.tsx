import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Mic, Plus, Image, Gift } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Handle typing indicators
    if (e.target.value.length > 0 && !isTyping) {
      onTypingStart();
      setIsTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage();
  };

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // Clear typing state
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        onTypingStop();
        setIsTyping(false);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies = [
    { emoji: '👍', label: 'Agree' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Funny' },
    { emoji: '🤔', label: 'Thinking' },
    { emoji: '👏', label: 'Applause' },
    { emoji: '🙏', label: 'Thanks' },
    { emoji: '💪', label: 'Strong' },
    { emoji: '✨', label: 'Amazing' }
  ];

  const quickActions = [
    { icon: Image, label: 'Image', color: 'text-blue-400' },
    { icon: Gift, label: 'GIF', color: 'text-purple-400' },
    { icon: Smile, label: 'Emoji', color: 'text-yellow-400' },
  ];

  return (
    <div className="p-4">
      {/* Quick Reactions */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="flex gap-2 mb-3 overflow-x-auto pb-2"
          >
            {quickReplies.map((reply, index) => (
              <motion.button
                key={reply.emoji}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card border-white/20 text-white hover:bg-white/10 flex-shrink-0 px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-all duration-200"
                onClick={() => onSendMessage(reply.emoji)}
              >
                <span className="text-base">{reply.emoji}</span>
                <span className="text-xs text-gray-300">{reply.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Quick Actions Button */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="glass-card border-white/20 text-white hover:bg-white/10 p-2 rounded-full"
          >
            <motion.div
              animate={{ rotate: showQuickActions ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="h-4 w-4" />
            </motion.div>
          </Button>

          {/* Quick Actions Menu */}
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-full left-0 mb-2 glass-card rounded-2xl p-2 border border-white/20"
              >
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 w-full p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
                  >
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                    <span className="text-sm text-white">{action.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message..."
            className={cn(
              'w-full p-3 pr-12 rounded-2xl resize-none transition-all duration-200',
              'glass-card border border-white/20 text-white placeholder-gray-400',
              'focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20',
              'min-h-[48px] max-h-[120px]',
              isFocused && 'border-blue-400/50 ring-2 ring-blue-400/20'
            )}
            rows={1}
            maxLength={500}
          />
          
          {/* Character count */}
          <AnimatePresence>
            {message.length > 400 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bottom-1 right-3 text-xs text-gray-400"
              >
                {message.length}/500
              </motion.div>
            )}
          </AnimatePresence>

          {/* Typing indicator for current user */}
          <AnimatePresence>
            {isTyping && message.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-1 right-3 flex items-center gap-1"
              >
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
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Voice Message Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="glass-card border-white/20 text-white hover:bg-white/10 p-2 rounded-full"
        >
          <Mic className="h-4 w-4" />
        </Button>
        
        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={!message.trim()}
          className={cn(
            'p-2 rounded-full transition-all duration-200 relative overflow-hidden',
            message.trim()
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
              : 'glass-card border-white/20 text-gray-400 cursor-not-allowed'
          )}
          whileHover={message.trim() ? { scale: 1.05 } : {}}
          whileTap={message.trim() ? { scale: 0.95 } : {}}
        >
          {message.trim() && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0"
              whileHover={{ opacity: 0.2 }}
              transition={{ duration: 0.2 }}
            />
          )}
          <Send className="h-4 w-4 relative z-10" />
        </motion.button>
      </form>
    </div>
  );
};

export default MessageInput;