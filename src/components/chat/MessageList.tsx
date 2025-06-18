import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import { Bot, Crown, Sparkles, Heart, Coffee, Star, Moon, Sun, Smile, Clock } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  type: 'text' | 'system' | 'ai-prompt' | 'mood-check';
  timestamp: Date;
  reactions: MessageReaction[];
  isEdited?: boolean;
  replyTo?: string;
  isOptimistic?: boolean; // For immediate display of user's own messages
}

interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

interface Participant {
  userId: string;
  userName: string;
  avatar: string;
  mood: string;
  isSpeaking: boolean;
  isMuted: boolean;
}

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  participants: Participant[];
}

const formatMessageTime = (date: Date) => {
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, 'HH:mm')}`;
  } else {
    return format(date, 'MMM d, HH:mm');
  }
};

const getMoodIcon = (mood: string) => {
  const icons = {
    hopeful: Sun,
    lonely: Moon,
    motivated: Star,
    calm: Coffee,
    loving: Heart,
    joyful: Smile,
  };
  return icons[mood?.toLowerCase() as keyof typeof icons] || Coffee;
};

const getMoodColor = (mood: string) => {
  const colors = {
    hopeful: '#FFE66D',
    lonely: '#8E9AAF',
    motivated: '#FFB4A2',
    calm: '#A3C4BC',
    loving: '#FF8FA3',
    joyful: '#FFD93D',
  };
  return colors[mood?.toLowerCase() as keyof typeof colors] || '#A3C4BC';
};

const MessageBubble: React.FC<{
  message: ChatMessage;
  isCurrentUser: boolean;
  isConsecutive: boolean;
  participant?: Participant;
  showAvatar: boolean;
}> = ({ message, isCurrentUser, isConsecutive, participant, showAvatar }) => {
  const isSystemMessage = message.type === 'system' || message.type === 'ai-prompt';
  const moodColor = participant ? getMoodColor(participant.mood) : '#A3C4BC';
  const MoodIcon = participant ? getMoodIcon(participant.mood) : Coffee;
  
  if (isSystemMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex justify-center my-6"
      >
        <div className="glass-card px-6 py-3 rounded-full max-w-md border border-white/20">
          <div className="flex items-center gap-2">
            {message.type === 'ai-prompt' && <Bot className="h-4 w-4 text-blue-400" />}
            <p className="text-sm text-center text-gray-300">{message.content}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        'flex gap-3 group relative',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row',
        isConsecutive ? 'mb-1' : 'mb-4'
      )}
    >
      {/* Avatar */}
      <div className={cn('flex-shrink-0', !showAvatar && 'invisible')}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Avatar className="w-10 h-10 border-2 border-white/20 shadow-lg">
            <AvatarImage src={message.avatar} alt={message.userName} />
            <AvatarFallback 
              className="text-white font-semibold text-sm"
              style={{ backgroundColor: moodColor + '60' }}
            >
              {message.userName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        {/* Mood indicator */}
        {participant && showAvatar && (
          <motion.div 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: moodColor + 'E0' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MoodIcon className="w-2.5 h-2.5 text-white" />
          </motion.div>
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[75%] min-w-0', isCurrentUser && 'items-end')}>
        {/* Username and timestamp */}
        {showAvatar && (
          <motion.div 
            className={cn('flex items-center gap-2 mb-1', isCurrentUser && 'flex-row-reverse')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-white">
                {isCurrentUser ? 'You' : message.userName}
              </span>
              {isCurrentUser && (
                <Crown className="w-3 h-3 text-yellow-400" />
              )}
            </div>
            <span className="text-xs text-gray-400">
              {formatMessageTime(message.timestamp)}
            </span>
            {participant && (
              <span className="text-xs text-gray-500 capitalize">
                • {participant.mood}
              </span>
            )}
          </motion.div>
        )}

        {/* Message bubble */}
        <motion.div
          className={cn(
            'px-4 py-3 rounded-2xl relative group-hover:shadow-lg transition-all duration-200 break-words',
            isCurrentUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
              : 'glass-card text-white border border-white/10',
            // Rounded corners based on position
            isCurrentUser
              ? isConsecutive 
                ? 'rounded-br-md' 
                : 'rounded-br-md'
              : isConsecutive 
                ? 'rounded-bl-md' 
                : 'rounded-bl-md',
            // Optimistic message styling
            message.isOptimistic && 'opacity-80'
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={!isCurrentUser && participant ? {
            background: `linear-gradient(135deg, ${moodColor}15 0%, rgba(255, 255, 255, 0.08) 100%)`,
            borderColor: moodColor + '30'
          } : {}}
        >
          {/* Message content */}
          <div className="flex items-center gap-2">
            <p className="text-sm leading-relaxed flex-1">{message.content}</p>
            
            {/* Optimistic message indicator */}
            {message.isOptimistic && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="flex-shrink-0"
              >
                <Clock className="w-3 h-3 text-white/60" />
              </motion.div>
            )}
          </div>
          
          {/* Reactions - Fixed layout with hover effects, no scrolling */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {message.reactions.slice(0, 5).map((reaction, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ 
                    scale: 1.1,
                    y: -2,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center gap-1 cursor-pointer hover:bg-white/30 transition-colors flex-shrink-0"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-white/80 font-medium">{reaction.count}</span>
                </motion.div>
              ))}
              {message.reactions.length > 5 && (
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    y: -2,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center gap-1 cursor-pointer hover:bg-white/30 transition-colors flex-shrink-0"
                >
                  <span className="text-white/80 font-medium">+{message.reactions.length - 5}</span>
                </motion.div>
              )}
            </div>
          )}
          
          {/* Edited indicator */}
          {message.isEdited && (
            <span className="text-xs text-white/60 italic mt-1 block">edited</span>
          )}

          {/* Message tail */}
          <div className={cn(
            'absolute w-0 h-0 border-solid',
            isCurrentUser
              ? 'right-0 top-3 border-l-8 border-t-4 border-b-4 border-l-blue-500 border-t-transparent border-b-transparent'
              : 'left-0 top-3 border-r-8 border-t-4 border-b-4 border-t-transparent border-b-transparent',
            !isCurrentUser && participant ? '' : 'border-r-white/20'
          )}
          style={!isCurrentUser && participant ? {
            borderRightColor: moodColor + '40'
          } : {}}
        />
        </motion.div>

        {/* Timestamp for consecutive messages */}
        {isConsecutive && (
          <motion.div
            className={cn('text-xs text-gray-500 mt-1', isCurrentUser ? 'text-right' : 'text-left')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {formatMessageTime(message.timestamp)}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, participants }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="p-4 space-y-1">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];
          const isCurrentUser = message.userId === currentUserId;
          const participant = participants.find(p => p.userId === message.userId);
          
          // Check if this message is consecutive (same user, within 5 minutes)
          const isConsecutive = 
            previousMessage &&
            previousMessage.userId === message.userId &&
            previousMessage.type === message.type &&
            differenceInMinutes(new Date(message.timestamp), new Date(previousMessage.timestamp)) < 5;

          // Show avatar for first message in a group or after a time gap
          const showAvatar = !isConsecutive;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={isCurrentUser}
              isConsecutive={isConsecutive}
              participant={participant}
              showAvatar={showAvatar}
            />
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;