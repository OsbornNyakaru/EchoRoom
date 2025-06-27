import { io, Socket } from 'socket.io-client';

// Use VITE_SOCKET_URL for WebSocket, fallback to VITE_BACKEND_URL, then localhost for dev
const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'http://localhost:5000');

console.log('[Socket] Connecting to:', SOCKET_URL);

// Function to wake up the server before connecting
const wakeUpServer = async (): Promise<boolean> => {
  try {
    console.log('[Socket] Waking up server...');
    const response = await fetch(`${SOCKET_URL}/api/health`, {
      method: 'GET',
      timeout: 10000, // 10 second timeout
    });
    
    if (response.ok) {
      console.log('[Socket] ✅ Server is awake');
      return true;
    } else {
      console.warn('[Socket] ⚠️ Server responded but not healthy:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[Socket] ❌ Failed to wake up server:', error);
    return false;
  }
};

// Create socket with enhanced configuration
const createSocket = () => {
  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    timeout: 30000, // Increased timeout to 30 seconds
    forceNew: false,
    reconnection: true,
    reconnectionDelay: 2000, // Wait 2 seconds before first reconnect
    reconnectionDelayMax: 10000, // Max 10 seconds between reconnects
    reconnectionAttempts: 10, // Try 10 times
    maxReconnectionAttempts: 10,
    // Add ping/pong to keep connection alive
    pingTimeout: 60000,
    pingInterval: 25000,
  }) as Socket;
};

// Initialize socket
const socket = createSocket();

// Enhanced connection handling
socket.on('connect', () => {
  console.log('[Socket] ✅ Connected to WebSocket server with ID:', socket.id);
  console.log('[Socket] Transport:', socket.io.engine?.transport?.name);
  console.log('[Socket] Socket state:', {
    connected: socket.connected,
    disconnected: socket.disconnected,
    id: socket.id
  });
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] ❌ Disconnected from WebSocket server:', reason);
  
  // If disconnected due to server going to sleep, try to wake it up
  if (reason === 'transport close' || reason === 'transport error') {
    console.log('[Socket] 🔄 Server might be sleeping, attempting to wake up...');
    wakeUpServer();
  }
});

socket.on('connect_error', async (err: Error) => {
  console.error('[Socket] ❌ Socket connection error:', err.message);
  console.error('[Socket] Full error:', err);
  
  // If connection fails, try to wake up server
  if (err.message.includes('timeout') || err.message.includes('websocket')) {
    console.log('[Socket] 🔄 Connection timeout detected, trying to wake server...');
    const serverAwake = await wakeUpServer();
    
    if (serverAwake) {
      console.log('[Socket] 🔄 Server is awake, retrying connection...');
      // Socket.io will automatically retry, but we can force it
      setTimeout(() => {
        if (!socket.connected) {
          socket.connect();
        }
      }, 2000);
    }
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('[Socket] 🔄 Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', async (attemptNumber) => {
  console.log('[Socket] 🔄 Reconnection attempt', attemptNumber);
  
  // Try to wake server on every few attempts
  if (attemptNumber % 3 === 1) {
    await wakeUpServer();
  }
});

socket.on('reconnect_error', (error) => {
  console.error('[Socket] ❌ Reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.error('[Socket] ❌ Reconnection failed - all attempts exhausted');
  console.log('[Socket] 🔄 Trying to wake server and create new connection...');
  
  // Last resort: wake server and create new socket
  wakeUpServer().then((awake) => {
    if (awake) {
      setTimeout(() => {
        socket.connect();
      }, 5000);
    }
  });
});

// Debug: Log all events
socket.onAny((eventName, ...args) => {
  console.log(`[Socket] 📡 Event received: ${eventName}`, args);
});

// Export function to manually wake server
export const wakeServer = wakeUpServer;

export default socket;
