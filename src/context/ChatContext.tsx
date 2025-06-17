import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ChatMessage, TypingUser, MessageReaction } from '../types/chat';

type ChatState = {
  messages: ChatMessage[];
  typingUsers: TypingUser[];
};

type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'ADD_TYPING_USER'; payload: TypingUser }
  | { type: 'REMOVE_TYPING_USER'; payload: string }
  | { type: 'ADD_REACTION'; payload: { messageId: string; reaction: MessageReaction } };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'ADD_TYPING_USER':
      return { ...state, typingUsers: [...state.typingUsers, action.payload] };
    case 'REMOVE_TYPING_USER':
      return { ...state, typingUsers: state.typingUsers.filter(user => user.userId !== action.payload) };
    case 'ADD_REACTION':
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.messageId
            ? { ...message, reactions: [...message.reactions, action.payload.reaction] }
            : message
        ),
      };
    default:
      return state;
  }
};

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, { messages: [], typingUsers: [] });

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}; 