import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';

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
}

interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
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

const MessageBubble: React.FC<{
  message: ChatMessage;
  isCurrentUser: boolean;
  isConsecutive: boolean;
}> = ({ message, isCurrentUser, isConsecutive }) => {
  const isSystemMessage = message.type === 'system' || message.type === 'ai-prompt';
  
  if (isSystemMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <div className="glass-card px-4 py-2 rounded-full max-w-xs">
          <p className="text-sm text-center text-gray-300">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        'flex gap-3 mb-4 group',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className={cn('flex-shrink-0', isConsecutive && 'invisible')}>
        <Avatar className="w-8 h-8 border-2 border-white/20">
          <AvatarImage src={message.avatar} alt={message.userName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
            {message.userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[70%]', isCurrentUser && 'items-end')}>
        {/* Username and timestamp */}
        {!isConsecutive && (
          <div className={cn('flex items-center gap-2 mb-1', isCurrentUser && 'flex-row-reverse')}>
            <span className="text-sm font-medium text-white">
              {isCurrentUser ? 'You' : message.userName}
            </span>
            <span className="text-xs text-gray-400">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <motion.div
          className={cn(
            'px-4 py-2 rounded-2xl relative group-hover:shadow-lg transition-all duration-200',
            isCurrentUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
              : 'glass-card text-white rounded-bl-md',
            isConsecutive && (isCurrentUser ? 'rounded-tr-md' : 'rounded-tl-md')
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {message.reactions.map((reaction, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-white/80">{reaction.count}</span>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Edited indicator */}
          {message.isEdited && (
            <span className="text-xs text-white/60 italic mt-1 block">edited</span>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
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
          const isConsecutive = 
            previousMessage &&
            previousMessage.userId === message.userId &&
            previousMessage.type === message.type &&
            new Date(message.timestamp).getTime() - new Date(previousMessage.timestamp).getTime() < 60000; // Within 1 minute

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={isCurrentUser}
              isConsecutive={isConsecutive}
            />
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;