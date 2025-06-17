# EchoRoom Database Documentation

## Overview

This document outlines the complete Supabase database schema required for the EchoRoom voice-based group chat platform. The database is designed to support real-time chat functionality through a Node.js + Express backend with Socket.IO integration.

## Database Schema

### Core Tables

#### 1. `chat_sessions`
Stores the different mood-based chat rooms/sessions.

```sql
CREATE TABLE chat_sessions (
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
CREATE INDEX idx_chat_sessions_category ON chat_sessions(category);
CREATE INDEX idx_chat_sessions_active ON chat_sessions(is_active);
```

**Expected Data:**
```json
[
  {
    "id": "3c0baaf2-45d5-4986-8a56-e205ad9e1c4f",
    "category": "Motivated",
    "description": "Ready to take on challenges",
    "is_active": true,
    "max_participants": 6,
    "current_participants": 0
  },
  {
    "id": "9dcaa32f-b371-4ebf-9153-8747a16e19b2",
    "category": "Hopeful",
    "description": "Looking forward with optimism",
    "is_active": true,
    "max_participants": 6,
    "current_participants": 0
  }
]
```

#### 2. `users`
Stores user information (anonymous users with generated names).

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    avatar_url TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    last_active TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_last_active ON users(last_active);
```

#### 3. `session_participants`
Tracks which users are currently in which sessions.

```sql
CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    mood TEXT,
    is_speaking BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    
    UNIQUE(session_id, user_id)
);

-- Indexes
CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_user ON session_participants(user_id);
CREATE INDEX idx_session_participants_active ON session_participants(is_active);
```

#### 4. `chat_messages`
Stores all chat messages sent in sessions.

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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

#### 5. `message_reactions`
Stores emoji reactions to messages.

```sql
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(message_id, user_id, emoji)
);

-- Indexes
CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user ON message_reactions(user_id);
```

#### 6. `typing_indicators`
Tracks real-time typing status (temporary data, can be cleared periodically).

```sql
CREATE TABLE typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '10 seconds'),
    
    UNIQUE(session_id, user_id)
);

-- Indexes
CREATE INDEX idx_typing_indicators_session ON typing_indicators(session_id);
CREATE INDEX idx_typing_indicators_expires ON typing_indicators(expires_at);
```

#### 7. `voice_status`
Tracks real-time voice activity status.

```sql
CREATE TABLE voice_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_speaking BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    last_updated TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(session_id, user_id)
);

-- Indexes
CREATE INDEX idx_voice_status_session ON voice_status(session_id);
CREATE INDEX idx_voice_status_user ON voice_status(user_id);
```

### Row Level Security (RLS) Policies

Enable RLS on all tables and create appropriate policies:

```sql
-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_status ENABLE ROW LEVEL SECURITY;

-- Chat Sessions - Public read access
CREATE POLICY "Chat sessions are publicly readable" ON chat_sessions
    FOR SELECT USING (true);

