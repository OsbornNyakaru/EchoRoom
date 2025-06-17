import React from 'react';
import { motion } from 'framer-motion';
import { TypingUser } from '../../types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        {typingUsers.slice(0, 3).map((user, index) => (
          <motion.div
            key={user.userId}
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Avatar className="w-6 h-6 border-2 border-white/20">
              <AvatarImage src={user.avatar} alt={user.userName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                {user.userName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        ))}
        {typingUsers.length > 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-gray-600 border-2 border-white/20 flex items-center justify-center text-xs text-white"
          >
            +{typingUsers.length - 3}
          </motion.div>
        )}
      </div>

      {/* Typing Message */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">{message}</span>
        
        {/* Animated Dots */}
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-gray-400 rounded-full"
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