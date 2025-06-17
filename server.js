const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } //restrict in prod later
});

app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));

// Routes
const sessionRoutes = require('./routes/sessions');
const messageRoutes = require('./routes/messages');
const participantRoutes = require('./routes/participants'); // Add this line
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/participants', participantRoutes); // Add this line

// SOCKET.IO
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

io.on('connection', (socket) => {
  console.log('🟢 A user connected:', socket.id);

  // Join a session/room
  socket.on('joinRoom', async (data) => {
    const { session_id, user_id, username, mood } = data;

    try {
      // Check if session exists
      const { data: existingSession, error: fetchError } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', session_id)
        .single();

      if (fetchError) {
        console.error(`Error fetching session ${session_id}:`, fetchError.message);
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // Join the socket room
      socket.join(session_id);
      console.log(`User ${user_id} (${username}) joined session ${session_id} with mood ${mood}`);
      
      // Get current participants from database
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('session_id', session_id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError.message);
        socket.emit('error', { message: 'Failed to fetch participants' });
        return;
      }

      // Emit to the user who joined with current participants
      socket.emit('room-joined', { 
        session_id, 
        participants: participantsData 
      });

      // Notify others in the room about the new user
      socket.to(session_id).emit('user-joined', {
        user_id,
        user_name: username,
        username,
        mood,
        avatar: '/avatars/default-avatar.png',
        is_speaking: false,
        is_muted: false
      });

    } catch (error) {
      console.error('Error in joinRoom:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave a session/room
  socket.on('leaveRoom', async (data) => {
    const { session_id, user_id } = data;

    try {
      // Leave the socket room
      socket.leave(session_id);
      console.log(`User ${user_id} left session ${session_id}`);

      // Remove participant from database
      const { error: deleteError } = await supabase
        .from('participants')
        .delete()
        .eq('user_id', user_id)
        .eq('session_id', session_id);

      if (deleteError) {
        console.error('Error removing participant:', deleteError.message);
      }

      // Notify others in the room
      socket.to(session_id).emit('user-left', { user_id });

    } catch (error) {
      console.error('Error in leaveRoom:', error);
    }
  });

  // Receive and broadcast message
  socket.on('sendMessage', async ({ session_id, sender, text, user_id, type = 'text' }) => {
    try {
      // Save to Supabase messages table (assuming you have one)
      const { data, error } = await supabase
        .from('messages')
        .insert([{ 
          session_id, 
          sender, 
          text, 
          user_id,
          type 
        }])
        .select()
        .single();

      if (error) {
        console.error('DB Error saving message:', error.message);
        return;
      }

      console.log('Message saved to database:', data);

      // Emit to all users in the room
      io.to(session_id).emit('receiveMessage', data);

    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { session_id, user_id, username } = data;
    socket.to(session_id).emit('typing-start', { user_id, username });
  });

  socket.on('typing-stop', (data) => {
    const { session_id, user_id } = data;
    socket.to(session_id).emit('typing-stop', { user_id });
  });

  // Handle voice status updates
  socket.on('voice-status', async (data) => {
    const { userId, isSpeaking, isMuted } = data;
    
    try {
      // Update participant voice status in database
      const { error } = await supabase
        .from('participants')
        .update({ 
          is_speaking: isSpeaking, 
          is_muted: isMuted 
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating voice status:', error.message);
      }

      // Broadcast to all connected clients
      io.emit('voice-status', { user_id: userId, isSpeaking, isMuted });

    } catch (error) {
      console.error('Error in voice-status:', error);
    }
  });

  // Handle message reactions
  socket.on('message-reaction', async (data) => {
    const { messageId, reaction, userId } = data;
    
    try {
      // Save reaction to database (if you have a reactions table)
      // For now, just broadcast the reaction
      io.emit('message-reaction', { messageId, reaction, userId });

    } catch (error) {
      console.error('Error in message-reaction:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/session/:id', async (req, res) => {
  const sessionId = req.params.id;

  // Fetch session info
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) return res.status(404).send('Session not found');

  // Fetch messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (messagesError) return res.status(500).send('DB Error');

  res.render('chat', { sessionId, session, messages });
});

app.get('/', async (req, res) => {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error.message);
    return res.status(500).send('Database error');
  }

  res.render('landing', { sessions });
});

// New API endpoint to get all sessions
app.get('/api/sessions', async (req, res) => {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error fetching sessions:', error.message);
    return res.status(500).json({ error: 'Database error' });
  }
  res.json(sessions);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});