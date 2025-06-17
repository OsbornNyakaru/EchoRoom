# EchoRoom Database Documentation

## Overview

This document outlines the complete Supabase database schema required for the EchoRoom voice-based group chat platform. The database is designed to support real-time chat functionality through a Node.js + Express backend with Socket.IO integration.

## Database Schema

### Core Tables

#### 1. `sessions` (Chat Sessions)
Stores the different mood-based chat rooms/sessions.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_participants INTEGER DEFAULT 6,
    current_participants INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessions_category ON sessions(category);
CREATE INDEX idx_sessions_active ON sessions(is_active);
```

#### 2. `participants` (Session Participants)
Stores participant information for each session (uses the existing table structure).

```sql
CREATE TABLE participants (
    user_id UUID NOT NULL,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL DEFAULT ''::text,
    avatar TEXT NULL DEFAULT '/avatars/default-avatar.png'::text,
    mood TEXT NULL DEFAULT 'calm'::text,
    is_speaking BOOLEAN NOT NULL DEFAULT false,
    is_muted BOOLEAN NOT NULL DEFAULT false,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT participants_pkey PRIMARY KEY (user_id, session_id)
);

-- Indexes
CREATE INDEX idx_participants_session ON participants(session_id);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_participants_active ON participants(session_id, joined_at);
```

#### 3. `chat_messages`
Stores all chat messages sent in sessions.

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'ai-prompt', 'mood-check')),
    reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at DESC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);
```

#### 4. `message_reactions`
Stores emoji reactions to messages.

```sql
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(message_id, user_id, emoji)
);

-- Indexes
CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user ON message_reactions(user_id);
```

### Row Level Security (RLS) Policies

Enable RLS on all tables and create appropriate policies:

```sql
-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Sessions - Public read access
CREATE POLICY "Sessions are publicly readable" ON sessions
    FOR SELECT USING (true);

-- Participants - Users can see participants in active sessions
CREATE POLICY "Participants are publicly readable" ON participants
    FOR SELECT USING (true);

CREATE POLICY "Users can insert participant records" ON participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own participant records" ON participants
    FOR UPDATE USING (true);

-- Chat Messages - Public read access for session messages
CREATE POLICY "Chat messages are publicly readable" ON chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

-- Message Reactions - Public access
CREATE POLICY "Message reactions are publicly readable" ON message_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" ON message_reactions
    FOR INSERT WITH CHECK (true);
```

## Backend API Endpoints

The Node.js + Express backend should provide these REST endpoints:

### Session Management
```
GET /api/sessions
- Returns all active chat sessions
- Response: Array of session objects

POST /api/sessions
- Creates a new chat session
- Body: { category, description, max_participants }
```

### Participant Management
```
POST /api/participants
- Creates/updates a participant record
- Body: { user_id, session_id, user_name, mood, avatar, is_speaking, is_muted }
- Response: Participant object

GET /api/participants/:sessionId
- Gets all participants for a session
- Response: Array of participant objects

PUT /api/participants/:userId/:sessionId
- Updates participant information (voice status, etc.)
- Body: { is_speaking?, is_muted?, user_name? }
```

### Message History
```
GET /api/sessions/:sessionId/messages
- Gets message history for a session
- Query params: limit, offset, before_timestamp
- Response: Array of message objects with reactions
```

## Socket.IO Events

### Client → Server Events

#### Room Management
```javascript
// Join a session
socket.emit('joinRoom', {
    session_id: 'uuid',
    user_id: 'uuid',
    username: 'string',
    mood: 'string'
});

// Leave a session
socket.emit('leaveRoom', {
    session_id: 'uuid',
    user_id: 'uuid'
});
```

#### Chat Events
```javascript
// Send a message
socket.emit('sendMessage', {
    session_id: 'uuid',
    sender: 'string',
    text: 'string',
    user_id: 'uuid',
    type: 'text' | 'system' | 'ai-prompt' | 'mood-check'
});

// Start typing
socket.emit('typing-start', {
    session_id: 'uuid',
    user_id: 'uuid',
    username: 'string'
});

// Stop typing
socket.emit('typing-stop', {
    session_id: 'uuid',
    user_id: 'uuid'
});

// Add message reaction
socket.emit('message-reaction', {
    messageId: 'uuid',
    reaction: 'emoji',
    userId: 'uuid'
});
```

