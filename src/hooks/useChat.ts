import { useSocketContext } from '../context/SocketContext';

const useChat = () => {
  const { messages, typingUsers, sendMessage, sendReaction, startTyping, stopTyping } = useSocketContext();

  return {
    messages,
    typingUsers,
    sendMessage,
    onSendMessage: sendMessage, // Alias for MessageInput
    sendReaction,
    startTyping,
    onTypingStart: startTyping, // Alias for MessageInput
    stopTyping,
    onTypingStop: stopTyping, // Alias for MessageInput
  };
};

export default useChat; 