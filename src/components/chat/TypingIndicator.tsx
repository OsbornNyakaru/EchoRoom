import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingUser } from '../../types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit3, Keyboard } from 'lucide-react';

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
      className="relative"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/15 to-blue-500/10 rounded-xl"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          backgroundSize: '200% 100%',
        }}
      />
      
      <div className="relative flex items-center gap-3 p-3 border border-white/10 rounded-xl backdrop-blur-sm">
        {/* Typing Icon */}
        <motion.div
          className="flex-shrink-0"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
            <Edit3 className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* User Avatars - Fixed layout, no scrolling */}
        <div className="flex gap-2">
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
                  stiffness: 400,
                  damping: 25
                }}
                className="relative"
              >
                <Avatar className="w-8 h-8 border-2 border-white/30 shadow-lg ring-2 ring-blue-400/30">
                  <AvatarImage src={user.avatar} alt={user.userName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                    {user.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Enhanced typing animation indicator */}
                <motion.div
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 1, 0.8],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Keyboard className="w-2.5 h-2.5 text-white" />
                </motion.div>

                {/* Ripple effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-400"
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.5, 0.2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Show count if more than 3 users */}
          {typingUsers.length > 3 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-white/30 flex items-center justify-center text-xs text-white font-bold shadow-lg ring-2 ring-purple-400/30"
            >
              +{typingUsers.length - 3}
            </motion.div>
          )}
        </div>

        {/* Typing Message */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.span 
            className="text-sm text-gray-200 font-medium truncate"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {getTypingMessage()}
          </motion.span>
          
          {/* Enhanced Animated Dots */}
          <div className="flex gap-1 flex-shrink-0">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full shadow-sm"
                style={{
                  background: 'linear-gradient(45deg, #60A5FA, #A78BFA, #F472B6)',
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 1, 0.4],
                  y: [0, -4, 0],
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

        {/* Floating particles effect */}
        <div className="absolute inset-0 rounded-xl pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
              animate={{
                x: [0, 100, 200],
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: "easeInOut"
              }}
              style={{
                left: `${10 + i * 20}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;