#### Voice Events
```javascript
// Update voice status
socket.emit('voice-status', {
    userId: 'uuid',
    isSpeaking: boolean,
    isMuted: boolean
});
```

### Server → Client Events

#### Room Events
```javascript
// Room joined successfully
socket.emit('room-joined', {
    session_id: 'uuid',
    participants: [/* participant objects from database */]
});

// User joined room
socket.emit('user-joined', {
    user_id: 'uuid',
    user_name: 'string',
    avatar: 'string',
    mood: 'string',
    is_speaking: boolean,
    is_muted: boolean
});

// User left room
socket.emit('user-left', {
    user_id: 'uuid'
});
```

#### Chat Events
```javascript
// Receive message
socket.emit('receiveMessage', {
    id: 'uuid',
    user_id: 'uuid',
    sender: 'string',
    text: 'string',
    type: 'string',
    timestamp: 'ISO string',
    reactions: [/* reaction objects */]
});

// Typing indicators
socket.emit('typing-start', {
    user_id: 'uuid',
    username: 'string'
});

socket.emit('typing-stop', {
    user_id: 'uuid'
});
```

#### Voice Events
```javascript
// Voice status update
socket.emit('voice-status', {
    user_id: 'uuid',
    isSpeaking: boolean,
    isMuted: boolean
});
```

## Database Functions and Triggers

### Automatic Timestamp Updates
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Participant Count Management
```sql
-- Function to update participant count
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE sessions 
        SET current_participants = (
            SELECT COUNT(*) FROM participants 
            WHERE session_id = NEW.session_id
        )
        WHERE id = NEW.session_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE sessions 
        SET current_participants = (
            SELECT COUNT(*) FROM participants 
            WHERE session_id = OLD.session_id
        )
        WHERE id = OLD.session_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply trigger
CREATE TRIGGER update_participant_count_trigger
    AFTER INSERT OR DELETE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_session_participant_count();
```

## Data Seeding

Initial data for chat sessions:

```sql
INSERT INTO sessions (id, category, description, is_active, max_participants) VALUES
('3c0baaf2-45d5-4986-8a56-e205ad9e1c4f', 'Motivated', 'Ready to take on challenges', true, 6),
('9dcaa32f-b371-4ebf-9153-8747a16e19b2', 'Hopeful', 'Looking forward with optimism', true, 6),
('ad209c8b-dde1-44e7-8642-7da4e1f8cfe3', 'Lonely', 'Seeking connection and understanding', true, 6),
('cd90792e-bb54-4a5b-b1b9-59fb27fbc49f', 'Joyful', 'Filled with happiness and gratitude', true, 6),
('647161c4-0bfc-4142-9f7a-fc6eefb17325', 'Calm', 'Finding peace in the moment', true, 6),
('5b169685-1790-493e-a569-3aeec7b60b33', 'Loving', 'Embracing warmth and compassion', true, 6);
```

## Key Integration Points

### Frontend → Database Flow

1. **User Name Selection**: 
   - User selects or generates anonymous name in `UserNameModal`
   - Name is stored in localStorage and SocketContext

2. **Room Joining**:
   - Frontend calls `POST /api/participants` to create database record
   - Then emits `joinRoom` socket event
   - Backend queries participants table and returns current participants

3. **Real-time Updates**:
   - Voice status changes update participants table via `PUT /api/participants/:userId/:sessionId`
   - Socket events broadcast changes to all connected clients
   - Frontend updates local state and UI

4. **Message Display**:
   - Messages show participant names from database
   - Participant avatars and mood indicators reflect database state
   - Real-time typing indicators use current participant names

### Database Schema Benefits

- **Persistent Participant State**: Voice status, names, and mood persist across reconnections
- **Scalable Architecture**: Clean separation between real-time events and persistent data
- **Anonymous Identity**: Users can have consistent identity within sessions without registration
- **Audit Trail**: All messages and participant actions are logged for moderation
- **Performance**: Proper indexing ensures fast queries even with many concurrent users

This integration ensures that the chat interface displays accurate, up-to-date participant information while maintaining the anonymous, ephemeral nature of the EchoRoom experience.