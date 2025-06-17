import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Define the ChatMessage interface
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

// Define the MessageReaction interface
interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      {messages.map((message) => {
        const isUser = message.userId === currentUserId;
        const messageClass = isUser ? 'bg-primary text-primary-foreground ml-auto' : 'bg-card text-card-foreground';

        return (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg max-w-[80%] mb-3 shadow-sm",
              messageClass,
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={message.avatar} alt={message.userName} />
              <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className={cn("flex items-center gap-2", isUser ? "justify-end" : "justify-start")}>
                <span className="text-sm font-semibold">{isUser ? 'You' : message.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.timestamp), 'HH:mm')}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
              {message.reactions.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {message.reactions.map((reaction, index) => (
                    <span key={index} className="text-xs bg-muted rounded-full px-2 py-0.5">
                      {reaction.emoji} {reaction.count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
