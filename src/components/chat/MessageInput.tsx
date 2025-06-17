import React, { useState, KeyboardEvent } from 'react';
import { SendHorizonal } from 'lucide-react';
import { Button } from '../ui/button';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0 && !isTyping) {
      onTypingStart();
      setIsTyping(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop();
      setIsTyping(false);
    }, 1500); // Stop typing after 1.5 seconds of no input
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        onTypingStop();
        setIsTyping(false);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Prevent new line on Enter, send message
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>); // Cast to FormEvent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-4 border-t border-gray-700 bg-gray-800">
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-grow p-3 rounded-l-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
      />
      <Button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg flex items-center justify-center transition-colors duration-200"
      >
        <SendHorizonal className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput; 