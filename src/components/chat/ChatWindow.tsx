import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useSocketContext } from '../../context/SocketContext';
import { MessageSquare, Users, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const ChatWindow: React.FC = () => {
  const { messages, typingUsers, sendMessage, startTyping, stopTyping, userId, participants, roomId } = useSocketContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!roomId) {
    return (
      <div className="flex flex-col h-full glass-card rounded-2xl p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Room Selected</h3>
            <p className="text-gray-400">Choose a room to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'flex flex-col glass-card rounded-2xl overflow-hidden',
        isExpanded ? 'fixed inset-4 z-50' : 'h-full'
      )}
      layout
      transition={{ duration: 0.3 }}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-blue-400" />
            {messages.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Room Chat</h2>
            <p className="text-xs text-gray-400">
              {participants.length} participant{participants.length !== 1 ? 's' : ''} online
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="glass-card border-white/20 text-white hover:bg-white/10"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full p-8 text-center"
            >
              <div className="glass-card p-6 rounded-2xl max-w-sm">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Start the Conversation</h3>
                <p className="text-gray-400 text-sm">
                  Be the first to share your thoughts and connect with others in this space.
                </p>
              </div>
            </motion.div>
          ) : (
            <MessageList messages={messages} currentUserId={userId} />
          )}
        </AnimatePresence>
      </div>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-t border-white/10"
          >
            <TypingIndicator typingUsers={typingUsers} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div className="border-t border-white/10 bg-white/5">
        <MessageInput
          onSendMessage={sendMessage}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
        />
      </div>
    </motion.div>
  );
};

export default ChatWindow;