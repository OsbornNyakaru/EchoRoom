import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useSocketContext } from '../../context/SocketContext'; // Access global socket state
import { ChatMessage } from '../../types/chat'; // Assuming ChatMessage is defined here

interface ChatWindowProps {
  // Any props specific to ChatWindow, e.g., if it needs to know current user
}

const ChatWindow: React.FC<ChatWindowProps> = () => {
  const { messages, typingUsers, sendMessage, startTyping, stopTyping, userId } = useSocketContext();

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-semibold text-white">Chat Room</h2>
      </div>
      <MessageList messages={messages} currentUserId={userId} />
      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput
        onSendMessage={sendMessage}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
      />
    </div>
  );
};

export default ChatWindow; 