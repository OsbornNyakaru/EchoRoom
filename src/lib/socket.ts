import { io, Socket } from 'socket.io-client';

// Use VITE_SOCKET_URL for WebSocket, fallback to VITE_BACKEND_URL, then localhost for dev
const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname === 'localhost' ? 'ws://localhost:5000' : undefined);

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
}) as Socket;

export default socket;

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('connect_error', (err: Error) => {
  console.error('Socket connection error:', err.message);
});

// In production, set VITE_SOCKET_URL to your deployed backend WebSocket endpoint (e.g. wss://your-backend.onrender.com)