# EchoRoom - Voice-Based Group Chat Platform with Real-Time Chat

## Project Overview

EchoRoom is a sophisticated voice-based group chat platform designed for emotional connection and mental wellness. Users join mood-based conversation rooms with AI-facilitated meaningful discussions in a safe, anonymous environment. The platform features real-time text chat alongside voice communication using WebSocket technology for seamless multi-modal interaction.

## Tech Stack & Setup

### Core Technologies
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives (shadcn/ui style)
- **Animations**: Framer Motion
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **State Management**: React Context API + useReducer
- **Real-Time Communication**: Socket.IO Client
- **Audio**: Web Audio API integration ready
- **Chat Features**: Real-time messaging, typing indicators, message reactions

### WebSocket Integration

```typescript
// Socket.IO client setup
import { io, Socket } from 'socket.io-client'

interface SocketEvents {
  // Room events
  'join-room': (data: { roomId: string, userId: string, mood: string }) => void
  'leave-room': (data: { roomId: string, userId: string }) => void
  'room-joined': (data: { participants: Participant[], roomInfo: RoomInfo }) => void
  
  // Chat events
  'send-message': (message: ChatMessage) => void
  'receive-message': (message: ChatMessage) => void
  'typing-start': (data: { userId: string, userName: string }) => void
  'typing-stop': (data: { userId: string }) => void
  'message-reaction': (data: { messageId: string, reaction: string, userId: string }) => void
  
  // Voice events
  'voice-status': (data: { userId: string, isSpeaking: boolean, isMuted: boolean }) => void
  'ai-prompt': (data: { prompt: string, timestamp: Date }) => void
  
  // Session events
  'session-update': (data: { timeRemaining: number, phase: SessionPhase }) => void
  'session-end': () => void
}
```

### Project Structure

```
src/
├── components/
│   ├── ui/                    # Base UI components
│   ├── layout/                # Layout components
│   ├── voice/                 # Voice-related components
│   ├── chat/                  # Real-time chat components
│   │   ├── ChatWindow.tsx     # Main chat interface
│   │   ├── MessageList.tsx    # Message display
│   │   ├── MessageInput.tsx   # Message composition
│   │   ├── TypingIndicator.tsx # Typing status
│   │   └── MessageReactions.tsx # Reaction system
│   └── dashboard/             # Analytics components
├── pages/
│   ├── Home.tsx              # Mood selection
│   ├── Welcome.tsx           # AI onboarding
│   ├── Room.tsx              # Voice + chat room
│   └── Dashboard.tsx         # User analytics
├── hooks/
│   ├── useSocket.ts          # Socket.IO integration
│   ├── useChat.ts            # Chat functionality
│   ├── useVoice.ts           # Voice features
│   └── useRoom.ts            # Room management
├── context/
│   ├── SocketContext.tsx     # WebSocket provider
│   ├── ChatContext.tsx       # Chat state management
│   └── RoomContext.tsx       # Room state management
├── lib/
│   ├── socket.ts             # Socket configuration
│   ├── chatUtils.ts          # Chat utilities
│   └── voiceUtils.ts         # Voice utilities
├── types/
│   ├── chat.ts               # Chat-related types
│   ├── room.ts               # Room-related types
│   └── socket.ts             # Socket event types
└── styles/                   # Global CSS
```

## Real-Time Chat System

### Chat Message Types

```typescript
interface ChatMessage {
  id: string
  userId: string
  userName: string
  avatar: string
  content: string
  type: 'text' | 'system' | 'ai-prompt' | 'mood-check'
  timestamp: Date
  reactions: MessageReaction[]
  isEdited?: boolean
  replyTo?: string
}

interface MessageReaction {
  emoji: string
  users: string[]
  count: number
}

interface TypingUser {
  userId: string
  userName: string
  avatar: string
  timestamp: Date
}
```

### Socket Context Provider

```typescript
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  roomId: string | null
  participants: Participant[]
  messages: ChatMessage[]
  typingUsers: TypingUser[]
  
  // Actions
  joinRoom: (roomData: JoinRoomData) => void
  leaveRoom: () => void
  sendMessage: (content: string, type?: MessageType) => void
  sendReaction: (messageId: string, emoji: string) => void
  startTyping: () => void
  stopTyping: () => void
  updateVoiceStatus: (isSpeaking: boolean, isMuted: boolean) => void
}
```

