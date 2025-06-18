import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingUser } from '../../types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Zap } from 'lucide-react';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) {
    return null;
  }

  const names = typingUsers.map(user => user.userName || `User ${user.userId.substring(0, 5)}`);
  
  const getTypingMessage = () => {
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else if (names.length === 3) {
      return `${names[0]}, ${names[1]}, and ${names[2]} are typing...`;
    } else {
      return `${names.slice(0, 2).join(', ')}, and ${names.length - 2} others are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10"
    >
      {/* User Avatars */}
      <div className="flex -space-x-2">
        <AnimatePresence>
          {typingUsers.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ scale: 0, x: -20, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              exit={{ scale: 0, x: -20, opacity: 0 }}
              transition={{ 
                delay: index * 0.1, 
                type: "spring", 
                stiffness: 300,
                damping: 25
              }}
              className="relative"
            >
              <Avatar className="w-8 h-8 border-2 border-white/30 shadow-lg">
                <AvatarImage src={user.avatar} alt={user.userName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                  {user.userName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Typing animation indicator */}
              <motion.div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Zap className="w-2 h-2 text-white" />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Show count if more than 3 users */}
        {typingUsers.length > 3 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-white/30 flex items-center justify-center text-xs text-white font-bold shadow-lg"
          >
            +{typingUsers.length - 3}
          </motion.div>
        )}
      </div>

      {/* Typing Message */}
      <div className="flex items-center gap-3 flex-1">
        <motion.span 
          className="text-sm text-gray-300 font-medium"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {getTypingMessage()}
        </motion.span>
        
        {/* Enhanced Animated Dots */}
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-sm"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
                y: [0, -2, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Pulse effect background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default TypingIndicator;