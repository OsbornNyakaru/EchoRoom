import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';
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

  const quickReplies = ['👍', '❤️', '😂', '🤔', '👏'];

  return (
    <div className="p-4">
      {/* Quick Reactions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isFocused ? 1 : 0, y: isFocused ? 0 : 10 }}
        className="flex gap-2 mb-3 overflow-x-auto"
      >
        {quickReplies.map((emoji) => (
          <Button
            key={emoji}
            variant="outline"
            size="sm"
            className="glass-card border-white/20 text-white hover:bg-white/10 flex-shrink-0"
            onClick={() => onSendMessage(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </motion.div>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
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
              'min-h-[48px] max-h-[120px]'
            )}
            rows={1}
          />
          
          {/* Character count */}
          {message.length > 0 && (
            <div className="absolute bottom-1 right-3 text-xs text-gray-400">
              {message.length}/500
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-card border-white/20 text-white hover:bg-white/10 p-2"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="glass-card border-white/20 text-white hover:bg-white/10 p-2"
          >
            <Mic className="h-4 w-4" />
          </Button>
          
          <Button
            type="submit"
            disabled={!message.trim()}
            className={cn(
              'p-2 rounded-xl transition-all duration-200',
              message.trim()
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
                : 'glass-card border-white/20 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;