-- Users - Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Session Participants - Users can see participants in their sessions
CREATE POLICY "Users can see session participants" ON session_participants
    FOR SELECT USING (
        session_id IN (
            SELECT session_id FROM session_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Chat Messages - Users can see messages in their sessions
CREATE POLICY "Users can see session messages" ON chat_messages
    FOR SELECT USING (
        session_id IN (
            SELECT session_id FROM session_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Message Reactions - Users can see and add reactions in their sessions
CREATE POLICY "Users can see message reactions" ON message_reactions
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM chat_messages 
            WHERE session_id IN (
                SELECT session_id FROM session_participants 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    );

CREATE POLICY "Users can add reactions" ON message_reactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Typing Indicators - Users can see typing in their sessions
CREATE POLICY "Users can see typing indicators" ON typing_indicators
    FOR SELECT USING (
        session_id IN (
            SELECT session_id FROM session_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Voice Status - Users can see voice status in their sessions
CREATE POLICY "Users can see voice status" ON voice_status
    FOR SELECT USING (
        session_id IN (
            SELECT session_id FROM session_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );
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

PUT /api/sessions/:id
- Updates session details
- Body: { category?, description?, is_active?, max_participants? }
```

### User Management
```
POST /api/users
- Creates/registers a new user
- Body: { username, avatar_url?, is_anonymous }
- Response: User object with generated ID

GET /api/users/:id
- Gets user details
- Response: User object

PUT /api/users/:id
- Updates user information
- Body: { username?, avatar_url?, last_active? }
```

### Message History
```
GET /api/sessions/:sessionId/messages
- Gets message history for a session
- Query params: limit, offset, before_timestamp
- Response: Array of message objects with reactions

GET /api/sessions/:sessionId/participants
- Gets current participants in a session
- Response: Array of participant objects with voice status
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
    participants: [/* participant objects */],
    users: [/* user objects */]
});

// User joined room
socket.emit('user-joined', {
    user_id: 'uuid',
    username: 'string',
    avatar: 'string',
    mood: 'string'
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
CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
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
    IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
        UPDATE chat_sessions 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.session_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_active = true AND NEW.is_active = false THEN
            UPDATE chat_sessions 
            SET current_participants = current_participants - 1 
            WHERE id = NEW.session_id;
        ELSIF OLD.is_active = false AND NEW.is_active = true THEN
            UPDATE chat_sessions 
            SET current_participants = current_participants + 1 
            WHERE id = NEW.session_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.is_active = true THEN
        UPDATE chat_sessions 
        SET current_participants = current_participants - 1 
        WHERE id = OLD.session_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply trigger
CREATE TRIGGER update_participant_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON session_participants
    FOR EACH ROW EXECUTE FUNCTION update_session_participant_count();
```

### Cleanup Functions
```sql
-- Function to clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_expired_typing_indicators()
RETURNS void AS $$
BEGIN
    DELETE FROM typing_indicators WHERE expires_at < now();
END;
$$ language 'plpgsql';

-- Function to clean up inactive participants
CREATE OR REPLACE FUNCTION cleanup_inactive_participants()
RETURNS void AS $$
BEGIN
    UPDATE session_participants 
    SET is_active = false, left_at = now()
    WHERE is_active = true 
    AND user_id IN (
        SELECT id FROM users 
        WHERE last_active < now() - INTERVAL '30 minutes'
    );
END;
$$ language 'plpgsql';
```

## Environment Variables

The backend should use these environment variables for database connection:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Connection (if using direct connection)
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/[database]

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Data Seeding

Initial data for chat sessions:

```sql
INSERT INTO chat_sessions (id, category, description, is_active, max_participants) VALUES
('3c0baaf2-45d5-4986-8a56-e205ad9e1c4f', 'Motivated', 'Ready to take on challenges', true, 6),
('9dcaa32f-b371-4ebf-9153-8747a16e19b2', 'Hopeful', 'Looking forward with optimism', true, 6),
('ad209c8b-dde1-44e7-8642-7da4e1f8cfe3', 'Lonely', 'Seeking connection and understanding', true, 6),
('cd90792e-bb54-4a5b-b1b9-59fb27fbc49f', 'Joyful', 'Filled with happiness and gratitude', true, 6),
('647161c4-0bfc-4142-9f7a-fc6eefb17325', 'Calm', 'Finding peace in the moment', true, 6),
('5b169685-1790-493e-a569-3aeec7b60b33', 'Loving', 'Embracing warmth and compassion', true, 6),
('60df81b2-2d61-47fa-8988-9165d3b3f793', 'Books', 'Discussing literature and stories', true, 6);
```

## Performance Considerations

1. **Indexing**: Ensure proper indexes on frequently queried columns
2. **Connection Pooling**: Use connection pooling for database connections
3. **Real-time Subscriptions**: Use Supabase real-time subscriptions for live updates
4. **Cleanup Jobs**: Run periodic cleanup jobs for expired data
5. **Caching**: Consider Redis for caching frequently accessed data

## Security Considerations

1. **RLS Policies**: Ensure proper Row Level Security policies
2. **Input Validation**: Validate all inputs on the backend
3. **Rate Limiting**: Implement rate limiting for API endpoints and socket events
4. **Authentication**: Use Supabase Auth for user authentication if needed
5. **CORS**: Configure CORS properly for frontend-backend communication

This database schema provides a robust foundation for the EchoRoom platform's real-time chat functionality while maintaining data integrity and security.