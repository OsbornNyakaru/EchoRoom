import React from 'react';
import { MessageReaction } from '../../types/chat';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onAddReaction: (emoji: string) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({ reactions, onAddReaction }) => {
  // Placeholder for reaction UI
  const availableEmojis = ['👍', '❤️', '😂', '🔥', '🎉']; // Example emojis

  return (
    <div className="flex gap-1 mt-1">
      {reactions.map((reaction, index) => (
        <span key={index} className="bg-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          {reaction.emoji} {reaction.count}
        </span>
      ))}
      {/* Example of how to add a reaction button (will need to be hooked up to specific message) */}
      {/* <button onClick={() => onAddReaction('👍')} className="text-xs text-gray-400 hover:text-white">
        Add Reaction
      </button> */}
    </div>
  );
};

export default MessageReactions; 