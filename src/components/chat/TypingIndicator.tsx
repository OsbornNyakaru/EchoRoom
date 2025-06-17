import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingUser } from '../../types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle } from 'lucide-react';

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) {
    return null;
  }

  const names = typingUsers.map(user => user.userName || `User ${user.userId.substring(0, 5)}`);
  const message = names.length === 1
    ? `${names[0]} is typing...`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing...`
    : `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]} are typing...`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-2"
    >
      {/* User Avatars */}
      <div className="flex -space-x-2">
        <AnimatePresence>
          {typingUsers.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ scale: 0, x: -10 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0, x: -10 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              className="relative"
            >
              <Avatar className="w-7 h-7 border-2 border-white/20 shadow-lg">
                <AvatarImage src={user.avatar} alt={user.userName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                  {user.userName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Typing animation indicator */}
              <motion.div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <MessageCircle className="w-2 h-2 text-white" />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {typingUsers.length > 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-7 h-7 rounded-full bg-gray-600 border-2 border-white/20 flex items-center justify-center text-xs text-white font-medium shadow-lg"
          >
            +{typingUsers.length - 3}
          </motion.div>
        )}
      </div>

      {/* Typing Message */}
      <div className="flex items-center gap-2">
        <motion.span 
          className="text-sm text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.span>
        
        {/* Animated Dots */}
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;