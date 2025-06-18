import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useSocketContext } from '../../context/SocketContext';
import { 
  MessageSquare, 
  Users, 
  Maximize2, 
  Minimize2, 
  Hash, 
  Sparkles, 
  Activity, 
  Zap,
  Wifi,
  WifiOff,
  Star,
  Flame,
  Heart,
  Brain,
  Eye,
  Shield,
  Edit3
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const ChatWindow: React.FC = () => {
  const { messages, typingUsers, sendMessage, startTyping, stopTyping, userId, participants, roomId, isConnected } = useSocketContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const [messageStats, setMessageStats] = useState({ total: 0, today: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string | null>(null);

  // Combine real messages with optimistic messages for immediate display
  const allMessages = useMemo(() => [...messages, ...optimisticMessages], [messages, optimisticMessages]);

  // Enhanced message sending with optimistic updates
  const handleSendMessage = (content: string) => {
    if (!content.trim() || !userId || !roomId) return;

    // Create optimistic message for immediate display
    const optimisticMessage = {
      id: `optimistic-${Date.now()}-${Math.random()}`,
      userId: userId,
      userName: participants.find(p => p.userId === userId)?.userName || 'You',
      avatar: participants.find(p => p.userId === userId)?.avatar || '/avatars/default-avatar.png',
      content: content.trim(),
      type: 'text' as const,
      timestamp: new Date(),
      reactions: [],
      isOptimistic: true
    };

    // Add to optimistic messages immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    // Send the actual message
    sendMessage(content);

    // Remove optimistic message after a delay (it should be replaced by real message)
    setTimeout(() => {
      setOptimisticMessages(prev => 
        prev.filter(msg => msg.id !== optimisticMessage.id)
      );
    }, 5000); // Remove after 5 seconds if not replaced
  };

  // Clean up optimistic messages when real messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const latestMessageTime = new Date(latestMessage.timestamp).getTime();
      
      // Remove optimistic messages that are older than the latest real message
      setOptimisticMessages(prev => 
        prev.filter(msg => {
          const msgTime = new Date(msg.timestamp).getTime();
          return msgTime > latestMessageTime;
        })
      );
    }
  }, [messages]);

  // Track unread messages with advanced logic
  useEffect(() => {
    if (allMessages.length > 0) {
      const lastMessage = allMessages[allMessages.length - 1];
      if (lastMessage.id !== lastMessageRef.current) {
        lastMessageRef.current = lastMessage.id;
        
        // If message is not from current user and user hasn't read it
        if (lastMessage.userId !== userId && lastMessage.id !== lastReadMessageId && !lastMessage.isOptimistic) {
          setUnreadCount(prev => prev + 1);
        }
      }
    }
  }, [allMessages, userId, lastReadMessageId]);

  // Update message statistics
  useEffect(() => {
    const today = new Date().toDateString();
    const todayMessages = allMessages.filter(msg => 
      new Date(msg.timestamp).toDateString() === today && !msg.isOptimistic
    ).length;
    
    setMessageStats({
      total: messages.length, // Only count real messages for stats
      today: todayMessages
    });
  }, [allMessages, messages]);

  // Enhanced auto-scroll with smart detection
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
        setShowScrollToBottom(false);
        // Mark messages as read when scrolled to bottom
        if (allMessages.length > 0) {
          const lastMessage = allMessages[allMessages.length - 1];
          if (!lastMessage.isOptimistic) {
            setLastReadMessageId(prevId => prevId !== lastMessage.id ? lastMessage.id : prevId);
            setUnreadCount(prevCount => prevCount !== 0 ? 0 : prevCount);
          }
        }
      } else {
        setShowScrollToBottom(true);
      }
    }
  }, [allMessages]);

  // Auto-scroll to bottom when user sends a message
  useEffect(() => {
    if (optimisticMessages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [optimisticMessages]);

  // Enhanced scroll handler
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShowScrollToBottom(!isNearBottom && allMessages.length > 0);
      
      // Mark as read when scrolled to bottom
      if (isNearBottom && allMessages.length > 0) {
        const lastMessage = allMessages[allMessages.length - 1];
        if (!lastMessage.isOptimistic) {
          setLastReadMessageId(prevId => prevId !== lastMessage.id ? lastMessage.id : prevId);
          setUnreadCount(prevCount => prevCount !== 0 ? 0 : prevCount);
        }
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
      <div className="flex flex-col h-full glass-card rounded-2xl p-6 border border-white/10">
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
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      {/* Revolutionary Chat Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm relative overflow-hidden"
        animate={{
          background: isHovering 
            ? 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.12) 100%)'
            : 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.10) 100%)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
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
                repeat: Infinity,
                delay: i * 0.8,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 360],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </motion.div>
            
            {/* Advanced notification system */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div 
                  className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                  <motion.div
                    className="absolute inset-0 bg-red-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              Room Chat
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </motion.div>
            </h2>
            
            {/* Enhanced status bar */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <motion.div 
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  )}
                  animate={isConnected ? { scale: [1, 1.2, 1] } : { opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{participants.length} online</span>
              </div>
              
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{messageStats.total} messages</span>
              </div>
              
              {typingUsers.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Edit3 className="h-3 w-3 text-blue-400" />
                    </motion.div>
                    <span className="text-blue-400">
                      {typingUsers.length} typing...
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 relative z-10">
          {/* Advanced controls */}
          <motion.div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="glass-card border-white/20 text-white hover:bg-white/10 p-1.5 rounded-lg"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="h-3 w-3" />
              </motion.div>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="glass-card border-white/20 text-white hover:bg-white/10 p-1.5 rounded-lg"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="h-3 w-3" />
              </motion.div>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
          </motion.div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto custom-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {allMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full p-8 text-center"
              >
                <div className="glass-card p-6 rounded-2xl max-w-sm border border-white/10 relative overflow-hidden">
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                    animate={{
                      background: [
                        'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                        'linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                        'linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))',
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  
                  <div className="relative z-10">
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
                            {currentUser.userName?.charAt(0) || 'U'}
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
              <MessageList messages={allMessages} currentUserId={userId} participants={participants} />
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
              className="absolute bottom-4 right-4 glass-card p-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all duration-200 shadow-lg group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="relative"
                >
                  ↓
                  <motion.div
                    className="absolute inset-0 text-blue-400"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ↓
                  </motion.div>
                </motion.div>
                
                {unreadCount > 0 && (
                  <motion.span 
                    className="text-xs bg-gradient-to-r from-red-500 to-pink-500 px-2 py-1 rounded-full font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
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
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm"
          >
            <TypingIndicator typingUsers={typingUsers} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revolutionary Message Input */}
      <div className="border-t border-white/10 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTypingStart={startTyping}
          onTypingStop={stopTyping}
          currentUser={currentUser}
        />
      </div>
    </motion.div>
  );
};

export default ChatWindow;