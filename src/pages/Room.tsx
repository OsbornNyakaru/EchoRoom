import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocketContext } from '../context/SocketContext';
import ChatWindow from '../components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users } from 'lucide-react';

interface ChatSession {
  id: string;
  name: string;
  category: string;
}

// Placeholder for ParticipantGrid - assuming you have or will create this.
// If not, you might want to create a basic one in src/components/layout/ or src/components/voice/
const ParticipantGrid: React.FC<{ participants: any[] }> = ({ participants }) => (
  <div className="flex flex-col h-full p-4 bg-gray-800 rounded-lg">
    <h2 className="text-2xl font-semibold mb-4 text-white">Participants</h2>
    <div className="flex-grow overflow-y-auto custom-scrollbar">
      {participants.length === 0 ? (
        <p className="text-gray-400">No participants yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4"> {/* Example grid for participants */}
          {participants.map((p) => (
            <div key={p.userId} className="bg-gray-700 p-3 rounded-lg text-white">
              {p.userName || `User ${p.userId.substring(0, 5)}`}
              {/* Add voice indicators here later */}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const Room: React.FC = () => {
  const { socket, isConnected, roomId, participants, joinRoom, userId, userName } = useSocketContext();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mood = searchParams.get("mood") || "calm";

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'participants'>('chat');

  // Effect to fetch sessions and attempt to join a room
  useEffect(() => {
    if (!socket || !userId || !userName || !isConnected) {
      console.log('[Room.tsx] Skipping session fetch/join: Socket not connected or user info missing.', { isConnected, userId, userName, socket: !!socket });
      return; // Ensure socket is connected and user info is available
    }

    const fetchSessions = async () => {
      try {
        console.log('[Room.tsx] Fetching sessions...');
        const response = await fetch('http://localhost:5000/api/sessions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ChatSession[] = await response.json();
        setSessions(data);

        let sessionToJoinId: string | null = null;
        let sessionToJoinCategory: string | null = null;

        if (mood && data.length > 0) {
          const sessionForMood = data.find(s => s.category.toLowerCase() === mood.toLowerCase());
          if (sessionForMood) {
            sessionToJoinId = sessionForMood.id;
            sessionToJoinCategory = sessionForMood.category;
            console.log(`[Room.tsx] Found session for mood "${mood}": ${sessionToJoinId}`);
          } else if (data[0]?.id) {
            sessionToJoinId = data[0].id;
            sessionToJoinCategory = data[0].category;
            console.log(`[Room.tsx] No session found for mood "${mood}". Falling back to first available session: ${sessionToJoinId}`);
          }
        } else if (data.length > 0) {
          sessionToJoinId = data[0].id;
          sessionToJoinCategory = data[0].category;
          console.log(`[Room.tsx] No mood specified. Joining first available session: ${sessionToJoinId}`);
        } else {
          console.log("[Room.tsx] No sessions available from backend.");
        }

        if (sessionToJoinId && sessionToJoinId !== activeSessionId) {
          console.log(`[Room.tsx] Attempting to join room via useEffect: ${sessionToJoinId}`);
          setActiveSessionId(sessionToJoinId);
          joinRoom({ roomId: sessionToJoinId, userId: userId, userName: userName, mood: sessionToJoinCategory || "default" });
        } else if (activeSessionId) {
          console.log(`[Room.tsx] Already in session: ${activeSessionId}. Not rejoining.`);
        } else if (!sessionToJoinId && data.length > 0) {
          console.log("[Room.tsx] No specific mood session found and no fallback ID provided initially. Waiting for user interaction.");
        }

      } catch (error) {
        console.error('[Room.tsx] Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [mood, activeSessionId, joinRoom, userId, userName, socket, isConnected]); // Added socket and isConnected to dependencies

  // Handle joining a session when a button is clicked
  const handleJoinSession = useCallback((sessionId: string, sessionCategory: string) => {
    if (!socket || !userId || !userName || !isConnected) {
      console.warn('[Room.tsx] Cannot manually join: Socket not connected or user info missing.', { isConnected, userId, userName, socket: !!socket });
      return;
    }
    if (activeSessionId !== sessionId) {
      console.log(`[Room.tsx] Manually joining session: ${sessionId} (Category: ${sessionCategory})`);
      setActiveSessionId(sessionId);
      joinRoom({ roomId: sessionId, userId: userId, userName: userName, mood: sessionCategory });
    } else {
      console.log(`[Room.tsx] Already in session: ${sessionId}. Not rejoining.`);
    }
  }, [activeSessionId, joinRoom, userId, userName, socket, isConnected]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Your <span className="capitalize text-blue-400">{mood}</span> Room
        </h1>
        <p className="text-lg text-gray-400">
          {isConnected ? 'Connected to chat server' : 'Connecting to chat server...'}
        </p>
      </header>

      {/* Available Rooms Section */}
      <h2 className="text-3xl font-bold text-center text-white mb-6">Available Rooms</h2>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => handleJoinSession(session.id, session.category)}
            className={`px-6 py-3 rounded-xl shadow-md text-lg font-semibold transition-all duration-200
              ${session.id === activeSessionId ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-200'}
              ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={!isConnected}
          >
            {session.category}
          </button>
        ))}
      </div>

      {/* View Toggles for Mobile */}
      <div className="md:hidden flex justify-center gap-4 mb-4">
        <Button
          onClick={() => setCurrentView('participants')}
          variant={currentView === 'participants' ? 'default' : 'outline'}
          className="flex items-center gap-2"
        >
          <Users className="h-5 w-5" /> Participants
        </Button>
        <Button
          onClick={() => setCurrentView('chat')}
          variant={currentView === 'chat' ? 'default' : 'outline'}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-5 w-5" /> Chat
        </Button>
      </div>

      {/* Main Room Layout */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
        {/* Left Side: Participant Grid (shown always on md+ or when currentView is participants) */}
        <div className={`md:col-span-1 ${currentView === 'chat' ? 'hidden md:block' : ''}`}>
          <ParticipantGrid participants={participants} />
        </div>

        {/* Right Side: Real-time Chat Window (shown always on md+ or when currentView is chat) */}
        <div className={`md:col-span-1 h-[calc(80vh)] md:h-full ${currentView === 'participants' ? 'hidden md:block' : ''}`}> {/* Adjust height as needed */}
          <ChatWindow />
        </div>
      </div>

      {/* Footer (Voice controls + chat input - if separate from ChatWindow) */}
      {/* Your voice controls can be placed here or within ParticipantGrid/ChatWindow */}
      {/* Example: <div className="mt-6 text-center">Voice Controls Go Here</div> */}
    </div>
  );
};

export default Room; 