## Enhanced Room Interface

### Room Page - Voice + Chat Interface
**Route**: `/room?mood={mood}`

**Layout**:
- **Left Side (50%)**: Participant grid with voice indicators
- **Right Side (50%)**: Real-time chat window
- **Header**: Room info, timer, controls
- **Footer**: Voice controls + chat input

## Enhanced AI Integration

### AI Chat Participation

```typescript
interface AIMessage extends ChatMessage {
  type: 'ai-prompt' | 'ai-response' | 'ai-guidance'
  promptType: 'conversation-starter' | 'mood-check' | 'session-transition' | 'encouragement'
}

const aiPromptsByMood = {
  hopeful: [
    { type: 'conversation-starter', content: "What small win are you celebrating today? 🌟" },
    { type: 'mood-check', content: "I'm sensing some beautiful optimism in the room. How is everyone feeling?" },
    { type: 'encouragement', content: "Your hope is inspiring others. Keep sharing! ✨" }
  ],
  calm: [
    { type: 'conversation-starter', content: "What brings you peace in chaotic moments? 🧘" },
    { type: 'mood-check', content: "Let's take a moment to breathe together. How centered do you feel right now?" },
    { type: 'encouragement', content: "Your calm presence is creating a safe space for everyone 🕊️" }
  ]
  // ... other moods
}
```

### AI Chat Features
- **Smart Prompts**: Context-aware conversation starters based on chat sentiment
- **Mood Monitoring**: AI detects mood shifts through chat analysis
- **Gentle Guidance**: Subtle interventions for off-topic or negative conversations
- **Encouragement**: Positive reinforcement for vulnerable sharing
- **Session Management**: Chat-based session transitions and time warnings

## Real-Time Features

### Live Participant Updates
- Real-time participant join/leave notifications
- Voice status updates (speaking, muted)
- Typing indicators with smooth animations
- Message reactions and emoji support

### Chat Persistence & History
- Session-based chat history
- Message filtering and search
- Conversation highlights extraction
- Integration with Echo Drop analytics

### Mobile Chat Experience
- **Swipe Gestures**: Swipe between voice and chat views
- **Floating Chat Button**: Quick access to unread messages
- **Voice-to-Text**: Option to convert voice to chat messages
- **Quick Reactions**: Tap reactions during voice conversations

## Implementation Priorities

### Phase 1: Core Structure + WebSocket Setup
- Set up Vite + React + TypeScript project
- Install Socket.IO client and configure WebSocket connection
- Create base UI components and chat components
- Implement basic real-time messaging
- Set up room joining/leaving functionality

### Phase 2: Chat Features
- Build complete chat interface with message list and input
- Implement typing indicators and message reactions
- Add emoji support and quick reactions
- Create AI chat integration with mood-based prompts
- Add message persistence and history

### Phase 3: Voice + Chat Integration
- Integrate chat with existing voice room interface
- Implement responsive layout for voice + chat
- Add voice status updates via WebSocket
- Create seamless mobile experience
- Add chat-enhanced echo drop modal

### Phase 4: Advanced Features
- Implement message search and filtering
- Add voice-to-text integration
- Create advanced AI chat analysis
- Add chat moderation features
- Optimize performance for real-time updates

## Success Criteria

### Real-Time Communication
- **Instant Messaging**: Messages appear immediately across all connected clients
- **Typing Indicators**: Real-time typing status with smooth animations
- **Voice Integration**: Seamless coordination between voice and chat features
- **Connection Resilience**: Automatic reconnection and message queuing
- **Performance**: Smooth experience with 50+ concurrent users per room

### User Experience
- **Intuitive Interface**: Easy switching between voice and chat modes
- **Emotional Resonance**: Chat design adapts to selected mood
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile Optimization**: Touch-friendly chat interface
- **AI Integration**: Natural AI participation in conversations

### Technical Excellence
- **Type Safety**: Full TypeScript coverage for WebSocket events
- **State Management**: Efficient real-time state synchronization
- **Error Handling**: Graceful handling of connection issues
- **Security**: Message validation and rate limiting
- **Scalability**: Architecture ready for horizontal scaling

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Contributing

This project demonstrates modern real-time web development while delivering an emotionally engaging experience focused on mental wellness and meaningful human connection. The application seamlessly blends voice and text communication in a sophisticated, production-ready environment.