import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useSocketContext } from '../../context/SocketContext';
import { MessageSquare, Users, Settings, Maximize2, Minimize2, Hash, Sparkles, Activity, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const ChatWindow: React.FC = () => {
  const { messages, typingUsers, sendMessage, startTyping, stopTyping, userId, participants, roomId } = useSocketContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);

  // Track unread messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.id !== lastMessageRef.current) {
        lastMessageRef.current = lastMessage.id;
        
        // If message is not from current user and user hasn't read it
        if (lastMessage.userId !== userId && lastMessage.id !== lastReadMessageId) {
          setUnreadCount(prev => prev + 1);
        }
      }
    }
  }, [messages, userId, lastReadMessageId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
        setShowScrollToBottom(false);
        // Mark messages as read when scrolled to bottom
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          setLastReadMessageId(lastMessage.id);
          setUnreadCount(0);
        }
      } else {
        setShowScrollToBottom(true);
      }
    }
  }, [messages]);

  // Handle scroll to check if user is at bottom
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollToBottom(!isNearBottom && messages.length > 0);
      
      // Mark as read when scrolled to bottom
      if (isNearBottom && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        setLastReadMessageId(lastMessage.id);
        setUnreadCount(0);
      }
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!roomId) {
    return (
      <div className="flex flex-col h-full glass-card rounded-2xl p-6">
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">No Room Selected</h3>
            <p className="text-gray-400">Choose a room to start chatting</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const activeParticipants = participants.filter(p => p.userId !== userId);
  const currentUser = participants.find(p => p.userId === userId);

  return (
    <motion.div
      className={cn(
        'flex flex-col glass-card rounded-2xl overflow-hidden relative border border-white/10',
        isExpanded ? 'fixed inset-4 z-50' : 'h-full'
      )}
      layout
      transition={{ duration: 0.3 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Enhanced Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </motion.div>
            {unreadCount > 0 && (
              <motion.div 
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              Room Chat
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>Live</span>
              </div>
              {messages.length > 0 && (
                <>
                  <span>•</span>
                  <span>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
                </>
              )}
              {typingUsers.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-400" />
                    <span className="text-yellow-400">typing...</span>
                  </div>
                </>
              )}
            </div>
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
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto custom-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full p-8 text-center"
              >
                <div className="glass-card p-6 rounded-2xl max-w-sm border border-white/10">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">Start the Conversation</h3>
                  <p className="text-gray-400 text-sm">
                    Be the first to share your thoughts and connect with others in this space.
                  </p>
                  {currentUser && (
                    <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">You're here as:</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/40 flex items-center justify-center text-xs font-semibold text-white">
                          {currentUser.userName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-white text-sm font-medium">{currentUser.userName}</span>
                        <span className="text-xs text-gray-400 capitalize">• {currentUser.mood}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <MessageList messages={messages} currentUserId={userId} participants={participants} />
            )}
          </AnimatePresence>
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollToBottom && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 glass-card p-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all duration-200 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ↓
                </motion.div>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-500 px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </motion.button>
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
            className="px-4 py-2 border-t border-white/10 bg-white/5"
          >
            <TypingIndicator typingUsers={typingUsers} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Message Input */}
      <div className="border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10">
        <MessageInput
          onSendMessage={sendMessage}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
          currentUser={currentUser}
        />
      </div>
    </motion.div>
  );
};

export default ChatWindow;